import { describe, it, expect } from "vitest";
import {
  loginWithCredentials,
  verifySessionToken,
  getDefaultRedirectForRole,
  hashPassword,
} from "../modules/auth/auth-service";

describe("Authentication & Role-Based Redirection", () => {
  it("authenticates Promoter Eddy GNACADJA with valid password and redirects to dashboard", async () => {
    const res = await loginWithCredentials("gnacadjaeddy@gmail.com", "EddyEZO@17");
    expect(res).not.toBeNull();
    expect(res?.user.fullName).toBe("Eddy GNACADJA");
    expect(res?.user.roleCode).toBe("PROMOTER");
    expect(res?.redirectUrl).toBe("/dashboard");

    // Token verification
    const verified = verifySessionToken(res!.token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe("gnacadjaeddy@gmail.com");
  });

  it("authenticates DAF Central and redirects to financial reports", async () => {
    const res = await loginWithCredentials("daf@hotel-levignoble.bj", "DafVignoble#2026");
    expect(res).not.toBeNull();
    expect(res?.user.roleCode).toBe("FINANCIAL_DIRECTOR");
    expect(res?.redirectUrl).toBe("/reports");
  });

  it("authenticates Receptionist and redirects to PMS reception", async () => {
    const res = await loginWithCredentials("reception.boh@hotel-levignoble.bj", "RecepBoh!2026");
    expect(res).not.toBeNull();
    expect(res?.user.roleCode).toBe("RECEPTIONIST");
    expect(res?.redirectUrl).toBe("/pms/reception");
    expect(res?.user.propertyId).toBe("prop-bohicon-001");
  });

  it("authenticates Chef Cuisinier and redirects to kitchen KDS stations", async () => {
    const res = await loginWithCredentials("chef.boh@hotel-levignoble.bj", "ChefBoh*2026");
    expect(res).not.toBeNull();
    expect(res?.user.roleCode).toBe("CHEF");
    expect(res?.redirectUrl).toBe("/pos/stations");
  });

  it("authenticates Catering & Equipment Manager and redirects to workspace catering", async () => {
    const res = await loginWithCredentials("traiteur.event@hotel-levignoble.bj", "TraiteurEvent#2026");
    expect(res).not.toBeNull();
    expect(res?.user.roleCode).toBe("CATERING_MANAGER");
    expect(res?.redirectUrl).toBe("/workspace-catering");
  });

  it("authenticates Cashier Central and redirects to cash sessions", async () => {
    const res = await loginWithCredentials("caisse.centrale@hotel-levignoble.bj", "CaisseCentrale!2026");
    expect(res).not.toBeNull();
    expect(res?.user.roleCode).toBe("CASHIER");
    expect(res?.redirectUrl).toBe("/finance/cash");
  });

  it("rejects login with invalid password", async () => {
    const res = await loginWithCredentials("gnacadjaeddy@gmail.com", "WrongPassword123!");
    expect(res).toBeNull();
  });

  it("rejects login with non-existent email", async () => {
    const res = await loginWithCredentials("inconnu@hotel-levignoble.bj", "Password123!");
    expect(res).toBeNull();
  });

  it("detects tampered session tokens", () => {
    const valid = verifySessionToken("fake.token.tampered");
    expect(valid).toBeNull();
  });

  it("maps roles to proper redirect URLs correctly", () => {
    expect(getDefaultRedirectForRole("PROMOTER")).toBe("/dashboard");
    expect(getDefaultRedirectForRole("FINANCIAL_DIRECTOR")).toBe("/reports");
    expect(getDefaultRedirectForRole("ACCOUNTANT")).toBe("/reports");
    expect(getDefaultRedirectForRole("CASHIER")).toBe("/finance/cash");
    expect(getDefaultRedirectForRole("PROPERTY_MANAGER")).toBe("/dashboard");
    expect(getDefaultRedirectForRole("RECEPTIONIST")).toBe("/pms/reception");
    expect(getDefaultRedirectForRole("CHEF")).toBe("/pos/stations");
    expect(getDefaultRedirectForRole("BARTENDER")).toBe("/pos/stations");
    expect(getDefaultRedirectForRole("WAITSTAFF")).toBe("/pos/stations");
    expect(getDefaultRedirectForRole("CATERING_MANAGER")).toBe("/workspace-catering");
  });
});
