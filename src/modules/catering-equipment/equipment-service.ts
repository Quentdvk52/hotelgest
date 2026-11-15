import { TenantContext } from "../../lib/types/common";
import { checkPermission } from "../../lib/auth/rbac";
import { createAuditLogEntry } from "../../lib/audit/logger";
import { SEED_EQUIPMENT_ITEMS } from "../../lib/db/seed";

export interface EquipmentItemRecord {
  id: string;
  propertyId: string;
  name: string;
  category: "CHAISES" | "TABLES" | "BACHES" | "COUVERTS" | "PLATS_VAISSELLE" | "SON_LUMIERE" | "AUTRE";
  totalStock: number;
  dailyRentalPriceXof: number;
  depositPerUnitXof: number;
  replacementCostXof: number;
}

export interface CreateRentalDto {
  propertyId: string;
  clientName: string;
  clientPhone: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  eventLocation: string;
  deliveryTime?: string;
  pickupTime?: string;
  transportFeeXof?: number;
  cateringOrderId?: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
}

export interface EquipmentRentalRecord {
  id: string;
  propertyId: string;
  rentalNumber: string;
  clientName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  eventLocation: string;
  rentalTotalXof: number;
  transportFeeXof: number;
  totalDepositXof: number;
  depositRetainedXof: number;
  depositRefundedXof: number;
  status: "DRAFT" | "RESERVED" | "DISPATCHED" | "RETURNED_COMPLETE" | "RETURNED_DAMAGED" | "CANCELLED";
  cateringOrderId?: string;
  folioId?: string;
  lines: {
    id: string;
    itemId: string;
    name: string;
    quantity: number;
    unitPriceXof: number;
    totalPriceXof: number;
    unitDepositXof: number;
  }[];
  createdAt: Date;
}

export interface PerformInspectionDto {
  rentalId: string;
  type: "DEPART" | "RETOUR";
  damagedCount: number;
  lostCount: number;
  damageFeeAssessedXof?: number;
  comments?: string;
}

export interface InspectionRecord {
  id: string;
  rentalId: string;
  type: "DEPART" | "RETOUR";
  inspectedByUserId: string;
  damagedCount: number;
  lostCount: number;
  damageFeeAssessedXof: number;
  comments?: string;
  inspectionDate: Date;
}

