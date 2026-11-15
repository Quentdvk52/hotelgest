import * as crypto from "crypto";
import { SEED_USERS } from "../../lib/db/seed";
import { ENTERPRISE_PASSWORDS } from "../../lib/auth/passwords";
import { RoleCode, getRoleDefaultPermissions } from "../../lib/auth/rbac";
import { envConfig } from "../../lib/config";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roleCode: RoleCode;
  roleName: string;
  propertyId: string | null;
  maxDiscount: string;
  permissions: string[];
}

export interface SessionPayload extends AuthenticatedUser {
  iat: number;
  exp: number;
}

export function getDefaultRedirectForRole(roleCode: RoleCode): string {
  switch (roleCode) {
    case "PROMOTER":
      return "/dashboard";
    case "FINANCIAL_DIRECTOR":
    case "ACCOUNTANT":
      return "/reports";
    case "CASHIER":
      return "/finance/cash";
    case "PROPERTY_MANAGER":
      return "/dashboard";
    case "RECEPTIONIST":
    case "HOUSEKEEPING":
      return "/pms/reception";
    case "CHEF":
    case "BARTENDER":
    case "WAITSTAFF":
      return "/pos/stations";
    case "CATERING_MANAGER":
      return "/workspace-catering";
    case "AUDITOR":
      return "/reports";
    default:
      return "/dashboard";
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function signSessionToken(user: AuthenticatedUser): string {
  const payload: SessionPayload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  };
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", envConfig.JWT_SECRET)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", envConfig.JWT_SECRET)
      .update(base64Payload)
      .digest("base64url");
    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(base64Payload, "base64url").toString("utf-8")
    );
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function loginWithCredentials(
  emailInput: string,
  passwordInput: string
): Promise<{ user: AuthenticatedUser; redirectUrl: string; token: string } | null> {
  const normalizedEmail = emailInput.trim().toLowerCase();

  // Find user in seed users
  const user = SEED_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return null;
  }

  // Check expected password
  const expectedPassword = ENTERPRISE_PASSWORDS[user.email] || "Vignoble#2026";
  if (passwordInput !== expectedPassword) {
    return null;
  }

  const roleCode = user.roleCode as RoleCode;
  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roleCode,
    roleName: user.roleName,
    propertyId: user.propertyId,
    maxDiscount: user.maxDiscount,
    permissions: getRoleDefaultPermissions(roleCode),
  };

  const redirectUrl = getDefaultRedirectForRole(roleCode);
  const token = signSessionToken(authenticatedUser);

  return {
    user: authenticatedUser,
    redirectUrl,
    token,
  };
}
