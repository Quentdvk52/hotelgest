import { describe, it, expect, beforeEach } from "vitest";
import { syscohadaService } from "../modules/accounting/syscohada-service";
import { chariowService } from "../modules/subscription/chariow-service";
import { envConfig } from "../lib/config";
import crypto from "crypto";

describe("SYSCOHADA Accounting & Chariow SaaS Billing", () => {
  beforeEach(() => {
    syscohadaService.resetState();
    chariowService.resetState();
  });

  describe("SYSCOHADA Journal & Balanced Exports", () => {
    it("generates perfectly balanced Debit = Credit journal entries", async () => {
      // Record a lodging sale of 35 000 XOF paid by Mobile Money
      syscohadaService.recordTransaction({
        propertyId: "prop-bohicon-001",
        date: "2026-12-01",
        reference: "FOL-001",
        label: "Hébergement M. Dossou",
        category: "ROOM",
        amountXof: 35000,
        paymentMethod: "MOBILE_MONEY",
      });

      // Record a catering sale of 150 000 XOF paid via Bank Transfer
      syscohadaService.recordTransaction({
        propertyId: "prop-bohicon-001",
        date: "2026-12-01",
        reference: "TRT-001",
        label: "Traiteur Conférence",
        category: "CATERING",
        amountXof: 150000,
        paymentMethod: "BANK_TRANSFER",
      });

      const journal = syscohadaService.getJournalEntries("prop-bohicon-001");
      expect(journal.length).toBeGreaterThanOrEqual(4);

      const totalDebit = journal.reduce((sum, e) => sum + e.debitXof, 0);
      const totalCredit = journal.reduce((sum, e) => sum + e.creditXof, 0);

      expect(totalDebit).toBe(totalCredit);
      expect(totalDebit).toBe(185000);

      // Verify SYSCOHADA accounts
      const accountsUsed = journal.map((e) => e.accountNumber);
      expect(accountsUsed).toContain("7061"); // Ventes hébergement
      expect(accountsUsed).toContain("7064"); // Prestations traiteur & matériel
      expect(accountsUsed).toContain("531");  // Mobile Money
      expect(accountsUsed).toContain("521");  // Banques
    });

    it("exports valid balanced CSV format", async () => {
      syscohadaService.recordTransaction({
        propertyId: "prop-bohicon-001",
        date: "2026-12-01",
        reference: "FOL-002",
        label: "Restauration",
        category: "RESTAURANT",
        amountXof: 20000,
        paymentMethod: "CASH",
      });

      const csv = syscohadaService.exportCsv("prop-bohicon-001");
      expect(csv).toContain("Date,Journal,Compte,Libelle,Piece,Debit,Credit");
      expect(csv).toContain("7062"); // Restauration
      expect(csv).toContain("571");  // Caisse
    });
  });

  describe("Chariow SaaS Billing Integration", () => {
    const secret = envConfig.CHARIOW.WEBHOOK_SECRET;

    function signPayload(body: string): string {
      return crypto.createHmac("sha256", secret).update(body).digest("hex");
    }

    it("verifies and processes genuine Chariow subscription webhooks", async () => {
      const payloadObj = {
        event_id: "evt_chariow_test_001",
        event_type: "subscription.created",
        tenant_id: "tenant-vignoble-001",
        plan_code: "MONTHLY_100K",
        amount_xof: 100000,
        timestamp: Math.floor(Date.now() / 1000),
      };
      const rawPayload = JSON.stringify(payloadObj);
      const signature = signPayload(rawPayload);

      const result = await chariowService.processWebhook(rawPayload, signature);
      expect(result.success).toBe(true);
      expect(result.status).toBe("ACTIVE");

      const sub = chariowService.getSubscription("tenant-vignoble-001");
      expect(sub?.status).toBe("ACTIVE");
      expect(sub?.amountXof).toBe(100000);
    });

    it("rejects forged or tampered webhooks (Review Focus #4)", async () => {
      const rawPayload = JSON.stringify({ event_id: "evt_fake", event_type: "subscription.created" });
      const fakeSignature = "invalid_signature_hash";

      await expect(
        chariowService.processWebhook(rawPayload, fakeSignature)
      ).rejects.toThrow("INVALID_SIGNATURE");
    });

    it("rejects duplicated webhook events idempotently", async () => {
      const payloadObj = {
        event_id: "evt_idempotent_test_002",
        event_type: "subscription.renewed",
        tenant_id: "tenant-vignoble-001",
        plan_code: "ANNUAL_840K",
        amount_xof: 840000,
      };
      const rawPayload = JSON.stringify(payloadObj);
      const signature = signPayload(rawPayload);

      // First run succeeds
      await chariowService.processWebhook(rawPayload, signature);

      // Replayed run must be detected as duplicate
      const replay = await chariowService.processWebhook(rawPayload, signature);
      expect(replay.isDuplicate).toBe(true);
    });

    it("processes webhooks with sha256= prefix and resolves Chariow product IDs (prd_n0s8gwxg for 6 months)", async () => {
      const payloadObj = {
        event_id: "evt_pulse_6months_001",
        event_type: "successful.sale",
        data: {
          purchase: {
            id: "sale_chariow_semiannual_123",
            product_id: "prd_n0s8gwxg", // 6 Months plan ID
            amount: { value: 540000, currency: "XOF" },
            custom_metadata: { tenant_id: "tenant-vignoble-001" },
          },
        },
      };
      const rawPayload = JSON.stringify(payloadObj);
      const signature = `sha256=${signPayload(rawPayload)}`;

      const result = await chariowService.processWebhook(rawPayload, signature);
      expect(result.success).toBe(true);
      expect(result.planCode).toBe("SEMIANNUAL_540K");

      const sub = chariowService.getSubscription("tenant-vignoble-001");
      expect(sub?.status).toBe("ACTIVE");
      expect(sub?.planCode).toBe("SEMIANNUAL_540K");
      expect(sub?.amountXof).toBe(540000);
      expect(sub?.checkoutUrl).toBe("https://narcpdfi.mychariow.market/prd_n0s8gwxg");
    });

    it("processes webhooks with annual product ID (prd_taderm68 for 12 months with 30% discount)", async () => {
      const payloadObj = {
        event_id: "evt_pulse_annual_001",
        event_type: "successful.sale",
        data: {
          purchase: {
            id: "sale_chariow_annual_456",
            product_id: "prd_taderm68", // 12 Months plan ID
            amount: { value: 840000, currency: "XOF" },
            custom_metadata: { tenant_id: "tenant-vignoble-001" },
          },
        },
      };
      const rawPayload = JSON.stringify(payloadObj);
      const signature = signPayload(rawPayload);

      const result = await chariowService.processWebhook(rawPayload, signature);
      expect(result.success).toBe(true);
      expect(result.planCode).toBe("ANNUAL_840K");

      const sub = chariowService.getSubscription("tenant-vignoble-001");
      expect(sub?.status).toBe("ACTIVE");
      expect(sub?.planCode).toBe("ANNUAL_840K");
      expect(sub?.amountXof).toBe(840000);
      expect(sub?.checkoutUrl).toBe("https://narcpdfi.mychariow.market/prd_taderm68");
    });

    it("generates correct direct Chariow checkout URLs for all 3 subscription plans", async () => {
      const monthly = await chariowService.createCheckoutSession("tenant-vignoble-001", "MONTHLY_100K");
      expect(monthly.checkoutUrl).toBe("https://narcpdfi.mychariow.market/prd_rzhtvh59");
      expect(monthly.amountXof).toBe(100000);

      const semiannual = await chariowService.createCheckoutSession("tenant-vignoble-001", "SEMIANNUAL_540K");
      expect(semiannual.checkoutUrl).toBe("https://narcpdfi.mychariow.market/prd_n0s8gwxg");
      expect(semiannual.amountXof).toBe(540000);

      const annual = await chariowService.createCheckoutSession("tenant-vignoble-001", "ANNUAL_840K");
      expect(annual.checkoutUrl).toBe("https://narcpdfi.mychariow.market/prd_taderm68");
      expect(annual.amountXof).toBe(840000);
    });
  });
});