class EquipmentService {
  private items: EquipmentItemRecord[] = [];
  private rentals: EquipmentRentalRecord[] = [];
  private inspections: InspectionRecord[] = [];

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.items = SEED_EQUIPMENT_ITEMS.map((item) => ({
      id: item.id,
      propertyId: item.propertyId,
      name: item.name,
      category: item.category as EquipmentItemRecord["category"],
      totalStock: item.totalStock,
      dailyRentalPriceXof: item.dailyRentalPriceXof,
      depositPerUnitXof: item.depositPerUnitXof,
      replacementCostXof: item.replacementCostXof,
    }));
    this.rentals = [];
    this.inspections = [];
  }

  public getItemsByProperty(propertyId: string): EquipmentItemRecord[] {
    return this.items.filter((i) => i.propertyId === propertyId);
  }

  public getRentalsByProperty(propertyId: string): EquipmentRentalRecord[] {
    return this.rentals.filter((r) => r.propertyId === propertyId);
  }

  public getRentalById(id: string): EquipmentRentalRecord | undefined {
    return this.rentals.find((r) => r.id === id);
  }

  public async getAvailableQuantity(
    propertyId: string,
    itemId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const item = this.items.find((i) => i.id === itemId && i.propertyId === propertyId);
    if (!item) return 0;

    let rentedQuantity = 0;
    for (const rental of this.rentals) {
      if (rental.propertyId !== propertyId) continue;
      if (rental.status === "CANCELLED" || rental.status === "RETURNED_COMPLETE" || rental.status === "RETURNED_DAMAGED") {
        continue;
      }
      // Check date overlap
      if (startDate < rental.endDate && endDate > rental.startDate) {
        const line = rental.lines.find((l) => l.itemId === itemId);
        if (line) {
          rentedQuantity += line.quantity;
        }
      }
    }

    return Math.max(0, item.totalStock - rentedQuantity);
  }

  public async createRental(
    context: TenantContext,
    dto: CreateRentalDto
  ): Promise<EquipmentRentalRecord> {
    if (!checkPermission(context, "equipment:rentals:create", dto.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de location de matériel insuffisant.");
    }

    const days = Math.max(
      1,
      Math.round(
        (new Date(dto.endDate).getTime() - new Date(dto.startDate).getTime()) /
          (1000 * 3600 * 24)
      )
    );

    let rentalTotalXof = 0;
    let totalDepositXof = 0;
    const lines = [];

    for (const reqItem of dto.items) {
      const item = this.items.find((i) => i.id === reqItem.itemId);
      if (!item) {
        throw new Error(`NOT_FOUND: Matériel introuvable (${reqItem.itemId})`);
      }

      // Overbooking prevention check
      const available = await this.getAvailableQuantity(
        dto.propertyId,
        item.id,
        dto.startDate,
        dto.endDate
      );

      if (available < reqItem.quantity) {
        throw new Error(
          `EQUIPMENT_STOCK_EXCEEDED: Stock insuffisant pour "${item.name}" (Disponible: ${available}, Demandé: ${reqItem.quantity})`
        );
      }

      const itemTotalPrice = item.dailyRentalPriceXof * days * reqItem.quantity;
      const itemDeposit = item.depositPerUnitXof * reqItem.quantity;

      rentalTotalXof += itemTotalPrice;
      totalDepositXof += itemDeposit;

      lines.push({
        id: `rline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId: item.id,
        name: item.name,
        quantity: reqItem.quantity,
        unitPriceXof: item.dailyRentalPriceXof,
        totalPriceXof: itemTotalPrice,
        unitDepositXof: item.depositPerUnitXof,
      });
    }

    const transportFeeXof = dto.transportFeeXof || 0;
    const rentalNumber = `LOC-${Date.now().toString().slice(-6)}`;

    const rental: EquipmentRentalRecord = {
      id: `rent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      propertyId: dto.propertyId,
      rentalNumber,
      clientName: dto.clientName,
      clientPhone: dto.clientPhone,
      startDate: dto.startDate,
      endDate: dto.endDate,
      eventLocation: dto.eventLocation,
      rentalTotalXof,
      transportFeeXof,
      totalDepositXof,
      depositRetainedXof: 0,
      depositRefundedXof: 0,
      status: "RESERVED",
      cateringOrderId: dto.cateringOrderId,
      lines,
      createdAt: new Date(),
    };

    this.rentals.push(rental);

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: dto.propertyId,
      userId: context.userId,
      action: "EQUIPMENT_RENTAL_CREATE",
      entityType: "EQUIPMENT_RENTAL",
      entityId: rental.id,
      details: {
        rentalNumber,
        client: dto.clientName,
        totalRental: rentalTotalXof,
        totalDeposit: totalDepositXof,
        dates: `${dto.startDate} au ${dto.endDate}`,
      },
    });

    return rental;
  }

  public async performInspection(
    context: TenantContext,
    dto: PerformInspectionDto
  ): Promise<InspectionRecord> {
    const rental = this.getRentalById(dto.rentalId);
    if (!rental) {
      throw new Error("NOT_FOUND: Dossier de location introuvable.");
    }

    if (!checkPermission(context, "equipment:inspections:perform", rental.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de réalisation d'état des lieux insuffisant.");
    }

    const damageFee = dto.damageFeeAssessedXof || 0;

    if (dto.type === "DEPART") {
      rental.status = "DISPATCHED";
    } else {
      // RETOUR
      if (dto.damagedCount > 0 || dto.lostCount > 0 || damageFee > 0) {
        rental.status = "RETURNED_DAMAGED";
        rental.depositRetainedXof = damageFee;
        rental.depositRefundedXof = Math.max(0, rental.totalDepositXof - damageFee);
      } else {
        rental.status = "RETURNED_COMPLETE";
        rental.depositRetainedXof = 0;
        rental.depositRefundedXof = rental.totalDepositXof;
      }
    }

    const inspection: InspectionRecord = {
      id: `insp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rentalId: rental.id,
      type: dto.type,
      inspectedByUserId: context.userId,
      damagedCount: dto.damagedCount,
      lostCount: dto.lostCount,
      damageFeeAssessedXof: damageFee,
      comments: dto.comments,
      inspectionDate: new Date(),
    };

    this.inspections.push(inspection);

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: rental.propertyId,
      userId: context.userId,
      action: `EQUIPMENT_INSPECTION_${dto.type}`,
      entityType: "EQUIPMENT_RENTAL",
      entityId: rental.id,
      details: {
        type: dto.type,
        damagedCount: dto.damagedCount,
        lostCount: dto.lostCount,
        feeAssessed: damageFee,
        depositRefunded: rental.depositRefundedXof,
      },
    });

    return inspection;
  }
}

export const equipmentService = new EquipmentService();
