import crypto from "crypto";
import { envConfig } from "../../lib/config";
import { createAuditLogEntry } from "../../lib/audit/logger";

export type ChariowPlanCode = "MONTHLY_100K" | "SEMIANNUAL_540K" | "ANNUAL_840K";

export interface SubscriptionRecord {
  tenantId: string;
  tenantName: string;
  provider: "CHARIOW";
  planCode: ChariowPlanCode;
  planName: string;
  amountXof: number;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED";
  nextBillingDate: Date;
  updatedAt: Date;
  lastPaymentRef?: string;
  checkoutUrl?: string;
}

export const CHARIOW_SUBSCRIPTION_PLANS = {
  MONTHLY_100K: {
    code: "MONTHLY_100K" as ChariowPlanCode,
    name: "Abonnement Mensuel (1 Mois)",
    durationMonths: 1,
    durationDays: 30,
    amountXof: envConfig.CHARIOW_PLANS.MONTHLY_XOF,
    discountPercent: 0,
    savingsXof: 0,
    productId: "prd_rzhtvh59",
    url: "https://narcpdfi.mychariow.market/prd_rzhtvh59",
    badge: "Formule Standard",
    features: [
      "Gestion multi-établissements (Bohicon, Abomey, Calavi, Zogbodomey)",
      "PMS Réception & Réservations de chambres illimitées",
      "KDS Cuisine & Bar en direct",
      "Facturation normalisée e-MECeF certifiée DGI Bénin",
      "Gouvernance & Clôture Night Audit automatique",
      "Support technique standard 7j/7",
    ],
  },
  SEMIANNUAL_540K: {
    code: "SEMIANNUAL_540K" as ChariowPlanCode,
    name: "Abonnement Semestriel (6 Mois)",
    durationMonths: 6,
    durationDays: 180,
    amountXof: envConfig.CHARIOW_PLANS.SEMIANNUAL_XOF,
    discountPercent: 10,
    savingsXof: 60000,
    productId: "prd_n0s8gwxg",
    url: "https://narcpdfi.mychariow.market/prd_n0s8gwxg",
    popular: true,
    badge: "10% de réduction • Économisez 60 000 XOF",
    features: [
      "Toutes les fonctionnalités de la formule Mensuelle",
      "Réduction immédiate de 10% (soit 60 000 XOF d'économie)",
      "Sauvegarde automatique cloud multi-sites consolidée",
      "Accès aux tableaux de bord analytiques et bilans fiscaux",
      "Support prioritaire dédié aux équipes d'agences",
    ],
  },
  ANNUAL_840K: {
    code: "ANNUAL_840K" as ChariowPlanCode,
    name: "Abonnement Annuel (12 Mois)",
    durationMonths: 12,
    durationDays: 365,
    amountXof: envConfig.CHARIOW_PLANS.ANNUAL_XOF,
    discountPercent: 30,
    savingsXof: 360000,
    productId: "prd_taderm68",
    url: "https://narcpdfi.mychariow.market/prd_taderm68",
    bestValue: true,
    badge: "30% de réduction • Économisez 360 000 XOF",
    features: [
      "Toutes les fonctionnalités des forfaits précédents",
      "Réduction maximale de 30% (soit 360 000 XOF d'économie)",
      "Équivaut à 70 000 XOF / mois seulement",
      "Formation continue et accompagnement sur site pour le personnel",
      "Assistance VIP 24h/24 & Évolutions logicielles prioritaires",
    ],
  },
} as const;

