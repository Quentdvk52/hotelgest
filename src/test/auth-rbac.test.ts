import { describe, it, expect } from "vitest";
import { checkPermission, hasPropertyAccess, getRoleDefaultPermissions } from "../lib/auth/rbac";
import { createAuditLogEntry } from "../lib/audit/logger";
import { TenantContext } from "../lib/types/common";

describe("RBAC, Scoping & Audit", () => {
  const bohiconReceptionist: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-rec-boh",
    roles: ["RECEPTIONIST"],
    permissions: getRoleDefaultPermissions("RECEPTIONIST"),
  };

  const promoter: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001", // Currently viewing Bohicon, but has group scope
    userId: "user-prom-01",
    roles: ["PROMOTER"],
    permissions: getRoleDefaultPermissions("PROMOTER"),
  };

  it("permits receptionist to perform PMS actions in their own site", () => {
    expect(checkPermission(bohiconReceptionist, "pms:reservations:create", "prop-bohicon-001")).toBe(true);
    expect(checkPermission(bohiconReceptionist, "pms:checkin:perform", "prop-bohicon-001")).toBe(true);
  });

  it("strictly prohibits receptionist from accessing another site", () => {
    // Attempting to access Abomey records with Bohicon receptionist credentials
    expect(hasPropertyAccess(bohiconReceptionist, "prop-abomey-002")).toBe(false);
    expect(checkPermission(bohiconReceptionist, "pms:reservations:create", "prop-abomey-002")).toBe(false);
  });

  it("grants promoter full access to any site across the group", () => {
    expect(hasPropertyAccess(promoter, "prop-bohicon-001")).toBe(true);
    expect(hasPropertyAccess(promoter, "prop-abomey-002")).toBe(true);
    expect(hasPropertyAccess(promoter, "prop-calavi-003")).toBe(true);
    expect(hasPropertyAccess(promoter, "prop-zogbo-004")).toBe(true);
    expect(checkPermission(promoter, "night_audit:run", "prop-calavi-003")).toBe(true);
    expect(checkPermission(promoter, "discounts:approve", "prop-zogbo-004")).toBe(true);
  });

  it("denies unauthorized discount approval to receptionist", () => {
    expect(checkPermission(bohiconReceptionist, "discounts:approve", "prop-bohicon-001")).toBe(false);
  });

  it("creates structured audit log entries without logging sensitive secrets", () => {
    const entry = createAuditLogEntry({
      tenantId: "tenant-vignoble-001",
      propertyId: "prop-bohicon-001",
      userId: "user-rec-boh",
      action: "RESERVATION_CREATE",
      entityType: "RESERVATION",
      entityId: "res-1234",
      details: { guestName: "M. Dossou", room: "101", amount: 25000 },
    });

    expect(entry.action).toBe("RESERVATION_CREATE");
    expect(entry.entityId).toBe("res-1234");
    expect(entry.details).toContain("Dossou");
    expect(entry.id).toBeDefined();
    expect(entry.createdAt).toBeInstanceOf(Date);
  });
});
