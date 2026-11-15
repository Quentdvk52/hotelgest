import { describe, it, expect } from "vitest";
import { SEED_MENU_ITEMS, SEED_CATERING_MENUS, SEED_EQUIPMENT_ITEMS } from "../lib/db/seed";

describe("UI & Guest Experience Modules", () => {
  it("provides rich menu data with allergens and station routing for QR dining", () => {
    expect(SEED_MENU_ITEMS.length).toBeGreaterThan(0);
    const amiwo = SEED_MENU_ITEMS.find((m) => m.name.includes("Amiwo"));
    expect(amiwo).toBeDefined();
    expect(amiwo?.priceXof).toBe(5500);
    expect(amiwo?.targetStationCode).toBe("CUISINE");
  });

  it("provides complete catering menus with per-person prices and min guests", () => {
    expect(SEED_CATERING_MENUS.length).toBeGreaterThan(0);
    const buffet = SEED_CATERING_MENUS[0];
    expect(buffet.pricePerPersonXof).toBe(12000);
    expect(buffet.minGuests).toBe(20);
  });

  it("provides equipment items with stock, daily rental rate, and required deposit (caution)", () => {
    expect(SEED_EQUIPMENT_ITEMS.length).toBeGreaterThan(0);
    const chaises = SEED_EQUIPMENT_ITEMS.find((e) => e.category === "CHAISES");
    expect(chaises).toBeDefined();
    expect(chaises?.dailyRentalPriceXof).toBe(700);
    expect(chaises?.depositPerUnitXof).toBe(2000);
  });
});
