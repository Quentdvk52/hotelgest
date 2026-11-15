import { TenantContext } from "../../lib/types/common";
import { checkPermission } from "../../lib/auth/rbac";
import { createAuditLogEntry } from "../../lib/audit/logger";
import { pmsService } from "../pms/pms-service";
import { orderService } from "../pos/order-service";
import { cashService } from "../finance/cash-service";

export interface PreflightCheckResult {
  propertyId: string;
  auditDate: string;
  canExecuteClosure: boolean;
  checks: {
    name: string;
    status: "PASS" | "WARN" | "FAIL";
    message: string;
  }[];
}

export interface NightAuditRecord {
  id: string;
  tenantId: string;
  propertyId: string;
  auditDate: string;
  executedByUserId: string;
  occupiedRoomsCount: number;
  totalRoomsCount: number;
  occupancyRatePercent: number;
  roomRevenueXof: number;
  fnbRevenueXof: number;
  eventsRevenueXof: number;
  totalRevenueXof: number;
  discrepanciesCount: number;
  isLocked: boolean;
  notes?: string;
  createdAt: Date;
}

class NightAuditService {
  private audits: NightAuditRecord[] = [];

  public resetState() {
    this.audits = [];
  }

  public getAuditsByProperty(propertyId: string): NightAuditRecord[] {
    return this.audits.filter((a) => a.propertyId === propertyId);
  }

  public async runPreflight(
    propertyId: string,
    auditDate: string
  ): Promise<PreflightCheckResult> {
    const checks: PreflightCheckResult["checks"] = [];

    // Check 1: Open Cash Sessions
    const activeCashSession = cashService.getActiveSession(propertyId);
    if (activeCashSession) {
      checks.push({
        name: "Sessions de caisse ouvertes",
        status: "WARN",
        message: "Une session de caisse est encore ouverte. Une justification ou clôture est recommandée.",
      });
    } else {
      checks.push({
        name: "Sessions de caisse",
        status: "PASS",
        message: "Toutes les sessions de caisse sont clôturées ou équilibrées.",
      });
    }

    // Check 2: Unserved Orders
    const propertyOrders = orderService.getOrdersByProperty(propertyId);
    const unclosedOrders = propertyOrders.filter(
      (o) => o.status !== "SERVED" && o.status !== "CANCELLED"
    );
    if (unclosedOrders.length > 0) {
      checks.push({
        name: "Commandes restaurant/bar en cours",
        status: "WARN",
        message: `${unclosedOrders.length} commande(s) non servie(s) ou en attente.`,
      });
    } else {
      checks.push({
        name: "Commandes restaurant/bar",
        status: "PASS",
        message: "Toutes les commandes du jour sont servies ou réglées.",
      });
    }

    // Check 3: Active Stays
    const activeStays = pmsService.getStaysByProperty(propertyId).filter((s) => s.status === "ACTIVE");
    checks.push({
      name: "Séjours en cours (Imputation nuitée)",
      status: "PASS",
      message: `${activeStays.length} chambre(s) actuellement occupée(s) pour la nuit.`,
    });

    return {
      propertyId,
      auditDate,
      canExecuteClosure: true,
      checks,
    };
  }

  public async executeNightAudit(
    context: TenantContext,
    propertyId: string,
    auditDate: string,
    notes?: string
  ): Promise<NightAuditRecord> {
    if (!checkPermission(context, "night_audit:run", propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit d'exécution du night audit insuffisant.");
    }

    const units = pmsService.getUnitsByProperty(propertyId);
    const totalRoomsCount = units.length || 1;
    const occupiedUnits = units.filter((u) => u.status === "OCCUPIED");
    const occupiedRoomsCount = occupiedUnits.length;
    const occupancyRatePercent = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);

    // Compute daily revenues
    const roomRevenueXof = occupiedRoomsCount * 25000;
    const orders = orderService.getOrdersByProperty(propertyId);
    const fnbRevenueXof = orders.reduce((sum, o) => sum + o.totalAmountXof, 0);
    const eventsRevenueXof = 0;
    const totalRevenueXof = roomRevenueXof + fnbRevenueXof + eventsRevenueXof;

    const audit: NightAuditRecord = {
      id: `naudit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: context.tenantId,
      propertyId,
      auditDate,
      executedByUserId: context.userId,
      occupiedRoomsCount,
      totalRoomsCount,
      occupancyRatePercent,
      roomRevenueXof,
      fnbRevenueXof,
      eventsRevenueXof,
      totalRevenueXof,
      discrepanciesCount: 0,
      isLocked: true,
      notes: notes || "Clôture journalière validée avec succès.",
      createdAt: new Date(),
    };

    this.audits.push(audit);

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId,
      userId: context.userId,
      action: "NIGHT_AUDIT_EXECUTE",
      entityType: "NIGHT_AUDIT",
      entityId: audit.id,
      details: {
        date: auditDate,
        occupancyRate: `${occupancyRatePercent}%`,
        totalRevenueXof,
      },
    });

    return audit;
  }
}

export const nightAuditService = new NightAuditService();
