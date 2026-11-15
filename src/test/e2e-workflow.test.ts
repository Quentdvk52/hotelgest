import { describe, it, expect, beforeEach } from "vitest";
import { pmsService } from "../modules/pms/pms-service";
import { folioService } from "../modules/finance/folio-service";
import { cashService } from "../modules/finance/cash-service";
import { qrService } from "../modules/pos/qr-service";
import { orderService } from "../modules/pos/order-service";
import { cateringService } from "../modules/catering-equipment/catering-service";
import { equipmentService } from "../modules/catering-equipment/equipment-service";
import { discountService } from "../modules/governance/discount-service";
import { nightAuditService } from "../modules/night-audit/audit-service";
import { syscohadaService } from "../modules/accounting/syscohada-service";
import { chariowService } from "../modules/subscription/chariow-service";
import { checkPermission, hasPropertyAccess, getRoleDefaultPermissions } from "../lib/auth/rbac";
import { TenantContext } from "../lib/types/common";
import { envConfig } from "../lib/config";
import crypto from "crypto";

describe("HotelGest E2E Integration — Validation des 10 Critères d'Acceptation", () => {
  const bohiconReceptionist: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-rec-boh",
    roles: ["RECEPTIONIST"],
    permissions: getRoleDefaultPermissions("RECEPTIONIST"),
  };

  const managerContext: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-dir-boh",
    roles: ["PROPERTY_MANAGER"],
    permissions: getRoleDefaultPermissions("PROPERTY_MANAGER"),
  };

  beforeEach(() => {
    pmsService.resetState();
    folioService.resetState();
    cashService.resetState();
    qrService.resetState();
    orderService.resetState();
    cateringService.resetState();
    equipmentService.resetState();
    discountService.resetState();
    nightAuditService.resetState();
    syscohadaService.resetState();
    chariowService.resetState();
  });

  it("Critère 1 & 2: Isolation multi-tenant et cloisonnement des 4 sites Le Vignoble", () => {
    // Receptionist at Bohicon cannot access Abomey-Calavi
    expect(hasPropertyAccess(bohiconReceptionist, "prop-calavi-003")).toBe(false);
    expect(checkPermission(bohiconReceptionist, "pms:reservations:create", "prop-calavi-003")).toBe(false);

    // Can access their own site
    expect(hasPropertyAccess(bohiconReceptionist, "prop-bohicon-001")).toBe(true);
    expect(checkPermission(bohiconReceptionist, "pms:reservations:create", "prop-bohicon-001")).toBe(true);
  });

  it("Critère 3: Réservation de chambre et prévention stricte de chevauchement concurrent", async () => {
    const res1 = await pmsService.createReservation(bohiconReceptionist, {
      propertyId: "prop-bohicon-001",
      guestName: "M. Dossou Mathieu",
      guestPhone: "+229 97 01 02 03",
      unitId: "unit-101",
      roomTypeId: "rt-std-boh",
      checkInDate: "2026-12-01",
      checkOutDate: "2026-12-04",
      numGuests: 2,
    });
    expect(res1.status).toBe("CONFIRMED");

    // Overlapping booking on same unit must fail
    await expect(
      pmsService.createReservation(bohiconReceptionist, {
        propertyId: "prop-bohicon-001",
        guestName: "Client Concurrence",
        guestPhone: "+229 97 99 99 99",
        unitId: "unit-101",
        roomTypeId: "rt-std-boh",
        checkInDate: "2026-12-02",
        checkOutDate: "2026-12-05",
        numGuests: 1,
      })
    ).rejects.toThrow("OVERBOOKING_PREVENTED");
  });

  it("Critère 4: Check-in voyageur, folio, charges, règlement externe et check-out", async () => {
    const res = await pmsService.createReservation(bohiconReceptionist, {
      propertyId: "prop-bohicon-001",
      guestName: "Awa Touré",
      guestPhone: "+229 97 10 20 30",
      unitId: "unit-102",
      roomTypeId: "rt-std-boh",
      checkInDate: "2026-12-10",
      checkOutDate: "2026-12-12",
      numGuests: 1,
    });

    const stay = await pmsService.performCheckIn(bohiconReceptionist, res.id, "unit-102");
    expect(stay.status).toBe("ACTIVE");

    // Add room charge to Folio
    const folio = await folioService.getOrCreateFolio(bohiconReceptionist, stay.id, "Awa Touré");
    await folioService.addCharge(bohiconReceptionist, folio.id, {
      departmentCode: "ROOM",
      description: "Séjour 2 nuitées",
      amountXof: 50000,
    });

    // Record declared payment via Mobile Money
    await folioService.recordPayment(bohiconReceptionist, folio.id, {
      paymentMethod: "MOBILE_MONEY",
      amountXof: 50000,
      reference: "MTN-MOMO-20261210-98",
    });

    const settledFolio = folioService.getFolioById(folio.id);
    expect(settledFolio?.balanceXof).toBe(0);

    // Perform check-out
    const checkOut = await pmsService.performCheckOut(bohiconReceptionist, stay.id);
    expect(checkOut.stay.status).toBe("COMPLETED");
    expect(checkOut.unit.housekeepingStatus).toBe("DIRTY");
  });

  it("Critère 5: Commande QR, séparation des stations (Cuisine, Bar, Cave) et transfert folio", async () => {
    const order = await orderService.createOrder({
      propertyId: "prop-bohicon-001",
      source: "QR_CLIENT",
      tableId: "tbl-01",
      items: [
        { menuItemId: "item-01", quantity: 2 }, // Plat -> CUISINE
        { menuItemId: "item-03", quantity: 2 }, // Cocktail -> BAR
        { menuItemId: "item-04", quantity: 1 }, // Grand vin -> CAVE
      ],
    });

    const tickets = orderService.getStationTicketsByOrder(order.id);
    expect(tickets).toHaveLength(3);
    expect(tickets.map((t) => t.stationCode)).toEqual(expect.arrayContaining(["CUISINE", "BAR", "CAVE"]));

    // Transfer order to an active folio
    const folio = await folioService.getOrCreateFolio(bohiconReceptionist, "stay-test-01", "Client Test");
    const transferred = await orderService.transferToFolio(bohiconReceptionist, order.id, folio.id);
    expect(transferred.folioId).toBe(folio.id);
    expect(folioService.getFolioById(folio.id)?.totalChargesXof).toBe(order.totalAmountXof);
  });

  it("Critère 6: Service Traiteur et Location de Matériel avec caution et état des lieux", async () => {
    // 1. Catering order
    const cateringOrder = await cateringService.createCateringOrder(managerContext, {
      propertyId: "prop-bohicon-001",
      clientName: "Séminaire Régional",
      clientPhone: "+229 97 44 44 44",
      eventDate: "2026-12-28",
      eventTime: "12:00",
      deliveryLocation: "Hôtel Le Vignoble Bohicon",
      serviceType: "PRESTATION_AVEC_PERSONNEL",
      guestCount: 40,
      items: [{ name: "Buffet Prestige Béninois", quantityPortions: 40, unitPriceXof: 12000 }],
      deliveryFeeXof: 25000,
    });
    expect(cateringOrder.totalAmountXof).toBe(40 * 12000 + 25000);

    // 2. Equipment rental linked
    const rental = await equipmentService.createRental(managerContext, {
      propertyId: "prop-bohicon-001",
      clientName: "Séminaire Régional",
      clientPhone: "+229 97 44 44 44",
      startDate: "2026-12-28",
      endDate: "2026-12-28",
      eventLocation: "Salle des Fêtes",
      cateringOrderId: cateringOrder.id,
      items: [
        { itemId: "eq-chaise-nap", quantity: 40 },
        { itemId: "eq-table-ronde", quantity: 4 },
      ],
    });
    expect(rental.status).toBe("RESERVED");

    // Departure inspection
    await equipmentService.performInspection(managerContext, {
      rentalId: rental.id,
      type: "DEPART",
      damagedCount: 0,
      lostCount: 0,
    });
    expect(equipmentService.getRentalById(rental.id)?.status).toBe("DISPATCHED");

    // Return inspection with 1 table damaged
    await equipmentService.performInspection(managerContext, {
      rentalId: rental.id,
      type: "RETOUR",
      damagedCount: 1,
      lostCount: 0,
      damageFeeAssessedXof: 10000,
      comments: "Pied de table faussé réparable",
    });
    const finalized = equipmentService.getRentalById(rental.id);
    expect(finalized?.status).toBe("RETURNED_DAMAGED");
    expect(finalized?.depositRetainedXof).toBe(10000);
  });

  it("Critère 7: Remise avec contrôle de seuils d'approbation et anti-contournement", async () => {
    const req = await discountService.createDiscountRequest(bohiconReceptionist, {
      propertyId: "prop-bohicon-001",
      targetType: "FOLIO",
      targetId: "fol-001",
      discountType: "PERCENT",
      discountValue: 20,
      reason: "Geste commercial client fidèle",
    });

    // Receptionist cannot approve 20% (ceiling is 5% and lacks approve right)
    await expect(
      discountService.reviewDiscountRequest(bohiconReceptionist, req.id, { decision: "APPROVED" })
    ).rejects.toThrow("PERMISSION_DENIED");

    // Property Manager (ceiling 25%) can approve 20%
    const approved = await discountService.reviewDiscountRequest(managerContext, req.id, {
      decision: "APPROVED",
      notes: "Validé direction",
    });
    expect(approved.status).toBe("APPROVED");
  });

  it("Critère 8: Clôture de caisse avec écart justifié et Night Audit", async () => {
    const session = await cashService.openSession(managerContext, "caisse-01", 50000);
    cashService.addCashMovement(session.id, 25000); // Theoretical: 75 000

    // Attempt close with 70 000 without reason -> REJECTED
    await expect(
      cashService.closeSession(managerContext, session.id, 70000)
    ).rejects.toThrow("DISCREPANCY_JUSTIFICATION_REQUIRED");

    // Close with justification -> ACCEPTED
    const closed = await cashService.closeSession(
      managerContext,
      session.id,
      70000,
      "Erreur de monnaie client non réclamée"
    );
    expect(closed.status).toBe("CLOSED");

    // Night Audit execution
    const audit = await nightAuditService.executeNightAudit(
      managerContext,
      "prop-bohicon-001",
      "2026-12-01"
    );
    expect(audit.isLocked).toBe(true);
  });

  it("Critère 9: Abonnement Chariow vérifié par HMAC, idempotent et non rejouable", async () => {
    const payload = JSON.stringify({
      event_id: "evt_e2e_chariow_101",
      event_type: "subscription.created",
      tenant_id: "tenant-vignoble-001",
      plan_code: "SEMIANNUAL_540K",
      amount_xof: 540000,
    });
    const signature = crypto
      .createHmac("sha256", envConfig.CHARIOW.WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const result = await chariowService.processWebhook(payload, signature);
    expect(result.success).toBe(true);

    // Replay should be detected as duplicate
    const replay = await chariowService.processWebhook(payload, signature);
    expect(replay.isDuplicate).toBe(true);
  });

  it("Critère 10: Écritures SYSCOHADA équilibrées (Débit = Crédit)", async () => {
    syscohadaService.recordTransaction({
      propertyId: "prop-bohicon-001",
      date: "2026-12-01",
      reference: "FOL-E2E",
      label: "Séjour + Restauration",
      category: "ROOM",
      amountXof: 65000,
      paymentMethod: "CASH",
    });

    const entries = syscohadaService.getJournalEntries("prop-bohicon-001");
    const totalDebit = entries.reduce((s, e) => s + e.debitXof, 0);
    const totalCredit = entries.reduce((s, e) => s + e.creditXof, 0);

    expect(totalDebit).toBe(totalCredit);
    expect(totalDebit).toBe(65000);
  });
});
