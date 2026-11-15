import { TenantContext } from "../../lib/types/common";
import { checkPermission } from "../../lib/auth/rbac";
import { createAuditLogEntry } from "../../lib/audit/logger";
import { SEED_USERS } from "../../lib/db/seed";

export interface CreateDiscountRequestDto {
  propertyId: string;
  targetType: "FOLIO" | "ORDER" | "CATERING_ORDER" | "EQUIPMENT_RENTAL";
  targetId: string;
  discountType: "PERCENT" | "FIXED_AMOUNT";
  discountValue: number;
  reason: string;
}

export interface ReviewDiscountDto {
  decision: "APPROVED" | "REJECTED";
  notes?: string;
}

export interface DiscountRequestRecord {
  id: string;
  tenantId: string;
  propertyId: string;
  requestedByUserId: string;
  reviewedByUserId?: string;
  targetType: "FOLIO" | "ORDER" | "CATERING_ORDER" | "EQUIPMENT_RENTAL";
  targetId: string;
  discountType: "PERCENT" | "FIXED_AMOUNT";
  discountValue: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

class DiscountService {
  private requests: DiscountRequestRecord[] = [];

  public resetState() {
    this.requests = [];
  }

  public getRequestsByProperty(propertyId: string): DiscountRequestRecord[] {
    return this.requests.filter((r) => r.propertyId === propertyId);
  }

  public getRequestById(id: string): DiscountRequestRecord | undefined {
    return this.requests.find((r) => r.id === id);
  }

  public async createDiscountRequest(
    context: TenantContext,
    dto: CreateDiscountRequestDto
  ): Promise<DiscountRequestRecord> {
    if (!checkPermission(context, "discounts:request", dto.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de demande de remise insuffisant.");
    }

    if (dto.discountValue <= 0) {
      throw new Error("VALIDATION_ERROR: Le montant ou pourcentage de remise doit être supérieur à zéro.");
    }

    const request: DiscountRequestRecord = {
      id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: context.tenantId,
      propertyId: dto.propertyId,
      requestedByUserId: context.userId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      reason: dto.reason,
      status: "PENDING",
      createdAt: new Date(),
    };

    this.requests.push(request);

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: dto.propertyId,
      userId: context.userId,
      action: "DISCOUNT_REQUEST_CREATE",
      entityType: "DISCOUNT_REQUEST",
      entityId: request.id,
      details: {
        target: `${dto.targetType}:${dto.targetId}`,
        value: `${dto.discountValue} (${dto.discountType})`,
        reason: dto.reason,
      },
    });

    return request;
  }

  public async reviewDiscountRequest(
    context: TenantContext,
    requestId: string,
    dto: ReviewDiscountDto
  ): Promise<DiscountRequestRecord> {
    const request = this.getRequestById(requestId);
    if (!request || request.status !== "PENDING") {
      throw new Error("NOT_FOUND: Demande de remise introuvable ou déjà traitée.");
    }

    if (!checkPermission(context, "discounts:approve", request.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit d'approbation de remise insuffisant.");
    }

    // Lookup reviewer's maximum discount threshold
    const reviewer = SEED_USERS.find((u) => u.id === context.userId);
    const maxThreshold = reviewer ? parseInt(reviewer.maxDiscount, 10) : 0;

    if (dto.decision === "APPROVED") {
      if (request.discountType === "PERCENT" && request.discountValue > maxThreshold) {
        throw new Error(
          `PERMISSION_DENIED: Le seuil d'approbation de votre rôle (${maxThreshold}%) est inférieur à la remise demandée (${request.discountValue}%). Approbation supérieure requise.`
        );
      }
    }

    request.status = dto.decision;
    request.reviewedByUserId = context.userId;
    request.reviewNotes = dto.notes;
    request.reviewedAt = new Date();

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: request.propertyId,
      userId: context.userId,
      action: `DISCOUNT_REQUEST_${dto.decision}`,
      entityType: "DISCOUNT_REQUEST",
      entityId: request.id,
      details: {
        decision: dto.decision,
        notes: dto.notes,
        value: request.discountValue,
      },
    });

    return request;
  }
}

export const discountService = new DiscountService();
