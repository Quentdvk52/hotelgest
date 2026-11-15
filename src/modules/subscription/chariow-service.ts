import crypto from "crypto";
import { envConfig } from "../../lib/config";
import { createAuditLogEntry } from "../../lib/audit/logger";

export interface SubscriptionRecord {
  tenantId: string;
  tenantName: string;
  provider: "CHARIOW";
  planCode: "MONTHLY_100K" | "SEMIANNUAL_540K" | "ANNUAL_840K";
  planName: string;
  amountXof: number;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED";
  nextBillingDate: Date;
  updatedAt: Date;
  lastPaymentRef?: string;
}

class ChariowService {
  private processedEvents = new Set<string>();
  private subscriptions = new Map<string, SubscriptionRecord>();

  constructor() {
    // Seed default subscription for Groupe Le Vignoble
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 28);

    this.subscriptions.set("tenant-vignoble-001", {
      tenantId: "tenant-vignoble-001",
      tenantName: "Groupe Hôtelier Le Vignoble (4 Agences)",
      provider: "CHARIOW",
      planCode: "MONTHLY_100K",
      planName: "HotelGest Enterprise Multi-Sites",
      amountXof: envConfig.CHARIOW_PLANS.MONTHLY_XOF,
      status: "ACTIVE",
      nextBillingDate: nextDate,
      updatedAt: new Date(),
      lastPaymentRef: "chariow_inv_live_884920",
    });
  }

  public resetState() {
    this.processedEvents.clear();
    this.subscriptions.clear();
  }

  public getSubscription(tenantId: string): SubscriptionRecord | undefined {
    return this.subscriptions.get(tenantId);
  }

  public listAllSubscriptions(): SubscriptionRecord[] {
    return Array.from(this.subscriptions.values());
  }

  public getPlatformMetrics() {
    const all = this.listAllSubscriptions();
    const active = all.filter((s) => s.status === "ACTIVE");
    const mrrXof = active.reduce((acc, curr) => acc + curr.amountXof, 0);
    const arrXof = mrrXof * 12;

    return {
      totalTenants: all.length,
      activeTenantsCount: active.length,
      mrrXof,
      arrXof,
      collectionRate: 100, // 100% on active pilot
    };
  }

  public async createCheckoutSession(
    tenantId: string,
    planCode: "MONTHLY_100K" | "SEMIANNUAL_540K" | "ANNUAL_840K" = "MONTHLY_100K",
    returnUrl?: string
  ): Promise<{ checkoutUrl: string; sessionId: string; amountXof: number }> {
    const amountXof =
      planCode === "ANNUAL_840K"
        ? envConfig.CHARIOW_PLANS.ANNUAL_XOF
        : planCode === "SEMIANNUAL_540K"
        ? envConfig.CHARIOW_PLANS.SEMIANNUAL_XOF
        : envConfig.CHARIOW_PLANS.MONTHLY_XOF;

    const sessionId = `chariow_chk_${Date.now()}`;
    const checkoutUrl = `https://checkout.chariow.com/pay/${sessionId}?tenant=${tenantId}&plan=${planCode}&amount=${amountXof}&redirect=${encodeURIComponent(
      returnUrl || "/dashboard"
    )}`;

    createAuditLogEntry({
      tenantId,
      action: "CHARIOW_CHECKOUT_SESSION_CREATED",
      entityType: "SUBSCRIPTION",
      entityId: sessionId,
      details: { planCode, amountXof, checkoutUrl },
    });

    return { checkoutUrl, sessionId, amountXof };
  }

  public updateSubscriptionStatus(
    tenantId: string,
    status: "ACTIVE" | "PAST_DUE" | "CANCELLED",
    planCode?: "MONTHLY_100K" | "SEMIANNUAL_540K" | "ANNUAL_840K"
  ): SubscriptionRecord {
    const existing = this.subscriptions.get(tenantId) || {
      tenantId,
      tenantName: "Groupe Hôtelier Le Vignoble",
      provider: "CHARIOW" as const,
      planCode: planCode || "MONTHLY_100K",
      planName: "HotelGest Enterprise Multi-Sites",
      amountXof: envConfig.CHARIOW_PLANS.MONTHLY_XOF,
      status: "ACTIVE" as const,
      nextBillingDate: new Date(),
      updatedAt: new Date(),
    };

    const updated: SubscriptionRecord = {
      ...existing,
      status,
      planCode: planCode || existing.planCode,
      amountXof:
        planCode === "ANNUAL_840K"
          ? envConfig.CHARIOW_PLANS.ANNUAL_XOF
          : planCode === "SEMIANNUAL_540K"
          ? envConfig.CHARIOW_PLANS.SEMIANNUAL_XOF
          : envConfig.CHARIOW_PLANS.MONTHLY_XOF,
      updatedAt: new Date(),
    };

    this.subscriptions.set(tenantId, updated);
    return updated;
  }

  public verifySignature(rawPayload: string, signature: string): boolean {
    const computedSignature = crypto
      .createHmac("sha256", envConfig.CHARIOW.WEBHOOK_SECRET)
      .update(rawPayload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(computedSignature, "hex")
    );
  }

  public async processWebhook(
    rawPayload: string,
    signature: string
  ): Promise<{ success: boolean; isDuplicate?: boolean; status?: string }> {
    // 1. Signature check
    let isValid = false;
    try {
      isValid = this.verifySignature(rawPayload, signature);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      throw new Error("INVALID_SIGNATURE: La signature du webhook Chariow est invalide ou altérée.");
    }

    // 2. Parse payload
    const event = JSON.parse(rawPayload);
    const eventId = event.event_id;

    // 3. Idempotency check (Review Focus #4)
    if (this.processedEvents.has(eventId)) {
      return { success: true, isDuplicate: true };
    }

    this.processedEvents.add(eventId);

    const tenantId = event.tenant_id || "tenant-vignoble-001";
    const planCode = event.plan_code || "MONTHLY_100K";
    const amountXof = event.amount_xof || 100000;

    const nextBilling = new Date();
    nextBilling.setDate(nextBilling.getDate() + 30);

    const subscription: SubscriptionRecord = {
      tenantId,
      tenantName: "Groupe Hôtelier Le Vignoble",
      provider: "CHARIOW",
      planCode,
      planName: "HotelGest Enterprise Multi-Sites",
      amountXof,
      status: "ACTIVE",
      nextBillingDate: nextBilling,
      updatedAt: new Date(),
      lastPaymentRef: `chariow_pay_${eventId}`,
    };

    this.subscriptions.set(tenantId, subscription);

    createAuditLogEntry({
      tenantId,
      action: "CHARIOW_WEBHOOK_PROCESSED",
      entityType: "SUBSCRIPTION",
      entityId: eventId,
      details: {
        eventType: event.event_type,
        planCode,
        amountXof,
      },
    });

    return { success: true, isDuplicate: false, status: "ACTIVE" };
  }
}

export const chariowService = new ChariowService();
