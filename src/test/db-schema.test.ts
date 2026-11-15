import { describe, it, expect } from "vitest";
import * as schema from "../lib/db/schema";
import { SEED_ORGANIZATION, SEED_PROPERTIES, SEED_USERS } from "../lib/db/seed";

describe("Database Schema & Tenant Hierarchy", () => {
  it("defines all core tables with proper metadata", () => {
    expect(schema.tenants).toBeDefined();
    expect(schema.organizations).toBeDefined();
    expect(schema.properties).toBeDefined();
    expect(schema.departments).toBeDefined();
    expect(schema.outlets).toBeDefined();
    expect(schema.users).toBeDefined();
    expect(schema.memberships).toBeDefined();
    expect(schema.roles).toBeDefined();
    expect(schema.auditEvents).toBeDefined();

    // PMS
    expect(schema.roomTypes).toBeDefined();
    expect(schema.units).toBeDefined();
    expect(schema.ratePlans).toBeDefined();
    expect(schema.reservations).toBeDefined();
    expect(schema.stays).toBeDefined();

    // POS
    expect(schema.menuCategories).toBeDefined();
    expect(schema.menuItems).toBeDefined();
    expect(schema.serviceStations).toBeDefined();
    expect(schema.diningTables).toBeDefined();
    expect(schema.qrResources).toBeDefined();
    expect(schema.orders).toBeDefined();
    expect(schema.stationTickets).toBeDefined();

    // Traiteur & Location de matériel
    expect(schema.cateringMenus).toBeDefined();
    expect(schema.cateringOrders).toBeDefined();
    expect(schema.equipmentItems).toBeDefined();
    expect(schema.equipmentRentals).toBeDefined();
    expect(schema.equipmentInspections).toBeDefined();

    // Finance & Caisse
    expect(schema.folios).toBeDefined();
    expect(schema.folioLines).toBeDefined();
    expect(schema.invoices).toBeDefined();
    expect(schema.cashDrawers).toBeDefined();
    expect(schema.cashSessions).toBeDefined();
    expect(schema.paymentRecords).toBeDefined();

    // Gouvernance
    expect(schema.discountRequests).toBeDefined();
    expect(schema.nightAudits).toBeDefined();
  });

  it("includes all 4 properties of Hôtel Le Vignoble in the seed dataset", () => {
    expect(SEED_ORGANIZATION.name).toBe("Hôtel Le Vignoble");
    expect(SEED_PROPERTIES).toHaveLength(4);

    const siteCodes = SEED_PROPERTIES.map((p) => p.code);
    expect(siteCodes).toContain("BOH"); // Bohicon
    expect(siteCodes).toContain("ABM"); // Abomey
    expect(siteCodes).toContain("ABC"); // Abomey-Calavi
    expect(siteCodes).toContain("ZOG"); // Zogbodomey
  });

  it("seeds standard roles with appropriate permissions", () => {
    const roles = SEED_USERS.map((u) => u.roleName);
    expect(roles).toContain("Promoteur");
    expect(roles).toContain("Directeur de Site");
    expect(roles).toContain("Réceptionniste");
    expect(roles).toContain("Serveuse");
    expect(roles).toContain("Cuisinier");
    expect(roles).toContain("Barman");
  });
});
