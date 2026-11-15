import { describe, it, expect, beforeEach } from "vitest";
import { folioService } from "../modules/finance/folio-service";
import { cashService } from "../modules/finance/cash-service";
import { TenantContext } from "../lib/types/common";

describe("Finance, Folios & Cash Management", () => {
  const context: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-rec-boh",
    roles: ["RECEPTIONIST"],
    permissions: [
      "cash:session:open",
      "cash:session:close",
      "cash:payment:record",
      "folios:charges:add",
      "invoices:generate",
    ],
  };

  beforeEach(() => {
    folioService.resetState();
    cashService.resetState();
  });

  it("creates a folio, adds charges, and computes total balance", async () => {
    const folio = await folioService.getOrCreateFolio(context, "stay-001", "Dossou Mathieu");
    expect(folio.id).toBeDefined();

    // Add room charge
    await folioService.addCharge(context, folio.id, {
      departmentCode: "ROOM",
      description: "Nuitée Chambre 101",
      amountXof: 25000,
    });

    // Add restaurant charge
    await folioService.addCharge(context, folio.id, {
      departmentCode: "RESTAURANT",
      description: "Amiwo au Poulet + Boissons",
      amountXof: 9000,
    });

    const updated = folioService.getFolioById(folio.id);
    expect(updated?.totalChargesXof).toBe(34000);
    expect(updated?.balanceXof).toBe(34000);
  });

  it("records payment across accepted offline modes (Cash, Mobile Money, TPE)", async () => {
    const folio = await folioService.getOrCreateFolio(context, "stay-002", "Awa Touré");
    await folioService.addCharge(context, folio.id, {
      departmentCode: "ROOM",
      description: "Chambre Supérieure",
      amountXof: 38000,
    });

    // Record partial Mobile Money payment
    const payment1 = await folioService.recordPayment(context, folio.id, {
      paymentMethod: "MOBILE_MONEY",
      amountXof: 20000,
      reference: "MTN-MOMO-20261115-098",
    });
    expect(payment1.amountXof).toBe(20000);

    // Record remaining in Cash
    await folioService.recordPayment(context, folio.id, {
      paymentMethod: "CASH",
      amountXof: 18000,
      reference: "RECU-ESP-001",
    });

    const updated = folioService.getFolioById(folio.id);
    expect(updated?.totalPaymentsXof).toBe(38000);
    expect(updated?.balanceXof).toBe(0);
  });

  it("handles cash drawer sessions and flags unexcused discrepancies (Review Focus #5)", async () => {
    // Open cash session with 50 000 XOF starting cash
    const session = await cashService.openSession(context, "caisse-rec-boh", 50000);
    expect(session.status).toBe("OPEN");
    expect(session.openingBalanceXof).toBe(50000);
    expect(session.theoreticalBalanceXof).toBe(50000);

    // Cash sale recorded in this session: +15 000 XOF
    cashService.addCashMovement(session.id, 15000);

    // Theoretical cash is now 65 000 XOF
    const active = cashService.getSessionById(session.id);
    expect(active?.theoreticalBalanceXof).toBe(65000);

    // Attempting to close with discrepancy (counted 60 000 instead of 65 000) WITHOUT reason -> MUST REJECT
    await expect(
      cashService.closeSession(context, session.id, 60000)
    ).rejects.toThrow("DISCREPANCY_JUSTIFICATION_REQUIRED");

    // Close WITH legitimate audited justification -> ACCEPTED
    const closed = await cashService.closeSession(
      context,
      session.id,
      60000,
      "Erreur rendu monnaie client non réclamé"
    );
    expect(closed.status).toBe("CLOSED");
    expect(closed.discrepancyXof).toBe(-5000);
    expect(closed.discrepancyReason).toBe("Erreur rendu monnaie client non réclamé");
  });
});
