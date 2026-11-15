import { TenantContext } from "../../lib/types/common";
import { checkPermission } from "../../lib/auth/rbac";
import { createAuditLogEntry } from "../../lib/audit/logger";

export interface CashSessionRecord {
  id: string;
  tenantId: string;
  propertyId: string;
  drawerId: string;
  openedByUserId: string;
  closedByUserId?: string;
  openingBalanceXof: number;
  theoreticalBalanceXof: number;
  countedBalanceXof?: number;
  discrepancyXof: number;
  discrepancyReason?: string;
  status: "OPEN" | "CLOSED";
  openedAt: Date;
  closedAt?: Date;
}

class CashService {
  private sessions: CashSessionRecord[] = [];

  public resetState() {
    this.sessions = [];
  }

  public getSessionById(id: string): CashSessionRecord | undefined {
    return this.sessions.find((s) => s.id === id);
  }

  public getActiveSession(propertyId: string): CashSessionRecord | undefined {
    return this.sessions.find((s) => s.propertyId === propertyId && s.status === "OPEN");
  }

  public async openSession(
    context: TenantContext,
    drawerId: string,
    openingBalanceXof: number
  ): Promise<CashSessionRecord> {
    if (!checkPermission(context, "cash:session:open", context.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit d'ouverture de caisse insuffisant.");
    }

    const session: CashSessionRecord = {
      id: `csess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tenantId: context.tenantId,
      propertyId: context.propertyId,
      drawerId,
      openedByUserId: context.userId,
      openingBalanceXof,
      theoreticalBalanceXof: openingBalanceXof,
      discrepancyXof: 0,
      status: "OPEN",
      openedAt: new Date(),
    };

    this.sessions.push(session);

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: context.propertyId,
      userId: context.userId,
      action: "CASH_SESSION_OPEN",
      entityType: "CASH_SESSION",
      entityId: session.id,
      details: { drawerId, openingBalanceXof },
    });

    return session;
  }

  public addCashMovement(sessionId: string, amountXof: number) {
    const session = this.getSessionById(sessionId);
    if (session && session.status === "OPEN") {
      session.theoreticalBalanceXof += amountXof;
    }
  }

  public async closeSession(
    context: TenantContext,
    sessionId: string,
    countedBalanceXof: number,
    justification?: string
  ): Promise<CashSessionRecord> {
    const session = this.getSessionById(sessionId);
    if (!session || session.status !== "OPEN") {
      throw new Error("NOT_FOUND: Session de caisse introuvable ou déjà clôturée.");
    }

    if (!checkPermission(context, "cash:session:close", session.propertyId)) {
      throw new Error("PERMISSION_DENIED: Droit de clôture de caisse insuffisant.");
    }

    const discrepancy = countedBalanceXof - session.theoreticalBalanceXof;

    if (discrepancy !== 0 && (!justification || justification.trim().length < 5)) {
      throw new Error(
        "DISCREPANCY_JUSTIFICATION_REQUIRED: Un écart de caisse exige une justification formelle d'au moins 5 caractères."
      );
    }

    session.status = "CLOSED";
    session.closedByUserId = context.userId;
    session.closedAt = new Date();
    session.countedBalanceXof = countedBalanceXof;
    session.discrepancyXof = discrepancy;
    session.discrepancyReason = justification;

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: session.propertyId,
      userId: context.userId,
      action: "CASH_SESSION_CLOSE",
      entityType: "CASH_SESSION",
      entityId: session.id,
      details: {
        theoreticalBalanceXof: session.theoreticalBalanceXof,
        countedBalanceXof,
        discrepancyXof: discrepancy,
        discrepancyReason: justification,
      },
    });

    return session;
  }
}

export const cashService = new CashService();
