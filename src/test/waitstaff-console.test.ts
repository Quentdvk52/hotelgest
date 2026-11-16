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
  getAllServerRemittances,
  getBarmanStockItems,
  updateBarmanStockItem,
  getKitchenCooks,
  getKitchenAssignments,
  createKitchenAssignment,
  advanceKitchenAssignmentStatus,
  getKitchenVivresStockItems,
  updateKitchenVivreStockItem,
  getReplenishmentRequests,
  submitReplenishmentRequest,
  receiveStockTransfer,
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

  it("should contain authentic Beninese meals, local beverages, and fine wines in catalog", () => {
    const beninoise = WAITSTAFF_CATALOG.find((p) => p.name.includes("Béninoise"));
    expect(beninoise).toBeDefined();
    expect(beninoise?.unit).toBe("BEVERAGE");
    expect(beninoise?.targetStationCode).toBe("BAR");

    const amiwo = WAITSTAFF_CATALOG.find((p) => p.name.includes("Amiwo"));
    expect(amiwo).toBeDefined();
    expect(amiwo?.unit).toBe("MEAL");
    expect(amiwo?.targetStationCode).toBe("CUISINE");

    const wine = WAITSTAFF_CATALOG.find((p) => p.name.includes("Château Vignoble") || p.name.includes("Saint-Émilion"));
    expect(wine).toBeDefined();
    expect(wine?.unit).toBe("WINE");
    expect(wine?.targetStationCode).toBe("CAVE");

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

  it("should settle order using multi-tender payment (Espèces, MoMo KKiaPay, TPE, Devise)", () => {
    const order = createWaitstaffOrder({
      propertyId: "prop-bohicon-001",
      tableLabel: "Table VIP",
      zone: "Terrasse",
      waitstaffId: "user-srv-boh",
      waitstaffName: "Chantal Tossou",
      items: [
        { productId: "prod-cav-02", quantity: 1 }, // Champagne Veuve Clicquot (65 000 XOF)
        { productId: "prod-rep-05", quantity: 2 }, // 2x Poisson Braisé (14 000 XOF)
      ], // Total = 79 000 XOF
    });

    expect(order.totalAmountXof).toBe(79000);

    // Multi-tender breakdown:
    // Espèces: 20 000 XOF
    // MoMo: 30 000 XOF (via KKiaPay MTN)
    // TPE: 15 000 XOF (Ticket BOA)
    // Devise EUR: 14 000 XOF (soit ~21.34 EUR au taux de 655.957)
    const settleRes = settleWaitstaffOrder({
      orderId: order.id,
      tenders: {
        cashAmountXof: 20000,
        momoAmountXof: 30000,
        momoPhone: "+229 97 12 34 56",
        momoOperator: "MTN",
        tpeAmountXof: 15000,
        tpeReceiptRef: "TPE-BOA-89214",
        deviseAmountXof: 14000,
        deviseCurrency: "EUR",
        deviseRate: 655.957,
        deviseConvertedAmount: 14000 / 655.957,
      },
      kkiapayTransactionId: "kkiapay_tx_test_multi_01",
      waitstaffName: "Chantal Tossou",
    });

    expect(settleRes.success).toBe(true);
    expect(settleRes.payment?.paymentMethod).toBe("MULTI");
    expect(settleRes.payment?.totalAmountXof).toBe(79000);
    expect(settleRes.payment?.cashAmountXof).toBe(20000);
    expect(settleRes.payment?.mobileAmountXof).toBe(30000);
    expect(settleRes.payment?.tpeAmountXof).toBe(15000);
    expect(settleRes.payment?.deviseAmountXof).toBe(14000);
    expect(settleRes.payment?.tpeReceiptRef).toBe("TPE-BOA-89214");
    expect(settleRes.payment?.kkiapayTransactionId).toBe("kkiapay_tx_test_multi_01");
    expect(settleRes.payment?.fiscalNormalized).toBe(true);
    expect(settleRes.order?.status).toBe("PAID");
  });

  it("should ensure every product in the catalog has a valid photo imageUrl", () => {
    expect(WAITSTAFF_CATALOG.length).toBeGreaterThan(0);
    for (const prod of WAITSTAFF_CATALOG) {
      expect(prod.imageUrl).toBeDefined();
      expect(prod.imageUrl?.length).toBeGreaterThan(10);
      expect(prod.imageUrl?.startsWith("https://")).toBe(true);
    }
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

  it("should manage Barman KDS stock, threshold alerts and waitstaff remittance validations (DebitMaster Port)", () => {
    const barStocks = getBarmanStockItems("prop-bohicon-001");
    expect(barStocks.length).toBeGreaterThanOrEqual(8);

    const beninoiseStock = barStocks.find((s) => s.name.includes("Béninoise"));
    expect(beninoiseStock).toBeDefined();
    expect(beninoiseStock?.alertThreshold).toBe(24);
    expect(beninoiseStock?.unitSalePriceXof).toBe(1500);

    const initialUnits = beninoiseStock!.currentStockUnits;
    updateBarmanStockItem(beninoiseStock!.id, 12); // Received 1 crate of 12
    expect(beninoiseStock!.currentStockUnits).toBe(initialUnits + 12);

    // Check all server remittances accessible to barman
    const allRemittances = getAllServerRemittances("prop-bohicon-001");
    expect(allRemittances.length).toBeGreaterThan(0);
  });

  it("should manage Chef Cuisine meal brigade assignments and vivres stock levels (DebitMaster Port)", () => {
    const cooks = getKitchenCooks("prop-bohicon-001");
    expect(cooks.length).toBeGreaterThanOrEqual(4);
    expect(cooks.some((c) => c.roleTitle.includes("Chef"))).toBe(true);

    // Create an assignment
    const asgn = createKitchenAssignment({
      propertyId: "prop-bohicon-001",
      orderId: "ord-srv-001",
      orderNumber: "CMD-BOH-8821",
      orderItemId: "item-8821-1",
      productName: "Amiwo au Poulet Bicyclette Braisé",
      accompaniment: "Alloco fondant (Plantains frits)",
      specialInstructions: "Piment séparé",
      tableLabel: "Table 2",
      waitstaffName: "Chantal Tossou",
      cookId: cooks[1].id,
      quantity: 2,
    });

    expect(asgn.id).toBeDefined();
    expect(asgn.status).toBe("ASSIGNED");

    // Advance to IN_PREPARATION
    const adv1 = advanceKitchenAssignmentStatus(asgn.id, "IN_PREPARATION");
    expect(adv1).toBe(true);
    expect(asgn.status).toBe("IN_PREPARATION");

    // Advance to READY (triggers notification)
    const adv2 = advanceKitchenAssignmentStatus(asgn.id, "READY");
    expect(adv2).toBe(true);
    expect(asgn.status).toBe("READY");
    expect(asgn.preparedAt).toBeDefined();

    // Check cooking ingredients (vivres)
    const vivres = getKitchenVivresStockItems("prop-bohicon-001");
    expect(vivres.length).toBeGreaterThanOrEqual(8);
    expect(vivres.some((v) => v.name.includes("Bœuf"))).toBe(true);
    expect(vivres.some((v) => v.name.includes("Igname"))).toBe(true);

    const igname = vivres.find((v) => v.name.includes("Igname"))!;
    const prevQty = igname.currentStockQty;
    updateKitchenVivreStockItem(igname.id, 5);
    expect(igname.currentStockQty).toBe(prevQty + 5);
  });

  it("should handle replenishment requests and physical receipt for Barman and Chef", () => {
    const req = submitReplenishmentRequest({
      propertyId: "prop-bohicon-001",
      destinationStation: "BAR",
      requestedBy: "Pascal Agbossou",
      items: [
        { productName: "Bière Beaufort Lager 50cl", quantity: 5, unit: "Casiers de 12", reason: "Stock d'alerte" },
      ],
    });

    expect(req.id).toBeDefined();
    expect(req.status).toBe("PENDING_APPROVAL");

    const received = receiveStockTransfer(req.id);
    expect(received).toBe(true);
    expect(req.status).toBe("RECEIVED");
  });
});
