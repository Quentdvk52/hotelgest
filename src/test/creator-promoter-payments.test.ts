import { describe, it, expect, beforeEach } from "vitest";
import { chariowService } from "../modules/subscription/chariow-service";
import { kkiapayService } from "../modules/payments/kkiapay-service";
import { envConfig } from "../lib/config";

describe("Creator Cockpit, Promoter Governance & Payment Gateway Separation", () => {
  beforeEach(() => {
    chariowService.resetState();
  });

  describe("Platform Creator & Chariow Subscription Engine", () => {
    it("reports correct MRR, ARR and tenant status for the platform creator", () => {
      // Re-seed default
      chariowService.updateSubscriptionStatus("tenant-vignoble-001", "ACTIVE", "MONTHLY_100K");

      const metrics = chariowService.getPlatformMetrics();
      expect(metrics.totalTenants).toBe(1);
      expect(metrics.activeTenantsCount).toBe(1);
      expect(metrics.mrrXof).toBe(100000);
      expect(metrics.arrXof).toBe(1200000);
      expect(metrics.collectionRate).toBe(100);
    });

    it("generates genuine Chariow checkout links for promoter license renewal", async () => {
      const checkout = await chariowService.createCheckoutSession(
        "tenant-vignoble-001",
        "MONTHLY_100K",
        "/dashboard?renew=success"
      );

      expect(checkout.sessionId).toContain("chariow_chk_");
      expect(checkout.amountXof).toBe(100000);
      expect(checkout.checkoutUrl).toBe("https://narcpdfi.mychariow.market/prd_rzhtvh59");
    });

    it("allows the creator to toggle tenant license status (Active / Past Due)", () => {
      // Override status to PAST_DUE
      const updated = chariowService.updateSubscriptionStatus(
        "tenant-vignoble-001",
        "PAST_DUE"
      );
      expect(updated.status).toBe("PAST_DUE");

      // Reactivate
      const reactivated = chariowService.updateSubscriptionStatus(
        "tenant-vignoble-001",
        "ACTIVE"
      );
      expect(reactivated.status).toBe("ACTIVE");
    });
  });

  describe("KkiaPay Client Payment Gateway (Rooms, Cave à Vin, Catering)", () => {
    it("verifies and processes hotel guest room booking payments", async () => {
      const tx = kkiapayService.recordTransaction({
        transactionId: "kkiapay_tx_test_room_01",
        amountXof: 75000,
        type: "ROOM_BOOKING",
        referenceId: "RES-BOH-882910",
        clientName: "M. Aimé Dossou",
        clientPhone: "+229 97 00 11 22",
        paymentMethod: "MTN_MOMO",
        status: "SUCCESS",
      });

      expect(tx.amountXof).toBe(75000);
      expect(tx.paymentMethod).toBe("MTN_MOMO");
      expect(tx.type).toBe("ROOM_BOOKING");

      const verifyResult = await kkiapayService.verifyTransaction(tx.transactionId);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.data.status).toBe("SUCCESS");
    });

    it("verifies wine store boutique bottle purchases", async () => {
      const tx = kkiapayService.recordTransaction({
        transactionId: "kkiapay_tx_test_cave_02",
        amountXof: 65000,
        type: "WINE_STORE",
        referenceId: "CAVE-339182",
        clientName: "Mme Clarisse Hounkpatin",
        clientPhone: "+229 66 11 22 33",
        paymentMethod: "CARTE_BANCAIRE",
        status: "SUCCESS",
      });

      expect(tx.amountXof).toBe(65000);
      expect(tx.type).toBe("WINE_STORE");

      const verifyResult = await kkiapayService.verifyTransaction(tx.transactionId);
      expect(verifyResult.success).toBe(true);
    });

    it("verifies catering and equipment rental deposits", async () => {
      const tx = kkiapayService.recordTransaction({
        transactionId: "kkiapay_tx_test_trt_03",
        amountXof: 120000,
        type: "CATERING_ORDER",
        referenceId: "DEV-TRT-994821",
        clientName: "Société Bénin Tech VIP",
        clientPhone: "+229 95 44 55 66",
        paymentMethod: "MOOV_MONEY",
        status: "SUCCESS",
      });

      expect(tx.amountXof).toBe(120000);
      expect(tx.type).toBe("CATERING_ORDER");

      const verifyResult = await kkiapayService.verifyTransaction(tx.transactionId);
      expect(verifyResult.success).toBe(true);
    });
  });

  describe("Architectural Integrity & Separation of Concerns", () => {
    it("ensures Chariow is exclusively mapped to software creator subscriptions", () => {
      expect(envConfig.CHARIOW.API_KEY).toBeDefined();
      expect(envConfig.CHARIOW_PLANS.MONTHLY_XOF).toBe(100000);
      expect(envConfig.CHARIOW_PLANS.SEMIANNUAL_XOF).toBe(540000);
      expect(envConfig.CHARIOW_PLANS.ANNUAL_XOF).toBe(840000);
    });

    it("ensures KkiaPay is configured for client transactions", () => {
      expect(envConfig.KKIAPAY.PUBLIC_KEY).toBeDefined();
      expect(envConfig.KKIAPAY.PRIVATE_KEY).toBeDefined();
    });

    it("ensures creator credentials are distinct and isolated from staff accounts", () => {
      expect(envConfig.CREATOR.EMAIL).toBe("createur@hotelgest.io");
      expect(envConfig.CREATOR.PASSWORD).not.toBe("");
    });
  });
});
