import { TenantContext } from "../types/common";

export type RoleCode =
  | "PROMOTER"
  | "PROPERTY_MANAGER"
  | "RECEPTIONIST"
  | "WAITSTAFF"
  | "CHEF"
  | "BARTENDER"
  | "CASHIER"
  | "ACCOUNTANT"
  | "AUDITOR";

export type PermissionCode =
  // PMS
  | "pms:reservations:create"
  | "pms:reservations:read"
  | "pms:reservations:update"
  | "pms:checkin:perform"
  | "pms:checkout:perform"
  | "pms:rooms:manage"
  // POS
  | "pos:orders:create"
  | "pos:orders:submit"
  | "pos:orders:transfer_folio"
  | "pos:stations:kitchen:view"
  | "pos:stations:bar:view"
  | "pos:stations:cellar:view"
  // Traiteur & Matériel
  | "catering:orders:create"
  | "catering:orders:manage"
  | "equipment:rentals:create"
  | "equipment:rentals:manage"
  | "equipment:inspections:perform"
  // Caisse & Finances
  | "cash:session:open"
  | "cash:session:close"
  | "cash:payment:record"
  | "folios:charges:add"
  | "invoices:generate"
  // Gouvernance
  | "discounts:request"
  | "discounts:approve"
  | "night_audit:run"
  | "reports:view"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  PROMOTER: [
    "pms:reservations:create",
    "pms:reservations:read",
    "pms:reservations:update",
    "pms:checkin:perform",
    "pms:checkout:perform",
    "pms:rooms:manage",
    "pos:orders:create",
    "pos:orders:submit",
    "pos:orders:transfer_folio",
    "pos:stations:kitchen:view",
    "pos:stations:bar:view",
    "pos:stations:cellar:view",
    "catering:orders:create",
    "catering:orders:manage",
    "equipment:rentals:create",
    "equipment:rentals:manage",
    "equipment:inspections:perform",
    "cash:session:open",
    "cash:session:close",
    "cash:payment:record",
    "folios:charges:add",
    "invoices:generate",
    "discounts:request",
    "discounts:approve",
    "night_audit:run",
    "reports:view",
    "settings:manage",
  ],
  PROPERTY_MANAGER: [
    "pms:reservations:create",
    "pms:reservations:read",
    "pms:reservations:update",
    "pms:checkin:perform",
    "pms:checkout:perform",
    "pms:rooms:manage",
    "pos:orders:create",
    "pos:orders:submit",
    "pos:orders:transfer_folio",
    "pos:stations:kitchen:view",
    "pos:stations:bar:view",
    "pos:stations:cellar:view",
    "catering:orders:create",
    "catering:orders:manage",
    "equipment:rentals:create",
    "equipment:rentals:manage",
    "equipment:inspections:perform",
    "cash:session:open",
    "cash:session:close",
    "cash:payment:record",
    "folios:charges:add",
    "invoices:generate",
    "discounts:request",
    "discounts:approve",
    "night_audit:run",
    "reports:view",
  ],
  RECEPTIONIST: [
    "pms:reservations:create",
    "pms:reservations:read",
    "pms:reservations:update",
    "pms:checkin:perform",
    "pms:checkout:perform",
    "catering:orders:create",
    "equipment:rentals:create",
    "cash:session:open",
    "cash:session:close",
    "cash:payment:record",
    "folios:charges:add",
    "invoices:generate",
    "discounts:request",
  ],
  WAITSTAFF: [
    "pos:orders:create",
    "pos:orders:submit",
    "pos:orders:transfer_folio",
    "discounts:request",
  ],
  CHEF: [
    "pos:stations:kitchen:view",
  ],
  BARTENDER: [
    "pos:stations:bar:view",
    "pos:stations:cellar:view",
    "pos:orders:create",
    "pos:orders:submit",
  ],
  CASHIER: [
    "cash:session:open",
    "cash:session:close",
    "cash:payment:record",
    "folios:charges:add",
    "invoices:generate",
    "discounts:request",
  ],
  ACCOUNTANT: [
    "cash:payment:record",
    "invoices:generate",
    "night_audit:run",
    "reports:view",
  ],
  AUDITOR: [
    "reports:view",
    "pms:reservations:read",
  ],
};

export function getRoleDefaultPermissions(role: string): string[] {
  const code = role.toUpperCase() as RoleCode;
  return ROLE_PERMISSIONS[code] || [];
}

/**
 * Checks if a context has access to a specific property (site).
 * Promoter has wildcard access to all properties in the tenant.
 * Other roles are strictly restricted to their assigned propertyId.
 */
export function hasPropertyAccess(context: TenantContext, targetPropertyId: string): boolean {
  if (context.roles.includes("PROMOTER")) {
    return true;
  }
  return context.propertyId === targetPropertyId;
}

/**
 * Check if the user has a permission, scoped to the property if specified.
 */
export function checkPermission(
  context: TenantContext,
  permission: PermissionCode,
  targetPropertyId?: string
): boolean {
  if (targetPropertyId && !hasPropertyAccess(context, targetPropertyId)) {
    return false;
  }
  return context.permissions.includes(permission);
}
