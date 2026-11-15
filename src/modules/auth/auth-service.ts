import * as crypto from "crypto";
import { SEED_USERS, SEED_TENANT } from "../../lib/db/seed";
import { ENTERPRISE_PASSWORDS } from "../../lib/auth/passwords";
import { RoleCode, getRoleDefaultPermissions } from "../../lib/auth/rbac";
import { envConfig } from "../../lib/config";
import { createAuditLogEntry } from "../../lib/audit/logger";

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

// In-memory rate limiting tracker: email -> { count: number, resetAt: number }
const loginAttemptTracker = new Map<string, { count: number; resetAt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

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

/**
 * Constant-time password comparison to prevent timing attacks (OWASP ASVS V2.1 / V6.2)
 */
function secureCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
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
  passwordInput: string,
  ipAddress?: string
): Promise<{ user: AuthenticatedUser; redirectUrl: string; token: string } | null> {
  const normalizedEmail = emailInput.trim().toLowerCase();
  const now = Date.now();

  // Rate Limiting Check (Brute-Force & Credential Stuffing Prevention)
  const tracker = loginAttemptTracker.get(normalizedEmail);
  if (tracker && tracker.resetAt > now && tracker.count >= MAX_FAILED_ATTEMPTS) {
    createAuditLogEntry({
      tenantId: SEED_TENANT.id,
      action: "AUTH_LOGIN_RATE_LIMITED",
      entityType: "USER_AUTH",
      details: { email: normalizedEmail, attempts: tracker.count },
      ipAddress,
    });
    return null;
  }

  // Find user in seed users
  const user = SEED_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    // Record failed attempt
    const current = loginAttemptTracker.get(normalizedEmail) || { count: 0, resetAt: now + LOCKOUT_WINDOW_MS };
    loginAttemptTracker.set(normalizedEmail, { count: current.count + 1, resetAt: now + LOCKOUT_WINDOW_MS });
    return null;
  }

  // Check expected password with constant-time comparison
  const expectedPassword = ENTERPRISE_PASSWORDS[user.email] || "Vignoble#2026";
  const isValid = secureCompare(passwordInput, expectedPassword);

  if (!isValid) {
    const current = loginAttemptTracker.get(normalizedEmail) || { count: 0, resetAt: now + LOCKOUT_WINDOW_MS };
    loginAttemptTracker.set(normalizedEmail, { count: current.count + 1, resetAt: now + LOCKOUT_WINDOW_MS });

    createAuditLogEntry({
      tenantId: SEED_TENANT.id,
      propertyId: user.propertyId || undefined,
      userId: user.id,
      action: "AUTH_LOGIN_FAILED",
      entityType: "USER_AUTH",
      details: { email: user.email, reason: "INVALID_CREDENTIALS" },
      ipAddress,
    });
    return null;
  }

  // Reset rate limiting on successful authentication
  loginAttemptTracker.delete(normalizedEmail);

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

  createAuditLogEntry({
    tenantId: SEED_TENANT.id,
    propertyId: user.propertyId || undefined,
    userId: user.id,
    action: "AUTH_LOGIN_SUCCESS",
    entityType: "USER_AUTH",
    details: { email: user.email, role: roleCode },
    ipAddress,
  });

  return {
    user: authenticatedUser,
    redirectUrl,
    token,
  };
}
