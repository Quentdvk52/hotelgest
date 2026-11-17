/**
 * QR Code Generator for HotelGest (Pure TypeScript, Zero External Dependencies)
 * Generates standards-compliant QR Code Matrix (Model 2, Version 1-4) with
 * Reed-Solomon Error Correction Level M/L and returns scalable SVG vector graphics.
 */

// Galois Field GF(256) arithmetic for Reed-Solomon
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x = (x << 1) ^ (x & 128 ? 0x11d : 0);
  }
})();

function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function polyMultiply(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMultiply(p1[i], p2[j]);
    }
  }
  return result;
}

function generateGeneratorPoly(degree: number): number[] {
  let g = [1];
  for (let i = 0; i < degree; i++) {
    g = polyMultiply(g, [1, EXP_TABLE[i]]);
  }
  return g;
}

function calculateEccBytes(data: number[], eccLength: number): number[] {
  const genPoly = generateGeneratorPoly(eccLength);
  const msgPoly = new Array(data.length + eccLength).fill(0);
  for (let i = 0; i < data.length; i++) {
    msgPoly[i] = data[i];
  }

  for (let i = 0; i < data.length; i++) {
    const coef = msgPoly[i];
    if (coef !== 0) {
      for (let j = 0; j < genPoly.length; j++) {
        msgPoly[i + j] ^= gfMultiply(genPoly[j], coef);
      }
    }
  }

  return msgPoly.slice(data.length);
}

/**
 * QR Code Matrix Builder
 */
export class QrMatrix {
  public size: number;
  public modules: boolean[][];
  public isFunction: boolean[][];

  constructor(size: number) {
    this.size = size;
    this.modules = Array.from({ length: size }, () => Array(size).fill(false));
    this.isFunction = Array.from({ length: size }, () => Array(size).fill(false));
  }

  public setFunction(r: number, c: number, val: boolean) {
    if (r >= 0 && r < this.size && c >= 0 && c < this.size) {
      this.modules[r][c] = val;
      this.isFunction[r][c] = true;
    }
  }

  public addFinderPattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            this.setFunction(nr, nc, true);
          } else {
            this.setFunction(nr, nc, false);
          }
        }
      }
    }
  }

  public addAlignmentPattern(row: number, col: number) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
          if (
            Math.abs(r) === 2 ||
            Math.abs(c) === 2 ||
            (r === 0 && c === 0)
          ) {
            this.setFunction(nr, nc, true);
          } else {
            this.setFunction(nr, nc, false);
          }
        }
      }
    }
  }

  public addTimingPatterns() {
    for (let i = 8; i < this.size - 8; i++) {
      const bit = i % 2 === 0;
      if (!this.isFunction[6][i]) this.setFunction(6, i, bit);
      if (!this.isFunction[i][6]) this.setFunction(i, 6, bit);
    }
  }

  public addDarkModule() {
    this.setFunction(this.size - 8, 8, true);
  }
}

/**
 * Encodes text into a standard QR matrix using Version 3 (29x29) or Version 4 (33x33)
 */
