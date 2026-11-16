import { describe, it, expect } from "vitest";
import {
  calculateBeninTaxes,
  normalizeInvoiceWithEmecef,
  EmecefInvoiceItem,
} from "../lib/fiscal/emecef-service";
import {
  generateEscPosReceipt,
  KNOWN_PRINTER_PROFILES,
} from "../lib/print/print-service";

describe("Fiscal e-MECeF DGI Bénin Engine", () => {
  it("calculates Benin VAT correctly for 18% standard goods (Groupe B)", () => {
    const items: EmecefInvoiceItem[] = [
      { name: "Chambre Supérieure Bohicon", price: 47200, quantity: 1, taxGroup: "B" },
    ];

    const result = calculateBeninTaxes(items);
    // 47200 TTC with 18% VAT: HT = 47200 / 1.18 = 40000, VAT = 7200
    expect(result.totalTtc).toBe(47200);
    expect(result.totalHt).toBe(40000);
    expect(result.totalVat).toBe(7200);
    expect(result.taxBreakdown).toHaveLength(1);
    expect(result.taxBreakdown[0].group).toBe("B");
    expect(result.taxBreakdown[0].rate).toBe(0.18);
  });

  it("calculates 0% for tax exempt items (Groupe A)", () => {
    const items: EmecefInvoiceItem[] = [
      { name: "Prestation Exonérée Loi de Finances", price: 50000, quantity: 1, taxGroup: "A" },
    ];

    const result = calculateBeninTaxes(items);
    expect(result.totalTtc).toBe(50000);
    expect(result.totalHt).toBe(50000);
    expect(result.totalVat).toBe(0);
    expect(result.taxBreakdown[0].group).toBe("A");
  });

  it("normalizes an invoice producing valid UID, NIM, codeMECeF, and DGI verify URL", async () => {
    const payload = {
      ifu: "0201910839213",
      type: "FV" as const,
      client: {
        name: "Société des Brasseries du Bénin (SOBEBRA)",
        ifu: "1234567890123",
      },
      operator: { name: "Marcelin AGBIDINOUKOUN" },
      payment: [{ name: "MOMO" as const, amount: 94400 }],
      items: [
        { name: "Suite Royale Bohicon (Nuitée)", price: 47200, quantity: 2, taxGroup: "B" as const },
      ],
      reference: "FAC-TEST-001",
    };

    const normalized = await normalizeInvoiceWithEmecef(payload);
    expect(normalized.uid).toBeDefined();
    expect(normalized.uid).toContain("FV-");
    expect(normalized.nim).toBeDefined();
    expect(normalized.codeMECeF).toBeDefined();
    expect(normalized.qrCode).toContain("https://facture.dgi.bj/v?ifu=0201910839213");
    expect(normalized.totalTtcXof).toBe(94400);
  });
});

describe("Universal Print Drivers & ESC/POS Generation", () => {
  it("provides profiles for A4, Thermal 80mm POS, and Thermal 58mm", () => {
    expect(KNOWN_PRINTER_PROFILES.length).toBeGreaterThanOrEqual(3);
    const types = KNOWN_PRINTER_PROFILES.map((p) => p.type);
    expect(types).toContain("SYSTEM_A4");
    expect(types).toContain("THERMAL_POS_80");
    expect(types).toContain("THERMAL_POS_58");
  });

  it("generates valid ESC/POS byte sequence with cutter and cash drawer commands", () => {
    const bytes = generateEscPosReceipt({
      title: "FACTURE NORMALISÉE",
      ifu: "0201910839213",
      nim: "MCF-BOH-0201-01",
      uid: "FV-0839213-20261116-A1B2C3",
      items: [
        { name: "Chambre 101", qty: 1, price: 45000, lineTotal: 45000 },
        { name: "Vin Rouge St-Emilion", qty: 1, price: 35000, lineTotal: 35000 },
      ],
      totalTtc: 80000,
      qrCodeUrl: "https://facture.dgi.bj/v?test=1",
    });

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(50);
  });
});
