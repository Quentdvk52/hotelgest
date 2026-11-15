import { TenantContext } from "../../lib/types/common";
import { checkPermission } from "../../lib/auth/rbac";
import { createAuditLogEntry } from "../../lib/audit/logger";

export interface CreateCateringOrderDto {
  propertyId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // HH:MM
  deliveryLocation: string;
  serviceType: "LIVRAISON" | "RETRAIT" | "PRESTATION_AVEC_PERSONNEL";
  guestCount: number;
  dietaryNotes?: string;
  specialInstructions?: string;
  menuId?: string;
  items: {
    dishId?: string;
    name: string;
    quantityPortions: number;
    unitPriceXof: number;
    selectedOptions?: string;
  }[];
  deliveryFeeXof?: number;
}

export interface CateringOrderRecord {
  id: string;
  propertyId: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  eventDate: string;
  eventTime: string;
  deliveryLocation: string;
  serviceType: "LIVRAISON" | "RETRAIT" | "PRESTATION_AVEC_PERSONNEL";
  guestCount: number;
  dietaryNotes?: string;
  specialInstructions?: string;
  subtotalXof: number;
  deliveryFeeXof: number;
  totalAmountXof: number;
  status:
    | "DEMANDE_RECUE"
    | "DEVIS_ENVOYE"
    | "CONFIRMEE"
    | "EN_PREPARATION"
    | "PRETE"
    | "EN_LIVRAISON"
    | "LIVREE"
    | "ANNULEE";
  assignedStaff?: string;
  assignedVehicle?: string;
  folioId?: string;
  items: {
    id: string;
    dishId?: string;
    name: string;
    quantityPortions: number;
    unitPriceXof: number;
    totalPriceXof: number;
    selectedOptions?: string;
  }[];
  createdAt: Date;
}

class CateringService {
  private orders: CateringOrderRecord[] = [];

  public resetState() {
    this.orders = [];
  }

  public getOrdersByProperty(propertyId: string): CateringOrderRecord[] {
    return this.orders.filter((o) => o.propertyId === propertyId);
  }

  public getOrderById(id: string): CateringOrderRecord | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public async createCateringOrder(
    context: TenantContext,
    dto: CreateCateringOrderDto
  ): Promise<CateringOrderRecord> {
    if (!checkPermission(context, "catering:orders:create", dto.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de création de commande traiteur insuffisant.");
    }

    let subtotalXof = 0;
    const items = dto.items.map((item) => {
      const lineTotal = item.quantityPortions * item.unitPriceXof;
      subtotalXof += lineTotal;
      return {
        id: `citem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dishId: item.dishId,
        name: item.name,
        quantityPortions: item.quantityPortions,
        unitPriceXof: item.unitPriceXof,
        totalPriceXof: lineTotal,
        selectedOptions: item.selectedOptions,
      };
    });

    const deliveryFeeXof = dto.deliveryFeeXof || 0;
    const totalAmountXof = subtotalXof + deliveryFeeXof;
    const orderNumber = `TRT-${Date.now().toString().slice(-6)}`;

    const order: CateringOrderRecord = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      propertyId: dto.propertyId,
      orderNumber,
      clientName: dto.clientName,
      clientPhone: dto.clientPhone,
      clientEmail: dto.clientEmail,
      eventDate: dto.eventDate,
      eventTime: dto.eventTime,
      deliveryLocation: dto.deliveryLocation,
      serviceType: dto.serviceType,
      guestCount: dto.guestCount,
      dietaryNotes: dto.dietaryNotes,
      specialInstructions: dto.specialInstructions,
      subtotalXof,
      deliveryFeeXof,
      totalAmountXof,
      status: "DEMANDE_RECUE",
      items,
      createdAt: new Date(),
    };

    this.orders.push(order);

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: dto.propertyId,
      userId: context.userId,
      action: "CATERING_ORDER_CREATE",
      entityType: "CATERING_ORDER",
      entityId: order.id,
      details: {
        orderNumber,
        client: dto.clientName,
        totalAmountXof,
        eventDate: dto.eventDate,
      },
    });

    return order;
  }

  public async updateCateringStatus(
    context: TenantContext,
    orderId: string,
    updates: {
      status?: CateringOrderRecord["status"];
      assignedStaff?: string;
      assignedVehicle?: string;
    }
  ): Promise<CateringOrderRecord> {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error("NOT_FOUND: Commande traiteur introuvable.");
    }

    if (!checkPermission(context, "catering:orders:manage", order.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de gestion traiteur insuffisant.");
    }

    if (updates.status) order.status = updates.status;
    if (updates.assignedStaff) order.assignedStaff = updates.assignedStaff;
    if (updates.assignedVehicle) order.assignedVehicle = updates.assignedVehicle;

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: order.propertyId,
      userId: context.userId,
      action: "CATERING_STATUS_UPDATE",
      entityType: "CATERING_ORDER",
      entityId: order.id,
      details: { newStatus: updates.status, staff: updates.assignedStaff, vehicle: updates.assignedVehicle },
    });

    return order;
  }
}

export const cateringService = new CateringService();
