import { describe, it, expect, beforeEach } from "vitest";
import {
  WAITSTAFF_CATALOG,
  BENIN_MEAL_ACCOMPANIMENTS,
  getWaitstaffShift,
  getWaitstaffTables,
  getWaitstaffOrders,
  createWaitstaffOrder,
  advanceOrderItemStatus,
  settleWaitstaffOrder,
  getWaitstaffRemittanceSnapshot,
  submitServerRemittance,
  confirmServerRemittance,
  getWaitstaffRatings,
} from "../modules/pos/waitstaff-service";

describe("Waitstaff Console & Service Tasks (DebitMaster Port)", () => {
  it("should provide shift data for seed waitstaff across all 4 sites", () => {
    const srvBoh = getWaitstaffShift("user-srv-boh");
    expect(srvBoh).toBeDefined();
    expect(srvBoh.fullName).toBe("Chantal Tossou");
    expect(srvBoh.propertyName).toContain("Bohicon");
    expect(srvBoh.roleCode).toBe("WAITSTAFF");
    expect(srvBoh.isActiveOnDuty).toBe(true);

    const srvAbm = getWaitstaffShift("user-srv-abm");
    expect(srvAbm.fullName).toBe("Estelle AHOUANDJINOU");
    expect(srvAbm.propertyName).toContain("Abomey");

    const srvAbc = getWaitstaffShift("user-srv-abc");
    expect(srvAbc.fullName).toBe("Prudence HOUNTONDJI");
    expect(srvAbc.propertyName).toContain("Calavi");

    const srvZog = getWaitstaffShift("user-srv-zog");
    expect(srvZog.fullName).toBe("Viviane SOGLO");
    expect(srvZog.propertyName).toContain("Zogbodomey");
  });

  it("should return tables assigned to property", () => {
    const bohTables = getWaitstaffTables("prop-bohicon-001");
    expect(bohTables.length).toBeGreaterThanOrEqual(4);
    expect(bohTables.some((t) => t.label === "Table 1")).toBe(true);
  });

  it("should contain authentic Beninese meals and local beverages in catalog", () => {
    const beninoise = WAITSTAFF_CATALOG.find((p) => p.name.includes("Béninoise"));
    expect(beninoise).toBeDefined();
    expect(beninoise?.unit).toBe("BEVERAGE");
    expect(beninoise?.targetStationCode).toBe("BAR");

    const amiwo = WAITSTAFF_CATALOG.find((p) => p.name.includes("Amiwo"));
    expect(amiwo).toBeDefined();
    expect(amiwo?.unit).toBe("MEAL");
    expect(amiwo?.targetStationCode).toBe("CUISINE");

    expect(BENIN_MEAL_ACCOMPANIMENTS).toContain("Alloco fondant (Plantains frits)");
    expect(BENIN_MEAL_ACCOMPANIMENTS).toContain("Igname pilée traditionnelle (Agoun)");
  });

  it("should create a waitstaff order with dual-station routing", () => {
    const newOrder = createWaitstaffOrder({
      propertyId: "prop-bohicon-001",
      tableLabel: "Table 1",
      zone: "Terrasse Jardin",
      waitstaffId: "user-srv-boh",
      waitstaffName: "Chantal Tossou",
      clientName: "M. Dossou",
      notes: "Bien glacé",
      items: [
        {
          productId: "prod-boi-01", // Béninoise 65cl (1 500 XOF)
          quantity: 2,
        },
        {
          productId: "prod-rep-01", // Amiwo (5 500 XOF)
          quantity: 1,
          accompaniment: "Alloco fondant (Plantains frits)",
        },
      ],
    });

    expect(newOrder.id).toBeDefined();
    expect(newOrder.orderNumber).toContain("CMD-BOH");
    expect(newOrder.totalAmountXof).toBe(2 * 1500 + 5500); // 8 500 XOF
    expect(newOrder.status).toBe("PENDING");
    expect(newOrder.items.length).toBe(2);

    const drinkItem = newOrder.items.find((i) => i.fulfillmentUnit === "BEVERAGE");
    expect(drinkItem?.targetStationCode).toBe("BAR");

    const mealItem = newOrder.items.find((i) => i.fulfillmentUnit === "MEAL");
    expect(mealItem?.targetStationCode).toBe("CUISINE");
    expect(mealItem?.accompaniment).toBe("Alloco fondant (Plantains frits)");
  });

  it("should advance order item status through preparation, counter pickup, and delivery", () => {
    const order = createWaitstaffOrder({
      propertyId: "prop-bohicon-001",
      tableLabel: "Table 2",
      zone: "Terrasse",
      waitstaffId: "user-srv-boh",
      waitstaffName: "Chantal Tossou",
      items: [{ productId: "prod-boi-01", quantity: 1 }],
    });

    const itemId = order.items[0].id;

    // Simulate kitchen/bar ready -> server pickup (RECEIVED)
    const recRes = advanceOrderItemStatus(order.id, itemId, "RECEIVED");
    expect(recRes.success).toBe(true);
    expect(recRes.order?.items[0].preparationStatus).toBe("RECEIVED");
    expect(recRes.order?.items[0].receivedAt).toBeDefined();

    // Server serves table (DELIVERED)
    const delRes = advanceOrderItemStatus(order.id, itemId, "DELIVERED");
    expect(delRes.success).toBe(true);
    expect(delRes.order?.items[0].preparationStatus).toBe("DELIVERED");
    expect(delRes.order?.items[0].deliveredAt).toBeDefined();
    expect(delRes.order?.status).toBe("DELIVERED");
  });

  it("should settle order with e-MECeF Benin fiscal normalization", () => {
    const order = createWaitstaffOrder({
      propertyId: "prop-bohicon-001",
      tableLabel: "Table 3",
      zone: "Terrasse",
      waitstaffId: "user-srv-boh",
      waitstaffName: "Chantal Tossou",
      items: [{ productId: "prod-boi-02", quantity: 2 }], // Beaufort (1800 * 2 = 3600)
    });

    const settleRes = settleWaitstaffOrder({
      orderId: order.id,
      paymentMethod: "CASH",
      cashAmountXof: 3600,
      mobileAmountXof: 0,
      waitstaffName: "Chantal Tossou",
    });

    expect(settleRes.success).toBe(true);
    expect(settleRes.payment).toBeDefined();
    expect(settleRes.payment?.fiscalNormalized).toBe(true);
    expect(settleRes.payment?.fiscalNim).toContain("MCF-BOH");
    expect(settleRes.payment?.fiscalUid).toContain("FV-");
    expect(settleRes.payment?.fiscalQrCodeUrl).toContain("facture.dgi.bj");
    expect(settleRes.order?.status).toBe("PAID");
  });

  it("should calculate waitstaff shift remittances and handle manager discrepancy verification", () => {
    const snapshot = getWaitstaffRemittanceSnapshot("user-srv-boh", "prop-bohicon-001");
    expect(snapshot).toBeDefined();
    expect(typeof snapshot.expectedCashInHandXof).toBe("number");
    expect(typeof snapshot.commissionEarnedXof).toBe("number");

    // Submit a remittance
    const remit = submitServerRemittance({
      propertyId: "prop-bohicon-001",
      waitstaffId: "user-srv-boh",
      waitstaffName: "Chantal Tossou",
      declaredCashXof: 40000,
      declaredMobileXof: 15000,
      expectedCashXof: 45000,
      note: "Remise fin de vacation midi",
    });

    expect(remit.id).toBeDefined();
    expect(remit.status).toBe("SUBMITTED");

    // Manager confirms with an exact match or discrepancy
    const confirmRes = confirmServerRemittance({
      remittanceId: remit.id,
      receivedCashXof: 40000,
      confirmedBy: "Gérant Bohicon",
    });

    expect(confirmRes.success).toBe(true);
    expect(confirmRes.remittance?.status).toBe("ACCEPTED");
    expect(confirmRes.remittance?.discrepancyType).toBe("SHORTAGE"); // Expected 45000, got 40000 => 5000 shortage
    expect(confirmRes.remittance?.discrepancyAmountXof).toBe(5000);
  });

  it("should retrieve waitstaff customer ratings", () => {
    const ratings = getWaitstaffRatings();
    expect(ratings.length).toBeGreaterThan(0);
    expect(ratings[0].ratingScore).toBeGreaterThanOrEqual(1);
    expect(ratings[0].comment).toBeDefined();
  });
});
