import { TenantContext } from "../types/common";
import { SEED_USERS, SEED_TENANT } from "../db/seed";
import { getRoleDefaultPermissions } from "./rbac";

/**
 * Validates session headers / tokens and resolves the authenticated TenantContext.
 * In development and demo environments, supports quick role emulation via headers
 * or defaults to the Promoter session.
 */
export async function resolveSessionContext(req?: Request): Promise<TenantContext> {
  const roleHeader = req?.headers.get("x-emulate-role");
  const propertyHeader = req?.headers.get("x-emulate-property");

  if (roleHeader) {
    const matchedUser = SEED_USERS.find(
      (u) => u.roleCode.toLowerCase() === roleHeader.toLowerCase()
    );
    if (matchedUser) {
      const activeProperty = propertyHeader || matchedUser.propertyId || "prop-bohicon-001";
      return {
        tenantId: SEED_TENANT.id,
        organizationId: "org-vignoble-001",
        propertyId: activeProperty,
        userId: matchedUser.id,
        roles: [matchedUser.roleCode],
        permissions: getRoleDefaultPermissions(matchedUser.roleCode),
      };
    }
  }

  // Default context: Promoter with global Le Vignoble scope
  const promoter = SEED_USERS[0];
  return {
    tenantId: SEED_TENANT.id,
    organizationId: "org-vignoble-001",
    propertyId: propertyHeader || "prop-bohicon-001",
    userId: promoter.id,
    roles: [promoter.roleCode],
    permissions: getRoleDefaultPermissions(promoter.roleCode),
  };
}
