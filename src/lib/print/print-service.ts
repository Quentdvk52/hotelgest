/**
 * Service Universel d'Impression pour HotelGest
 * Prise en charge des imprimantes standard A4, thermiques POS (80mm / 58mm),
 * pilotes réseau, Wi-Fi, USB, Bluetooth et export PDF.
 */

export type PrintFormat = "A4" | "THERMAL_80MM" | "THERMAL_58MM";

export interface PrinterDevice {
  id: string;
  name: string;
  type: "SYSTEM_A4" | "THERMAL_POS_80" | "THERMAL_POS_58" | "BLUETOOTH_MOBILE" | "PDF_EXPORT";
  status: "CONNECTED" | "READY" | "AVAILABLE";
  interface: "SYSTEM_DRIVER" | "ESC_POS" | "WEB_BLUETOOTH" | "WEB_USB" | "BROWSER_PRINT";
}

export const KNOWN_PRINTER_PROFILES: PrinterDevice[] = [
  {
    id: "sys-default",
    name: "Imprimante Système par Défaut (Canon, HP, Epson, Brother - A4)",
    type: "SYSTEM_A4",
    status: "READY",
    interface: "SYSTEM_DRIVER",
  },
  {
    id: "thermal-80",
    name: "Imprimante Thermique Ticket Caisse 80mm (Epson TM-T, Xprinter, Bixolon, Star)",
    type: "THERMAL_POS_80",
    status: "READY",
    interface: "ESC_POS",
  },
  {
    id: "thermal-58",
    name: "Imprimante Portable Mobile 58mm (Bluetooth / Mini-POS de poche)",
    type: "THERMAL_POS_58",
    status: "READY",
    interface: "ESC_POS",
  },
  {
    id: "pdf-doc",
    name: "Générateur PDF / Archivage Numérique Haute Définition",
    type: "PDF_EXPORT",
    status: "READY",
    interface: "BROWSER_PRINT",
  },
];

/**
 * Lance l'impression universelle via le moteur d'impression du navigateur
 * avec injection automatique des feuilles de style adaptées au format choisi.
 */
export function executeUniversalPrint(elementHtml: string, format: PrintFormat = "A4", documentTitle: string = "Facture - Hôtel Le Vignoble"): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      resolve(true);
      return;
    }

    const formatStyles = getFormatPrintStyles(format);

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #fff;
            color: #111;
          }
          ${formatStyles}
        </style>
      </head>
      <body>
        <div id="print-root">
          ${elementHtml}
        </div>
      </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve(true);
        } catch (e) {
          console.error("Erreur exécution print iframe :", e);
          window.print();
          resolve(true);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 400);
    };
  });
}

/**
 * Feuilles de styles CSS @media print optimisées selon le matériel cible
 */
function getFormatPrintStyles(format: PrintFormat): string {
  if (format === "THERMAL_80MM") {
    return `
      @page {
        size: 80mm auto;
        margin: 2mm;
      }
      body {
        width: 76mm;
        font-size: 11px;
        line-height: 1.25;
        padding: 2mm;
      }
      .no-print { display: none !important; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 2px 0; text-align: left; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .border-b { border-bottom: 1px dashed #444; }
      .border-t { border-top: 1px dashed #444; }
      .font-bold { font-weight: bold; }
      .barcode-box, .qr-box { display: flex; justify-content: center; margin: 4px 0; }
    `;
  }

  if (format === "THERMAL_58MM") {
    return `
      @page {
        size: 58mm auto;
        margin: 1.5mm;
      }
      body {
        width: 54mm;
        font-size: 9.5px;
        line-height: 1.2;
        padding: 1mm;
      }
      .no-print { display: none !important; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 1.5px 0; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .border-b { border-bottom: 1px dashed #444; }
      .border-t { border-top: 1px dashed #444; }
      .font-bold { font-weight: bold; }
    `;
  }

  // Format A4 Standard
  return `
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    body {
      width: 100%;
      font-size: 12px;
      line-height: 1.4;
      color: #1a1a1a;
    }
    .no-print { display: none !important; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f4; font-weight: bold; padding: 6px 8px; border: 1px solid #e7e5e4; }
    td { padding: 6px 8px; border: 1px solid #e7e5e4; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #184f28; padding-bottom: 10px; margin-bottom: 15px; }
  `;
}

/**
 * Générateur de trames brutes ESC/POS pour imprimantes thermiques de caisse
 */
export function generateEscPosReceipt(data: {
  title: string;
  ifu: string;
  nim: string;
  uid: string;
  items: { name: string; qty: number; price: number; lineTotal: number }[];
  totalTtc: number;
  qrCodeUrl: string;
}): Uint8Array {
  const ESC = 0x1b;
  const GS = 0x1d;

  const buffer: number[] = [
    ESC, 0x40,             // Init printer
    ESC, 0x61, 0x01,       // Align center
    ESC, 0x21, 0x30,       // Double height & double width
  ];

  // Encoder texte helper
  const addText = (text: string) => {
    for (let i = 0; i < text.length; i++) {
      buffer.push(text.charCodeAt(i));
    }
    buffer.push(0x0a); // Newline
  };

  addText("HOTEL LE VIGNOBLE");
  buffer.push(ESC, 0x21, 0x00); // Standard text
  addText("FACTURE NORMALISEE (DGI BENIN)");
  addText(`IFU : ${data.ifu}`);
  addText(`NIM : ${data.nim}`);
  addText(`UID : ${data.uid}`);
  addText("--------------------------------");

  buffer.push(ESC, 0x61, 0x00); // Align left
  for (const it of data.items) {
    const total = it.lineTotal !== undefined ? it.lineTotal : (it as any).price ? (it as any).price * it.qty : 0;
    addText(`${it.name} x${it.qty} : ${Number(total).toLocaleString("fr-FR")} XOF`);
  }

  addText("--------------------------------");
  buffer.push(ESC, 0x61, 0x02); // Align right
  buffer.push(ESC, 0x21, 0x20); // Bold double height
  addText(`TOTAL TTC: ${data.totalTtc.toLocaleString("fr-FR")} XOF`);

  buffer.push(ESC, 0x21, 0x00); // Normal
  buffer.push(ESC, 0x61, 0x01); // Align center
  addText("Merci de votre visite !");
  addText(data.qrCodeUrl);

  buffer.push(0x0a, 0x0a, 0x0a);
  buffer.push(GS, 0x56, 0x42, 0x00); // Cut paper

  return new Uint8Array(buffer);
}