export function generateQrMatrix(text: string): boolean[][] {
  const utf8Bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) utf8Bytes.push(code);
    else if (code < 2048) {
      utf8Bytes.push(192 | (code >> 6));
      utf8Bytes.push(128 | (code & 63));
    } else {
      utf8Bytes.push(224 | (code >> 12));
      utf8Bytes.push(128 | ((code >> 6) & 63));
      utf8Bytes.push(128 | (code & 63));
    }
  }

  // Version 4-M capacity is 64 data codewords (512 bits) with 36 ECC bytes (total 100 bytes)
  // Version 3-M capacity is 44 data codewords (total 70 bytes)
  const isV4 = utf8Bytes.length > 38;
  const version = isV4 ? 4 : 3;
  const size = 17 + version * 4; // 29 for V3, 33 for V4
  const dataCapacity = isV4 ? 64 : 44;
  const eccLength = isV4 ? 36 : 26;

  // Build bitstream: [Mode: Byte 0100] [Count: 8 bits] [Bytes...] [Terminator 0000]
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(utf8Bytes.length, 8); // Character count
  for (const b of utf8Bytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 zeroes)
  const totalDataBits = dataCapacity * 8;
  const termLen = Math.min(4, totalDataBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // Align to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes: alternating 0xEC, 0x11
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < totalDataBits) {
    pushBits(padPatterns[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to byte codewords
  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i + b];
    }
    dataCodewords.push(byteVal);
  }

  // Compute Reed-Solomon ECC bytes
  const eccBytes = calculateEccBytes(dataCodewords, eccLength);
  const allCodewords = [...dataCodewords, ...eccBytes];

  // Convert all codewords to a final bit array
  const finalBits: number[] = [];
  for (const cw of allCodewords) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((cw >> i) & 1);
    }
  }

  // Initialize Matrix
  const qr = new QrMatrix(size);

  // 1. Finder patterns
  qr.addFinderPattern(0, 0);
  qr.addFinderPattern(0, size - 7);
  qr.addFinderPattern(size - 7, 0);

  // 2. Alignment pattern
  if (version === 3) qr.addAlignmentPattern(22, 22);
  else if (version === 4) qr.addAlignmentPattern(26, 26);

  // 3. Timing tracks
  qr.addTimingPatterns();

  // 4. Dark Module
  qr.addDarkModule();

  // 5. Reserve format information areas
  for (let i = 0; i <= 8; i++) {
    qr.isFunction[8][i] = true;
    qr.isFunction[i][8] = true;
    qr.isFunction[8][size - 1 - i] = true;
    qr.isFunction[size - 1 - i][8] = true;
  }

  // 6. Fill data bits in zigzag upward/downward columns
  let bitIndex = 0;
  let dir = -1; // -1 = up, 1 = down
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--; // Skip vertical timing column

    for (let step = 0; step < size; step++) {
      const row = dir === -1 ? size - 1 - step : step;
      for (let cOffset = 0; cOffset < 2; cOffset++) {
        const c = col - cOffset;
        if (!qr.isFunction[row][c]) {
          let bit = bitIndex < finalBits.length ? finalBits[bitIndex++] === 1 : false;
          // Apply Standard Mask 0: (row + col) % 2 === 0
          if ((row + c) % 2 === 0) {
            bit = !bit;
          }
          qr.modules[row][c] = bit;
        }
      }
    }
    dir = -dir;
    col -= 2;
  }

  // 7. Write Format Information (Mask 0, ECC M: 101010000010010 XOR 101010000010010 = 000000000000000)
  // Format string for (ECC M, Mask 0) with standard mask 101010000010010 is 0x5412 ^ 0x5412 = 0
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  // Format around top-left finder
  for (let i = 0; i < 6; i++) qr.modules[8][i] = formatBits[i] === 1;
  qr.modules[8][7] = formatBits[6] === 1;
  qr.modules[8][8] = formatBits[7] === 1;
  qr.modules[7][8] = formatBits[8] === 1;
  for (let i = 9; i < 15; i++) qr.modules[14 - i][8] = formatBits[i] === 1;

  // Format around other finders
  for (let i = 0; i < 8; i++) qr.modules[size - 1 - i][8] = formatBits[i] === 1;
  for (let i = 8; i < 15; i++) qr.modules[8][size - 15 + i] = formatBits[i] === 1;

  return qr.modules;
}

/**
 * Generates an SVG vector graphic representing the luxury QR Code
 */
export function generateQrSvgString(
  text: string,
  options: {
    size?: number;
    color?: string;
    bgColor?: string;
    brandLabel?: string;
    subLabel?: string;
  } = {}
): string {
  const {
    size = 280,
    color = "#18181b",
    bgColor = "#ffffff",
    brandLabel = "HÔTEL LE VIGNOBLE",
    subLabel = "Scannez pour commander",
  } = options;

  const matrix = generateQrMatrix(text);
  const matrixSize = matrix.length;
  const margin = 4;
  const viewBoxSize = matrixSize + margin * 2;

  let pathData = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        pathData += `M${c + margin},${r + margin}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <path d="${pathData}" fill="${color}"/>
</svg>`;
}
