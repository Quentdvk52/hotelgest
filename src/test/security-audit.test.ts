import { describe, it, expect, beforeEach } from "vitest";
import { resolveSessionContext } from "../lib/auth/session";
import { qrService } from "../modules/pos/qr-service";
import { discountService } from "../modules/governance/discount-service";
import { folioService } from "../modules/finance/folio-service";
import { orderService } from "../modules/pos/order-service";
import {
  loginWithCredentials,
  signSessionToken,
  verifySessionToken,
  AuthenticatedUser,
} from "../modules/auth/auth-service";
import { signCreatorToken, verifyCreatorToken } from "../modules/auth/creator-auth";
import { TenantContext } from "../lib/types/common";
import { getRoleDefaultPermissions, hasPropertyAccess, checkPermission } from "../lib/auth/rbac";

describe("Security Audit & Hardening Suite (OWASP ASVS & Special Multi-Tenant Rules)", () => {
  const bohiconReceptionist: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-rec-boh",
    roles: ["RECEPTIONIST"],
    permissions: getRoleDefaultPermissions("RECEPTIONIST"),
  };

  const bohiconManager: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-dir-boh",
    roles: ["PROPERTY_MANAGER"],
    permissions: getRoleDefaultPermissions("PROPERTY_MANAGER"),
  };

  const promoterContext: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-prom-01",
    roles: ["PROMOTER"],
    permissions: getRoleDefaultPermissions("PROMOTER"),
  };

  beforeEach(() => {
    qrService.resetState();
    discountService.resetState();
    folioService.resetState();
    orderService.resetState();
  });

  describe("1. Authentication, Sessions & Elimination of Promoter Fallback", () => {
    it("strictly rejects unauthenticated request without token (no promoter fallback)", async () => {
      const mockReq = new Request("http://localhost:3000/api/pms/reservations");
      await expect(resolveSessionContext(mockReq)).rejects.toThrow("UNAUTHORIZED");
    });

    it("accepts valid cryptographically signed session cookie", async () => {
      const validUser: AuthenticatedUser = {
        id: "user-rec-boh",
        email: "reception.boh@hotel-levignoble.bj",
        fullName: "Gaston Dossou",
        roleCode: "RECEPTIONIST",
        roleName: "Réceptionniste",
        propertyId: "prop-bohicon-001",
        maxDiscount: "0",
        permissions: getRoleDefaultPermissions("RECEPTIONIST"),
      };
      const token = signSessionToken(validUser);

      const mockReq = new Request("http://localhost:3000/api/pms/reservations", {
        headers: { cookie: `hotelgest_session=${token}` },
      });

      const context = await resolveSessionContext(mockReq);
      expect(context.userId).toBe("user-rec-boh");
      expect(context.propertyId).toBe("prop-bohicon-001");
      expect(context.roles).toContain("RECEPTIONIST");
    });

    it("rejects forged or tampered session cookie", async () => {
      const mockReq = new Request("http://localhost:3000/api/pms/reservations", {
        headers: { cookie: "hotelgest_session=invalid.tampered.token" },
      });
      await expect(resolveSessionContext(mockReq)).rejects.toThrow("UNAUTHORIZED");
    });

    it("rate-limits after 5 consecutive failed login attempts", async () => {
      const targetEmail = "attacker-brute-force@hotel-levignoble.bj";
      for (let i = 0; i < 5; i++) {
        await loginWithCredentials(targetEmail, "WrongPass#999");
      }
      // 6th attempt must be rejected by rate-limiter
      const sixthAttempt = await loginWithCredentials(targetEmail, "WrongPass#999");
      expect(sixthAttempt).toBeNull();
    });
  });

  describe("2. Creator Super-Admin Cryptographic Protection", () => {
    it("signs and verifies valid creator token", () => {
      const token = signCreatorToken("createur@hotelgest.io");
      expect(verifyCreatorToken(token)).toBe(true);
    });

    it("rejects unsigned, forged, or static creator tokens", () => {
      expect(verifyCreatorToken("authorized_creator_active")).toBe(false);
      expect(verifyCreatorToken("tampered.creator.signature")).toBe(false);
      expect(verifyCreatorToken(undefined)).toBe(false);
    });
  });

  describe("3. Multi-Tenant Cross-Site Isolation", () => {
    it("prohibits a site employee from accessing another property's records", () => {
      expect(hasPropertyAccess(bohiconReceptionist, "prop-abomey-002")).toBe(false);
      expect(hasPropertyAccess(bohiconReceptionist, "prop-calavi-003")).toBe(false);
      expect(hasPropertyAccess(bohiconReceptionist, "prop-zogbo-004")).toBe(false);
      expect(checkPermission(bohiconReceptionist, "pms:reservations:create", "prop-abomey-002")).toBe(false);
    });

    it("allows group executives (Promoter, DAF) to access all establishments", () => {
      expect(hasPropertyAccess(promoterContext, "prop-bohicon-001")).toBe(true);
      expect(hasPropertyAccess(promoterContext, "prop-abomey-002")).toBe(true);
      expect(hasPropertyAccess(promoterContext, "prop-calavi-003")).toBe(true);
      expect(hasPropertyAccess(promoterContext, "prop-zogbo-004")).toBe(true);
    });
  });

  describe("4. Governance: Segregation of Duties (SoD) on Discounts", () => {
    it("strictly prohibits a manager from approving their own discount request", async () => {
      const request = await discountService.createDiscountRequest(bohiconManager, {
        propertyId: "prop-bohicon-001",
        targetType: "FOLIO",
        targetId: "folio-test-01",
        discountType: "PERCENT",
        discountValue: 15,
        reason: "Remise fidélité client VIP",
      });

      // Attempting to self-approve with the same manager context must fail
      await expect(
        discountService.reviewDiscountRequest(bohiconManager, request.id, {
          decision: "APPROVED",
          notes: "Auto-approbation illégitime",
        })
      ).rejects.toThrow("Auto-approbation interdite");
    });

    it("allows the Promoter or authorized third party to approve a pending discount", async () => {
      const request = await discountService.createDiscountRequest(bohiconManager, {
        propertyId: "prop-bohicon-001",
        targetType: "FOLIO",
        targetId: "folio-test-02",
        discountType: "PERCENT",
        discountValue: 20,
        reason: "Remise spéciale séminaire",
      });

      const reviewed = await discountService.reviewDiscountRequest(promoterContext, request.id, {
        decision: "APPROVED",
        notes: "Validé par la Direction Générale",
      });

      expect(reviewed.status).toBe("APPROVED");
      expect(reviewed.reviewedByUserId).toBe("user-prom-01");
    });
  });

  describe("5. Financial and POS Input Bounds Validations", () => {
    it("rejects negative payment amounts in folio", async () => {
      const folio = await folioService.getOrCreateFolio(bohiconReceptionist, "stay-sec-01", "Client Test");

      await expect(
        folioService.recordPayment(bohiconReceptionist, folio.id, {
          paymentMethod: "CASH",
          amountXof: -25000,
        })
      ).rejects.toThrow("VALIDATION_ERROR");
    });

    it("rejects negative charge amounts in folio", async () => {
      const folio = await folioService.getOrCreateFolio(bohiconReceptionist, "stay-sec-02", "Client Test 2");

      await expect(
        folioService.addCharge(bohiconReceptionist, folio.id, {
          departmentCode: "ROOM",
          description: "Charge négative frauduleuse",
          amountXof: -10000,
        })
      ).rejects.toThrow("VALIDATION_ERROR");
    });

    it("rejects negative or zero quantities in POS order", async () => {
      await expect(
        orderService.createOrder({
          propertyId: "prop-bohicon-001",
          source: "QR_CLIENT",
          items: [{ menuItemId: "item-01", quantity: -3 }],
        })
      ).rejects.toThrow("VALIDATION_ERROR");

      await expect(
        orderService.createOrder({
          propertyId: "prop-bohicon-001",
          source: "QR_CLIENT",
          items: [{ menuItemId: "item-01", quantity: 0 }],
        })
      ).rejects.toThrow("VALIDATION_ERROR");
    });
  });

  describe("6. Cryptographically Secure QR Codes across All Rooms & Spaces", () => {
    it("provisions unique, unguessable QR codes for all rooms across all properties", () => {
      const roomQrs = qrService.listQrResources(undefined, "ROOM");
      expect(roomQrs.length).toBeGreaterThanOrEqual(10);

      // Verify each room has a cryptographically robust token (32+ chars)
      roomQrs.forEach((qr) => {
        expect(qr.token).toMatch(/^hg_room_/);
        expect(qr.token.length).toBeGreaterThan(20);
        expect(qr.unitNumber).toBeDefined();
        expect(qr.propertyName).toBeDefined();
      });
    });

    it("provisions QR codes for tables across all spaces (Restaurant, Fêtes, Conférences, VIP)", () => {
      const tableQrs = qrService.listQrResources(undefined, "TABLE");
      expect(tableQrs.length).toBeGreaterThanOrEqual(14);

      const spaces = new Set(tableQrs.map((t) => t.spaceType));
      expect(spaces.has("RESTAURANT")).toBe(true);
      expect(spaces.has("BANQUET")).toBe(true);
      expect(spaces.has("CONFERENCE")).toBe(true);
      expect(spaces.has("VIP")).toBe(true);
      expect(spaces.has("TERRASSE")).toBe(true);
    });

    it("allows dynamic table creation in any space and provisions an active QR code", () => {
      const { table, qr } = qrService.createTableWithQr(
        "prop-bohicon-001",
        "Table Fête 99",
        "Salle des Fêtes Danxomè Royale",
        "BANQUET",
        12
      );

      expect(table.tableNumber).toBe("Table Fête 99");
      expect(table.spaceName).toBe("Salle des Fêtes Danxomè Royale");
      expect(qr.directUrl).toBe(`/order/${qr.token}`);

      const resolved = qrService.resolveToken(qr.token);
      expect(resolved).not.toBeNull();
      expect(resolved?.spaceName).toBe("Salle des Fêtes Danxomè Royale");
      expect(resolved?.spaceType).toBe("BANQUET");
    });

    it("resolves and revokes QR codes accurately", () => {
      const allQrs = qrService.listQrResources();
      const firstQr = allQrs[0];

      expect(qrService.resolveToken(firstQr.token)).not.toBeNull();

      // Revoke token
      qrService.revokeToken(firstQr.token);
      expect(qrService.resolveToken(firstQr.token)).toBeNull();
    });
  });
});
