import { NextResponse } from "next/server";
import { chariowService } from "@/modules/subscription/chariow-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "tenant-vignoble-001";

    const sub = chariowService.getSubscription(tenantId);
    const ops = chariowService.canPerformOperations(tenantId);

    return NextResponse.json({
      success: true,
      subscription: {
        tenantId,
        tenantName: sub?.tenantName || "Groupe Hôtelier Le Vignoble",
        planCode: sub?.planCode || "MONTHLY_100K",
        planName: sub?.planName || "HotelGest Enterprise Multi-Sites (Essai 50 Jours)",
        amountXof: sub?.amountXof || 100000,
        status: ops.status,
        isTrial: ops.isTrial,
        isExpired: ops.isExpired,
        trialDurationDays: sub?.trialDurationDays || 50,
        trialStartDate: sub?.trialStartDate || new Date("2026-11-17T00:00:00.000Z"),
        trialEndDate: ops.trialEndDate,
        trialDaysRemaining: ops.daysRemaining,
        operationsAllowed: ops.allowed,
        reason: ops.reason,
        nextBillingDate: sub?.nextBillingDate || ops.trialEndDate,
        checkoutUrl: sub?.checkoutUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur récupération statut abonnement" },
      { status: 500 }
    );
  }
}

/**
 * Endpoint de simulation pour tester dynamiquement le passage de l'essai à expiré
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId = "tenant-vignoble-001", setDaysRemaining } = body;

    if (typeof setDaysRemaining === "number") {
      const updated = chariowService.setTrialPeriod(setDaysRemaining, tenantId);
      const ops = chariowService.canPerformOperations(tenantId);
      return NextResponse.json({
        success: true,
        message: `Période d'essai ajustée à ${setDaysRemaining} jours`,
        subscription: updated,
        operations: ops,
      });
    }

    return NextResponse.json({ success: false, error: "Paramètre setDaysRemaining manquant" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
