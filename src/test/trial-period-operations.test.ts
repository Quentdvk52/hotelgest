import { describe, it, expect, beforeEach } from "vitest";
import { chariowService, DEFAULT_TRIAL_DAYS, TRIAL_START_DATE_ISO } from "../modules/subscription/chariow-service";
import crypto from "crypto";
import { envConfig } from "../lib/config";

describe("Promoter 50-Day Trial Period & Staff Operation Locks", () => {
  beforeEach(() => {
    chariowService.resetState();
  });

  describe("50-Day Trial Initialization", () => {
    it("initializes a 50-day trial for the promoter starting today (2026-11-17)", () => {
      const sub = chariowService.getSubscription("tenant-vignoble-001");
      expect(sub).toBeDefined();
      expect(sub?.isTrial).toBe(true);
      expect(sub?.trialDurationDays).toBe(50);
      expect(sub?.status).toBe("ACTIVE");

      const startDate = new Date(TRIAL_START_DATE_ISO);
      expect(startDate.toISOString().startsWith("2026-11-17")).toBe(true);

      const endDate = new Date(sub!.trialEndDate);
      const expectedEnd = new Date(startDate.getTime() + 50 * 24 * 60 * 60 * 1000);
      expect(endDate.toISOString().startsWith("2027-01-06")).toBe(true);
      expect(endDate.getTime()).toBe(expectedEnd.getTime());
    });

    it("allows operations during the 50-day trial with full feature access", () => {
      const ops = chariowService.canPerformOperations("tenant-vignoble-001");
      expect(ops.allowed).toBe(true);
      expect(ops.isTrial).toBe(true);
      expect(ops.isExpired).toBe(false);
      expect(ops.daysRemaining).toBeGreaterThanOrEqual(49);
      expect(ops.daysRemaining).toBeLessThanOrEqual(50);
      expect(() => chariowService.assertOperationsAllowed("tenant-vignoble-001")).not.toThrow();
    });
  });

  describe("Trial Expiration & Staff Restrictions", () => {
    it("suspends all operations when the 50-day trial has elapsed (daysRemaining = 0)", () => {
      // Simulate trial expiration (50 days elapsed)
      chariowService.setTrialPeriod(0, "tenant-vignoble-001");

      const ops = chariowService.canPerformOperations("tenant-vignoble-001");
      expect(ops.allowed).toBe(false);
      expect(ops.isTrial).toBe(true);
      expect(ops.isExpired).toBe(true);
      expect(ops.daysRemaining).toBe(0);
      expect(ops.status).toBe("EXPIRED");
      expect(ops.reason).toContain("La période d'essai de 50 jours du promoteur est expirée");

      // Verify that assertOperationsAllowed throws with 403 / TRIAL_EXPIRED
      expect(() => chariowService.assertOperationsAllowed("tenant-vignoble-001")).toThrowError(
        /période d'essai de 50 jours/i
      );
    });

    it("preserves login capability while blocking operations (Read-Only Mode)", async () => {
      // Trial is expired
      chariowService.setTrialPeriod(0, "tenant-vignoble-001");

      // 1. Staff login simulation: auth token generation and verification remain fully valid
      const { signSessionToken, verifySessionToken } = await import("../modules/auth/auth-service");
      const staffUser = {
        id: "user-srv-boh",
        email: "serveuse@hotelvignoble.bj",
        fullName: "Afiwa KOUDJO",
        roleCode: "WAITSTAFF",
        roleName: "Serveuse",
        propertyId: "prop-bohicon-001",
        maxDiscount: "0",
        permissions: ["pos:orders:create", "pos:orders:read"],
      };

      const token = signSessionToken(staffUser);
      const verified = verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe("user-srv-boh");
      expect(verified?.roleCode).toBe("WAITSTAFF");

      // 2. But operational mutations are blocked
      const ops = chariowService.canPerformOperations("tenant-vignoble-001");
      expect(ops.allowed).toBe(false);
      expect(ops.isExpired).toBe(true);
    });
  });

  describe("Reactivation via Chariow SaaS Payment", () => {
    it("immediately unlocks full operations upon Chariow payment webhook (1 month)", async () => {
      // 1. Start in expired state
      chariowService.setTrialPeriod(0, "tenant-vignoble-001");
      expect(chariowService.canPerformOperations("tenant-vignoble-001").allowed).toBe(false);

      // 2. Promoter pays 1 Month on Chariow -> webhook is received
      const secret = envConfig.CHARIOW.WEBHOOK_SECRET;
      const payloadObj = {
        event_id: "evt_reactivate_001",
        event_type: "successful.sale",
        data: {
          purchase: {
            id: "sale_chariow_reactivate_100k",
            product_id: "prd_rzhtvh59", // 1 Month
            amount: { value: 100000, currency: "XOF" },
            custom_metadata: { tenant_id: "tenant-vignoble-001" },
          },
        },
      };
      const rawPayload = JSON.stringify(payloadObj);
      const signature = crypto.createHmac("sha256", secret).update(rawPayload).digest("hex");

      const webhookResult = await chariowService.processWebhook(rawPayload, signature);
      expect(webhookResult.success).toBe(true);

      // 3. Subscription is now a paid commercial license and operations are active
      const sub = chariowService.getSubscription("tenant-vignoble-001");
      expect(sub?.isTrial).toBe(false);
      expect(sub?.status).toBe("ACTIVE");
      expect(sub?.planCode).toBe("MONTHLY_100K");

      const ops = chariowService.canPerformOperations("tenant-vignoble-001");
      expect(ops.allowed).toBe(true);
      expect(ops.isTrial).toBe(false);
      expect(ops.isExpired).toBe(false);
    });

    it("immediately unlocks operations upon Chariow annual payment (-30% discount)", async () => {
      chariowService.setTrialPeriod(0, "tenant-vignoble-001");
      expect(chariowService.canPerformOperations("tenant-vignoble-001").allowed).toBe(false);

      const secret = envConfig.CHARIOW.WEBHOOK_SECRET;
      const payloadObj = {
        event_id: "evt_reactivate_annual_002",
        event_type: "successful.sale",
        data: {
          purchase: {
            id: "sale_chariow_annual_840k",
            product_id: "prd_taderm68", // 12 Months
            amount: { value: 840000, currency: "XOF" },
            custom_metadata: { tenant_id: "tenant-vignoble-001" },
          },
        },
      };
      const rawPayload = JSON.stringify(payloadObj);
      const signature = `sha256=${crypto.createHmac("sha256", secret).update(rawPayload).digest("hex")}`;

      const webhookResult = await chariowService.processWebhook(rawPayload, signature);
      expect(webhookResult.success).toBe(true);

      const ops = chariowService.canPerformOperations("tenant-vignoble-001");
      expect(ops.allowed).toBe(true);
      expect(ops.isTrial).toBe(false);
      expect(ops.status).toBe("ACTIVE");
    });
  });
});
