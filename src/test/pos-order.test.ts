import { describe, it, expect, beforeEach } from "vitest";
import { qrService } from "../modules/pos/qr-service";
import { orderService } from "../modules/pos/order-service";
import { folioService } from "../modules/finance/folio-service";
import { TenantContext } from "../lib/types/common";

describe("POS — QR Ordering, Station Routing & KDS", () => {
  const context: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-srv-boh",
    roles: ["WAITSTAFF"],
    permissions: [
      "pos:orders:create",
      "pos:orders:submit",
      "pos:orders:transfer_folio",
      "folios:charges:add",
    ],
  };

  beforeEach(() => {
    qrService.resetState();
    orderService.resetState();
    folioService.resetState();
  });

  it("generates an opaque QR token for a dining table or hotel room", async () => {
    const tableQr = qrService.createQrResource("prop-bohicon-001", "TABLE", "tbl-01");
    expect(tableQr.token.length).toBeGreaterThanOrEqual(24);
    expect(tableQr.revoked).toBe(false);

    // Resolve valid token
    const resolved = qrService.resolveToken(tableQr.token);
    expect(resolved?.propertyId).toBe("prop-bohicon-001");
    expect(resolved?.resourceType).toBe("TABLE");
    expect(resolved?.tableNumber).toBe("Table 1");

    // Revocation check
    qrService.revokeToken(tableQr.token);
    expect(qrService.resolveToken(tableQr.token)).toBeNull();
  });

  it("submits an order and automatically splits into Cuisine, Bar, and Cave tickets", async () => {
    const order = await orderService.createOrder({
      propertyId: "prop-bohicon-001",
      source: "QR_CLIENT",
      tableId: "tbl-01",
      customerNotes: "Sans piment s'il vous plaît",
      items: [
        { menuItemId: "item-01", quantity: 2 }, // Plat -> CUISINE (2x 5500 = 11000)
        { menuItemId: "item-03", quantity: 2 }, // Cocktail -> BAR (2x 3500 = 7000)
        { menuItemId: "item-04", quantity: 1 }, // Grand vin -> CAVE (1x 25000 = 25000)
      ],
    });

    expect(order.id).toBeDefined();
    expect(order.totalAmountXof).toBe(43000); // 11000 + 7000 + 25000

    // Verify 3 distinct station tickets created
    const tickets = orderService.getStationTicketsByOrder(order.id);
    expect(tickets).toHaveLength(3);

    const stationCodes = tickets.map((t) => t.stationCode);
    expect(stationCodes).toContain("CUISINE");
    expect(stationCodes).toContain("BAR");
    expect(stationCodes).toContain("CAVE");

    // Verify cuisine ticket contains only food
    const cuisineTicket = tickets.find((t) => t.stationCode === "CUISINE");
    expect(cuisineTicket?.itemsSummary).toContain("Amiwo");
    expect(cuisineTicket?.status).toBe("PENDING");
  });

  it("advances station ticket status and transfers order to stay folio", async () => {
    // Create an active folio first
    const folio = await folioService.getOrCreateFolio(context, "stay-101", "Client Test");

    const order = await orderService.createOrder({
      propertyId: "prop-bohicon-001",
      source: "WAITSTAFF",
      unitId: "unit-101",
      items: [{ menuItemId: "item-01", quantity: 1 }],
    });

    const tickets = orderService.getStationTicketsByOrder(order.id);
    const ticketId = tickets[0].id;

    // Acknowledge ticket
    const updatedTicket = orderService.updateTicketStatus(ticketId, "PREPARING");
    expect(updatedTicket.status).toBe("PREPARING");

    // Transfer order to Folio
    const transferred = await orderService.transferToFolio(context, order.id, folio.id);
    expect(transferred.folioId).toBe(folio.id);

    // Verify folio has the charge
    const updatedFolio = folioService.getFolioById(folio.id);
    expect(updatedFolio?.totalChargesXof).toBe(5500);
  });
});
