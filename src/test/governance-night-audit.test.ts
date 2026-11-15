import { describe, it, expect, beforeEach } from "vitest";
import { discountService } from "../modules/governance/discount-service";
import { nightAuditService } from "../modules/night-audit/audit-service";
import { TenantContext } from "../lib/types/common";

describe("Governance — Discount Approval & Night Audit", () => {
  const receptionistContext: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-rec-boh",
    roles: ["RECEPTIONIST"],
    permissions: ["discounts:request"],
  };

  const managerContext: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-dir-boh",
    roles: ["PROPERTY_MANAGER"],
    permissions: ["discounts:request", "discounts:approve", "night_audit:run"],
  };

  beforeEach(() => {
    discountService.resetState();
    nightAuditService.resetState();
  });

  describe("Workflow d'approbation des remises", () => {
    it("allows receptionist to submit a discount request", async () => {
      const req = await discountService.createDiscountRequest(receptionistContext, {
        propertyId: "prop-bohicon-001",
        targetType: "FOLIO",
        targetId: "fol-stay-101",
        discountType: "PERCENT",
        discountValue: 15, // 15% requested
        reason: "Geste commercial suite panne climatisation temporaire",
      });

      expect(req.id).toBeDefined();
      expect(req.status).toBe("PENDING");
      expect(req.discountValue).toBe(15);
    });

    it("prevents receptionist from self-approving discount above their role threshold (Review Focus #3)", async () => {
      const req = await discountService.createDiscountRequest(receptionistContext, {
        propertyId: "prop-bohicon-001",
        targetType: "FOLIO",
        targetId: "fol-stay-101",
        discountType: "PERCENT",
        discountValue: 15,
        reason: "Geste commercial",
      });

      // Receptionist has max discount threshold of 5% and lacks "discounts:approve" permission
      await expect(
        discountService.reviewDiscountRequest(receptionistContext, req.id, {
          decision: "APPROVED",
          notes: "Tentative d'auto-approbation",
        })
      ).rejects.toThrow("PERMISSION_DENIED");
    });

    it("permits authorized site director to approve discount within limits", async () => {
      const req = await discountService.createDiscountRequest(receptionistContext, {
        propertyId: "prop-bohicon-001",
        targetType: "FOLIO",
        targetId: "fol-stay-101",
        discountType: "PERCENT",
        discountValue: 15,
        reason: "Client fidèle",
      });

      // Site Director has max limit of 25% -> can approve 15%
      const reviewed = await discountService.reviewDiscountRequest(managerContext, req.id, {
        decision: "APPROVED",
        notes: "Validé en accord avec la direction",
      });

      expect(reviewed.status).toBe("APPROVED");
      expect(reviewed.reviewedByUserId).toBe("user-dir-boh");
    });
  });

  describe("Night Audit — Clôture Journalière", () => {
    it("runs preflight checks and flags open cash sessions or unclosed orders", async () => {
      const preflight = await nightAuditService.runPreflight("prop-bohicon-001", "2026-12-01");
      expect(preflight.propertyId).toBe("prop-bohicon-001");
      expect(preflight.canExecuteClosure).toBeDefined();
      expect(preflight.checks).toBeInstanceOf(Array);
    });

    it("executes night audit, calculates occupancy/revenue and locks the date", async () => {
      const audit = await nightAuditService.executeNightAudit(
        managerContext,
        "prop-bohicon-001",
        "2026-12-01"
      );

      expect(audit.id).toBeDefined();
      expect(audit.isLocked).toBe(true);
      expect(audit.auditDate).toBe("2026-12-01");
      expect(audit.occupancyRatePercent).toBeGreaterThanOrEqual(0);
      expect(audit.totalRevenueXof).toBeGreaterThanOrEqual(0);
    });
  });
});
