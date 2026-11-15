import { describe, it, expect } from "vitest";
import { SEED_PROPERTIES, SEED_USERS } from "../lib/db/seed";

describe("Workspace Back-office Navigation & Role Scope", () => {
  it("provides valid site codes and names for multisite switching", () => {
    expect(SEED_PROPERTIES).toHaveLength(4);
    const codes = SEED_PROPERTIES.map((p) => p.code);
    expect(codes).toEqual(["BOH", "ABM", "ABC", "ZOG"]);
  });

  it("provides operational role assignments for Le Vignoble staff", () => {
    const promoter = SEED_USERS.find((u) => u.roleCode === "PROMOTER");
    const manager = SEED_USERS.find((u) => u.roleCode === "PROPERTY_MANAGER");
    const receptionist = SEED_USERS.find((u) => u.roleCode === "RECEPTIONIST");

    expect(promoter?.propertyId).toBeNull(); // Group-wide
    expect(manager?.propertyId).toBe("prop-bohicon-001");
    expect(receptionist?.propertyId).toBe("prop-bohicon-001");
  });
});
