import { TenantContext } from "../types/common";

export type RoleCode =
  | "PROMOTER"
  | "FINANCIAL_DIRECTOR"
  | "PROPERTY_MANAGER"
  | "RECEPTIONIST"
  | "WAITSTAFF"
  | "CHEF"
  | "BARTENDER"
  | "CASHIER"
  | "ACCOUNTANT"
  | "CATERING_MANAGER"
  | "HOUSEKEEPING"
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
  | "settings:manage"
  // Messagerie Interne
  | "messaging:access"
  | "messaging:groups:create"
  | "messaging:intersite:send"
  // Annonces Officielles
  | "announcements:read"
  | "announcements:create"
  | "announcements:publish"
  | "announcements:approve"
  // Notifications
  | "notifications:read"
  | "notifications:manage";

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
    "messaging:access",
    "messaging:groups:create",
    "messaging:intersite:send",
    "announcements:read",
    "announcements:create",
    "announcements:publish",
    "announcements:approve",
    "notifications:read",
    "notifications:manage",
  ],
  FINANCIAL_DIRECTOR: [
    "pms:reservations:read",
    "pms:rooms:manage",
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
    "messaging:access",
    "messaging:groups:create",
    "messaging:intersite:send",
    "announcements:read",
    "announcements:create",
    "announcements:publish",
    "announcements:approve",
    "notifications:read",
    "notifications:manage",
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
    "messaging:access",
    "messaging:groups:create",
    "messaging:intersite:send",
    "announcements:read",
    "announcements:create",
    "announcements:publish",
    "notifications:read",
    "notifications:manage",
  ],
  RECEPTIONIST: [
    "pms:reservations:create",
    "pms:reservations:read",
    "pms:reservations:update",
    "pms:checkin:perform",
    "pms:checkout:perform",
    "pos:orders:transfer_folio",
    "catering:orders:create",
    "equipment:rentals:create",
    "cash:session:open",
    "cash:session:close",
    "cash:payment:record",
    "folios:charges:add",
    "invoices:generate",
    "discounts:request",
    "messaging:access",
    "announcements:read",
    "notifications:read",
    "notifications:manage",
  ],
  WAITSTAFF: [
    "pos:orders:create",
    "pos:orders:submit",
    "pos:orders:transfer_folio",
    "discounts:request",
    "messaging:access",
    "announcements:read",
    "notifications:read",
    "notifications:manage",
  ],
  CHEF: [
    "pos:stations:kitchen:view",
    "messaging:access",
    "announcements:read",
    "notifications:read",
    "notifications:manage",
  ],
  BARTENDER: [
    "pos:stations:bar:view",
    "pos:stations:cellar:view",
    "pos:orders:create",
    "pos:orders:submit",
    "messaging:access",
    "announcements:read",
    "notifications:read",
    "notifications:manage",
  ],
  CASHIER: [
    "cash:session:open",
    "cash:session:close",
    "cash:payment:record",
    "folios:charges:add",
    "invoices:generate",
    "discounts:request",
    "messaging:access",
    "announcements:read",
    "notifications:read",
    "notifications:manage",
  ],
  ACCOUNTANT: [
    "cash:payment:record",
    "invoices:generate",
    "night_audit:run",
    "reports:view",
    "messaging:access",
    "messaging:intersite:send",
    "announcements:read",
    "notifications:read",
    "notifications:manage",
  ],
  CATERING_MANAGER: [
    "catering:orders:create",
    "catering:orders:manage",
    "equipment:rentals:create",
    "equipment:rentals:manage",
    "equipment:inspections:perform",
    "folios:charges:add",
    "invoices:generate",
    "reports:view",
    "messaging:access",
    "messaging:groups:create",
    "messaging:intersite:send",
    "announcements:read",
    "announcements:create",
    "notifications:read",
    "notifications:manage",
  ],
  HOUSEKEEPING: [
    "pms:reservations:read",
    "pms:rooms:manage",
    "messaging:access",
    "announcements:read",
    "notifications:read",
    "notifications:manage",
  ],
  AUDITOR: [
    "reports:view",
    "pms:reservations:read",
    "messaging:access",
    "messaging:intersite:send",
    "announcements:read",
    "notifications:read",
    "notifications:manage",
  ],
};

export function getRoleDefaultPermissions(role: string): string[] {
  const code = role.toUpperCase() as RoleCode;
  return ROLE_PERMISSIONS[code] || [];
}

export function hasPropertyAccess(context: TenantContext, targetPropertyId: string): boolean {
  if (
    context.roles.includes("PROMOTER") ||
    context.roles.includes("FINANCIAL_DIRECTOR") ||
    context.roles.includes("ACCOUNTANT") ||
    context.roles.includes("AUDITOR")
  ) {
    return true;
  }
  return context.propertyId === targetPropertyId;
}

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

export function canSendMessageIntersite(context: TenantContext, targetPropertyId: string): boolean {
  if (hasPropertyAccess(context, targetPropertyId)) return true;
  return context.permissions.includes("messaging:intersite:send");
}
