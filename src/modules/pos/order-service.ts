import { TenantContext } from "../../lib/types/common";
import { checkPermission } from "../../lib/auth/rbac";
import { createAuditLogEntry } from "../../lib/audit/logger";
import { SEED_MENU_ITEMS } from "../../lib/db/seed";
import { folioService } from "../finance/folio-service";

export interface CreateOrderDto {
  propertyId: string;
  source: "QR_CLIENT" | "WAITSTAFF";
  tableId?: string;
  unitId?: string;
  waiterId?: string;
  customerNotes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
}

export interface OrderRecord {
  id: string;
  propertyId: string;
  orderNumber: string;
  source: "QR_CLIENT" | "WAITSTAFF";
  tableId?: string;
  unitId?: string;
  waiterId?: string;
  status: "SUBMITTED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
  totalAmountXof: number;
  customerNotes?: string;
  folioId?: string;
  lines: OrderLineItem[];
  createdAt: Date;
}

export interface OrderLineItem {
  id: string;
  menuItemId: string;
  name: string;
  targetStationCode: "CUISINE" | "BAR" | "CAVE";
  quantity: number;
  unitPriceXof: number;
  totalPriceXof: number;
  specialInstructions?: string;
}

export interface StationTicketRecord {
  id: string;
  propertyId: string;
  orderId: string;
  stationCode: "CUISINE" | "BAR" | "CAVE";
  ticketNumber: string;
  itemsSummary: string;
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED";
  createdAt: Date;
  acknowledgedAt?: Date;
  completedAt?: Date;
}

class OrderService {
  private orders: OrderRecord[] = [];
  private tickets: StationTicketRecord[] = [];

  public resetState() {
    this.orders = [];
    this.tickets = [];
  }

  public getOrdersByProperty(propertyId: string): OrderRecord[] {
    return this.orders.filter((o) => o.propertyId === propertyId);
  }

  public getOrderById(id: string): OrderRecord | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public getStationTicketsByOrder(orderId: string): StationTicketRecord[] {
    return this.tickets.filter((t) => t.orderId === orderId);
  }

  public getTicketsByStation(
    propertyId: string,
    stationCode: "CUISINE" | "BAR" | "CAVE"
  ): StationTicketRecord[] {
    return this.tickets.filter(
      (t) => t.propertyId === propertyId && t.stationCode === stationCode
    );
  }

  public async createOrder(dto: CreateOrderDto): Promise<OrderRecord> {
    if (dto.items.length === 0) {
      throw new Error("VALIDATION_ERROR: La commande doit contenir au moins un article.");
    }

    let totalAmount = 0;
    const lines: OrderLineItem[] = [];

    for (const item of dto.items) {
      const menuItem = SEED_MENU_ITEMS.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`NOT_FOUND: Article introuvable (${item.menuItemId})`);
      }

      const lineTotal = menuItem.priceXof * item.quantity;
      totalAmount += lineTotal;

      lines.push({
        id: `oline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        targetStationCode: menuItem.targetStationCode as "CUISINE" | "BAR" | "CAVE",
        quantity: item.quantity,
        unitPriceXof: menuItem.priceXof,
        totalPriceXof: lineTotal,
        specialInstructions: item.specialInstructions,
      });
    }

    const orderNumber = `CMD-${Date.now().toString().slice(-6)}`;
    const order: OrderRecord = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      propertyId: dto.propertyId,
      orderNumber,
      source: dto.source,
      tableId: dto.tableId,
      unitId: dto.unitId,
      waiterId: dto.waiterId,
      status: "SUBMITTED",
      totalAmountXof: totalAmount,
      customerNotes: dto.customerNotes,
      lines,
      createdAt: new Date(),
    };

    this.orders.push(order);

    // Group items by target station and create station tickets
    const stationGroups = new Map<"CUISINE" | "BAR" | "CAVE", OrderLineItem[]>();
    for (const line of lines) {
      const list = stationGroups.get(line.targetStationCode) || [];
      list.push(line);
      stationGroups.set(line.targetStationCode, list);
    }

    for (const [stationCode, groupLines] of stationGroups.entries()) {
      const summary = groupLines
        .map((l) => `${l.quantity}x ${l.name}${l.specialInstructions ? ` (${l.specialInstructions})` : ""}`)
        .join(", ");

      const ticket: StationTicketRecord = {
        id: `tkt-${stationCode.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        propertyId: dto.propertyId,
        orderId: order.id,
        stationCode,
        ticketNumber: `TK-${orderNumber}-${stationCode}`,
        itemsSummary: summary,
        status: "PENDING",
        createdAt: new Date(),
      };

      this.tickets.push(ticket);
    }

    return order;
  }

  public updateTicketStatus(
    ticketId: string,
    status: "ACCEPTED" | "PREPARING" | "READY" | "SERVED"
  ): StationTicketRecord {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      throw new Error("NOT_FOUND: Ticket de station introuvable.");
    }

    ticket.status = status;
    if (status === "ACCEPTED" || status === "PREPARING") {
      ticket.acknowledgedAt = new Date();
    }
    if (status === "READY" || status === "SERVED") {
      ticket.completedAt = new Date();
    }

    return ticket;
  }

  public async transferToFolio(
    context: TenantContext,
    orderId: string,
    folioId: string
  ): Promise<OrderRecord> {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error("NOT_FOUND: Commande introuvable.");
    }

    if (!checkPermission(context, "pos:orders:transfer_folio", order.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de transfert au folio insuffisant.");
    }

    // Add charge to the folio
    await folioService.addCharge(context, folioId, {
      departmentCode: "RESTAURANT",
      description: `Restauration / Bar (${order.orderNumber})`,
      amountXof: order.totalAmountXof,
      sourceReference: order.id,
    });

    order.folioId = folioId;

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: order.propertyId,
      userId: context.userId,
      action: "ORDER_TRANSFER_FOLIO",
      entityType: "ORDER",
      entityId: order.id,
      details: { orderNumber: order.orderNumber, folioId, amountXof: order.totalAmountXof },
    });

    return order;
  }
}

export const orderService = new OrderService();