export const CHARIOW_PRODUCT_MAP: Record<string, ChariowPlanCode> = {
  prd_rzhtvh59: "MONTHLY_100K",
  prd_n0s8gwxg: "SEMIANNUAL_540K",
  prd_taderm68: "ANNUAL_840K",
};

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
      checkoutUrl: CHARIOW_SUBSCRIPTION_PLANS.MONTHLY_100K.url,
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

  public getPlanInfo(planCode: ChariowPlanCode) {
    return CHARIOW_SUBSCRIPTION_PLANS[planCode] || CHARIOW_SUBSCRIPTION_PLANS.MONTHLY_100K;
  }

  public getDirectCheckoutUrl(planCode: ChariowPlanCode): string {
    const plan = this.getPlanInfo(planCode);
    return plan.url;
  }

  public async createCheckoutSession(
    tenantId: string,
    planCode: ChariowPlanCode = "MONTHLY_100K",
    returnUrl?: string
  ): Promise<{ checkoutUrl: string; sessionId: string; amountXof: number; planInfo: any }> {
    const plan = this.getPlanInfo(planCode);
    const amountXof = plan.amountXof;
    const sessionId = `chariow_chk_${Date.now()}`;

    // Le lien officiel direct Chariow vers la page produit avec support MoMo et Carte Bancaire
    const checkoutUrl = plan.url;

    createAuditLogEntry({
      tenantId,
      action: "CHARIOW_CHECKOUT_SESSION_CREATED",
      entityType: "SUBSCRIPTION",
      entityId: sessionId,
      details: {
        planCode,
        amountXof,
        productId: plan.productId,
        checkoutUrl,
        returnUrl: returnUrl || "/dashboard?view=abonnement",
      },
    });

    return {
      checkoutUrl,
      sessionId,
      amountXof,
      planInfo: plan,
    };
  }

  public updateSubscriptionStatus(
    tenantId: string,
    status: "ACTIVE" | "PAST_DUE" | "CANCELLED",
    planCode?: ChariowPlanCode
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

    const targetPlan = planCode ? this.getPlanInfo(planCode) : this.getPlanInfo(existing.planCode);

    const updated: SubscriptionRecord = {
      ...existing,
      status,
      planCode: targetPlan.code,
      amountXof: targetPlan.amountXof,
      checkoutUrl: targetPlan.url,
      updatedAt: new Date(),
    };

    this.subscriptions.set(tenantId, updated);
    return updated;
  }

  /**
   * Vérifie la signature HMAC-SHA256 envoyée par Chariow Pulse.
   * Gère les formats standard hex et préfixés sha256=<digest>.
   */
  public verifySignature(rawPayload: string, signature: string): boolean {
    if (!signature) return false;

    // Normalisation de l'en-tête (gestion du format sha256=...)
    const cleanSignature = signature.startsWith("sha256=")
      ? signature.slice(7).trim().toLowerCase()
      : signature.trim().toLowerCase();

    const computedSignature = crypto
      .createHmac("sha256", envConfig.CHARIOW.WEBHOOK_SECRET)
      .update(rawPayload)
      .digest("hex")
      .toLowerCase();

    try {
      const sigBuffer = Buffer.from(cleanSignature, "hex");
      const compBuffer = Buffer.from(computedSignature, "hex");

      if (sigBuffer.length !== compBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, compBuffer);
    } catch {
      return false;
    }
  }

  public async processWebhook(
    rawPayload: string,
    signature: string
  ): Promise<{ success: boolean; isDuplicate?: boolean; status?: string; planCode?: string; saleId?: string }> {
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
    const eventId =
      event.event_id ||
      event.delivery_id ||
      event.id ||
      `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // 3. Idempotency check
    if (this.processedEvents.has(eventId)) {
      return { success: true, isDuplicate: true };
    }
    this.processedEvents.add(eventId);

    // Extraction des données de vente Chariow (compatible format Pulse et standard)
    const saleData = event.data?.purchase || event.data || event;
    const saleId = saleData.id || saleData.sale_id || event.sale_id || `chariow_pay_${eventId}`;
    const customMetadata = saleData.custom_metadata || event.custom_metadata || {};

    // Détection du plan via product_id ou plan_code
    const rawProductId =
      saleData.product_id ||
      saleData.product?.id ||
      event.product_id ||
      "";

    let resolvedPlanCode: ChariowPlanCode = "MONTHLY_100K";

    if (CHARIOW_PRODUCT_MAP[rawProductId]) {
      resolvedPlanCode = CHARIOW_PRODUCT_MAP[rawProductId];
    } else if (
      customMetadata.plan_code &&
      CHARIOW_SUBSCRIPTION_PLANS[customMetadata.plan_code as ChariowPlanCode]
    ) {
      resolvedPlanCode = customMetadata.plan_code as ChariowPlanCode;
    } else if (
      event.plan_code &&
      CHARIOW_SUBSCRIPTION_PLANS[event.plan_code as ChariowPlanCode]
    ) {
      resolvedPlanCode = event.plan_code as ChariowPlanCode;
    }

    const planInfo = this.getPlanInfo(resolvedPlanCode);
    const tenantId =
      customMetadata.tenant_id ||
      event.tenant_id ||
      "tenant-vignoble-001";

    const amountXof = Number(event.amount_xof || saleData.amount?.value || planInfo.amountXof);

    // Calcul de la date d'expiration selon la durée du plan
    const nextBilling = new Date();
    nextBilling.setDate(nextBilling.getDate() + planInfo.durationDays);

    const subscription: SubscriptionRecord = {
      tenantId,
      tenantName: "Groupe Hôtelier Le Vignoble (4 Agences)",
      provider: "CHARIOW",
      planCode: resolvedPlanCode,
      planName: `HotelGest - ${planInfo.name}`,
      amountXof,
      status: "ACTIVE",
      nextBillingDate: nextBilling,
      updatedAt: new Date(),
      lastPaymentRef: saleId,
      checkoutUrl: planInfo.url,
    };

    this.subscriptions.set(tenantId, subscription);

    createAuditLogEntry({
      tenantId,
      action: "CHARIOW_WEBHOOK_PROCESSED",
      entityType: "SUBSCRIPTION",
      entityId: eventId,
      details: {
        eventType: event.event_type || event.event || "successful.sale",
        planCode: resolvedPlanCode,
        amountXof,
        saleId,
        productId: rawProductId,
        durationDays: planInfo.durationDays,
      },
    });

    return {
      success: true,
      isDuplicate: false,
      status: "ACTIVE",
      planCode: resolvedPlanCode,
      saleId,
    };
  }
}

export const chariowService = new ChariowService();
