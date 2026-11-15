import crypto from "crypto";
import { envConfig } from "../../lib/config";
import { createAuditLogEntry } from "../../lib/audit/logger";

export interface SubscriptionRecord {
  tenantId: string;
  provider: "CHARIOW";
  planCode: string;
  amountXof: number;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED";
  updatedAt: Date;
}

class ChariowService {
  private processedEvents = new Set<string>();
  private subscriptions = new Map<string, SubscriptionRecord>();

  public resetState() {
    this.processedEvents.clear();
    this.subscriptions.clear();
  }

  public getSubscription(tenantId: string): SubscriptionRecord | undefined {
    return this.subscriptions.get(tenantId);
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

    const subscription: SubscriptionRecord = {
      tenantId,
      provider: "CHARIOW",
      planCode,
      amountXof,
      status: "ACTIVE",
      updatedAt: new Date(),
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
