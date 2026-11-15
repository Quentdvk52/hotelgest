import { TenantContext } from "../../lib/types/common";
import { checkPermission } from "../../lib/auth/rbac";
import { createAuditLogEntry } from "../../lib/audit/logger";

export interface FolioRecord {
  id: string;
  tenantId: string;
  propertyId: string;
  folioNumber: string;
  stayId?: string;
  guestName: string;
  totalChargesXof: number;
  totalPaymentsXof: number;
  balanceXof: number;
  status: "OPEN" | "CLOSED";
  lines: FolioLineRecord[];
  createdAt: Date;
}

export interface FolioLineRecord {
  id: string;
  folioId: string;
  departmentCode: "ROOM" | "RESTAURANT" | "BAR" | "CATERING" | "EQUIPMENT";
  description: text;
  amountXof: number;
  sourceReference?: string;
  createdAt: Date;
}

export interface AddChargeDto {
  departmentCode: "ROOM" | "RESTAURANT" | "BAR" | "CATERING" | "EQUIPMENT";
  description: string;
  amountXof: number;
  sourceReference?: string;
}

export interface RecordPaymentDto {
  paymentMethod: "CASH" | "TPE" | "BANK_TRANSFER" | "MOBILE_MONEY";
  amountXof: number;
  reference?: string;
  notes?: string;
}

export interface PaymentRecordItem {
  id: string;
  folioId: string;
  propertyId: string;
  recordedByUserId: string;
  paymentMethod: "CASH" | "TPE" | "BANK_TRANSFER" | "MOBILE_MONEY";
  amountXof: number;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

class FolioService {
  private folios: FolioRecord[] = [];
  private payments: PaymentRecordItem[] = [];

  public resetState() {
    this.folios = [];
    this.payments = [];
  }

  public getFolioById(id: string): FolioRecord | undefined {
    return this.folios.find((f) => f.id === id);
  }

  public getFoliosByProperty(propertyId: string): FolioRecord[] {
    return this.folios.filter((f) => f.propertyId === propertyId);
  }

  public async getOrCreateFolio(
    context: TenantContext,
    stayId: string,
    guestName: string
  ): Promise<FolioRecord> {
    const existing = this.folios.find((f) => f.stayId === stayId);
    if (existing) return existing;

    const folio: FolioRecord = {
      id: `fol-${stayId}`,
      tenantId: context.tenantId,
      propertyId: context.propertyId,
      folioNumber: `FOL-${Date.now().toString().slice(-6)}`,
      stayId: stayId,
      guestName: guestName,
      totalChargesXof: 0,
      totalPaymentsXof: 0,
      balanceXof: 0,
      status: "OPEN",
      lines: [],
      createdAt: new Date(),
    };

    this.folios.push(folio);
    return folio;
  }

  public async addCharge(
    context: TenantContext,
    folioId: string,
    dto: AddChargeDto
  ): Promise<FolioLineRecord> {
    const folio = this.getFolioById(folioId);
    if (!folio) {
      throw new Error("NOT_FOUND: Folio introuvable.");
    }

    if (!checkPermission(context, "folios:charges:add", folio.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit d'ajout de charge au folio insuffisant.");
    }

    const line: FolioLineRecord = {
      id: `fline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      folioId: folio.id,
      departmentCode: dto.departmentCode,
      description: dto.description,
      amountXof: dto.amountXof,
      sourceReference: dto.sourceReference,
      createdAt: new Date(),
    };

    folio.lines.push(line);
    folio.totalChargesXof += dto.amountXof;
    folio.balanceXof = folio.totalChargesXof - folio.totalPaymentsXof;

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: folio.propertyId,
      userId: context.userId,
      action: "FOLIO_CHARGE_ADD",
      entityType: "FOLIO",
      entityId: folio.id,
      details: { department: dto.departmentCode, amountXof: dto.amountXof, desc: dto.description },
    });

    return line;
  }

  public async recordPayment(
    context: TenantContext,
    folioId: string,
    dto: RecordPaymentDto
  ): Promise<PaymentRecordItem> {
    const folio = this.getFolioById(folioId);
    if (!folio) {
      throw new Error("NOT_FOUND: Folio introuvable.");
    }

    if (!checkPermission(context, "cash:payment:record", folio.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit d'enregistrement de règlement insuffisant.");
    }

    const payment: PaymentRecordItem = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      folioId: folio.id,
      propertyId: folio.propertyId,
      recordedByUserId: context.userId,
      paymentMethod: dto.paymentMethod,
      amountXof: dto.amountXof,
      reference: dto.reference,
      notes: dto.notes,
      createdAt: new Date(),
    };

    this.payments.push(payment);
    folio.totalPaymentsXof += dto.amountXof;
    folio.balanceXof = folio.totalChargesXof - folio.totalPaymentsXof;

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: folio.propertyId,
      userId: context.userId,
      action: "PAYMENT_RECORD",
      entityType: "FOLIO",
      entityId: folio.id,
      details: {
        method: dto.paymentMethod,
        amountXof: dto.amountXof,
        reference: dto.reference,
        remainingBalance: folio.balanceXof,
      },
    });

    return payment;
  }
}

export const folioService = new FolioService();
