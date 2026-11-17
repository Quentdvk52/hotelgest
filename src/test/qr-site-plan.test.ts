import { describe, it, expect, beforeEach } from "vitest";
import { qrService } from "../modules/pos/qr-service";
import { generateQrMatrix, generateQrSvgString } from "../lib/qr/qr-generator";

describe("Promoter QR Site Plan & QR Matrix Generator", () => {
  beforeEach(() => {
    qrService.resetState();
  });

  it("should generate a valid QR matrix with correct dimensions and finder patterns", () => {
    const matrix = generateQrMatrix("https://hotelgestion.vercel.app/order/hg_table_test_123");
    expect(matrix).toBeDefined();
    expect(matrix.length).toBeGreaterThanOrEqual(29);
    expect(matrix[0].length).toBe(matrix.length);
    // Finder pattern at top-left should have dark modules
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][6]).toBe(true);
    expect(matrix[6][0]).toBe(true);
  });

  it("should produce valid SVG containing viewBox and path elements", () => {
    const svg = generateQrSvgString("https://hotelgestion.vercel.app/order/test");
    expect(svg).toContain("<svg");
    expect(svg).toContain("viewBox=");
    expect(svg).toContain("<path");
    expect(svg).toContain("</svg>");
  });

  it("should have predefined zones and tables for all establishments", () => {
    const zones = qrService.listZones();
    expect(zones.length).toBeGreaterThanOrEqual(8);

    const bohiconZones = qrService.listZones("prop-bohicon-001");
    expect(bohiconZones.length).toBeGreaterThanOrEqual(5);

    const tables = qrService.listDiningTables();
    expect(tables.length).toBeGreaterThanOrEqual(10);
  });

  it("should have pre-generated QR codes for ALL hotel rooms across all sites", () => {
    const rooms = qrService.listRoomUnits();
    expect(rooms.length).toBeGreaterThanOrEqual(10);

    // Each room must have its corresponding QR code
    rooms.forEach((room) => {
      const qr = qrService.getQrForRoom(room.id);
      expect(qr).toBeDefined();
      expect(qr?.token).toContain("hg_room_");
      expect(qr?.directUrl).toBe(`/order/${qr?.token}`);
    });
  });

  it("should allow dynamic zone and table creation with auto-assigned QR code", () => {
    const newZone = qrService.createZone(
      "prop-bohicon-001",
      "Piscine Night Club VIP",
      "VIP",
      50,
      "Zone VIP bord piscine"
    );
    expect(newZone.id).toBeDefined();
    expect(newZone.name).toBe("Piscine Night Club VIP");

    const { table, qr } = qrService.createTableWithQr(
      "prop-bohicon-001",
      "Table VIP 99",
      newZone.name,
      newZone.spaceType,
      8,
      newZone.id
    );

    expect(table.tableNumber).toBe("Table VIP 99");
    expect(qr).toBeDefined();
    expect(qr.token).toContain("hg_table_");
    expect(qrService.resolveToken(qr.token)).toEqual(qr);
  });

  it("should successfully resolve and revoke QR tokens", () => {
    const rooms = qrService.listRoomUnits("prop-bohicon-001");
    const roomQr = qrService.getQrForRoom(rooms[0].id);
    expect(roomQr).toBeDefined();

    const resolved = qrService.resolveToken(roomQr!.token);
    expect(resolved?.unitId).toBe(rooms[0].id);

    // Revocation
    const revoked = qrService.revokeToken(roomQr!.token);
    expect(revoked).toBe(true);
    expect(qrService.resolveToken(roomQr!.token)).toBeNull();
  });
});
