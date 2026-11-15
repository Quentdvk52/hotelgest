import { NextRequest, NextResponse } from "next/server";
import { chariowService } from "@/modules/subscription/chariow-service";
import { envConfig } from "@/lib/config";
import { createAuditLogEntry } from "@/lib/audit/logger";
import { verifyCreatorToken } from "../../../../modules/auth/creator-auth";

function checkCreatorAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get("hotelgest_creator_session")?.value;
  if (cookie && verifyCreatorToken(cookie)) return true;
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return verifyCreatorToken(authHeader.substring(7));
  }
  return false;
}

export async function GET(req: NextRequest) {
  try {
    if (!checkCreatorAuth(req)) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED: Authentification créateur requise." },
        { status: 401 }
      );
    }

    const metrics = chariowService.getPlatformMetrics();
    const subscriptions = chariowService.listAllSubscriptions();

    return NextResponse.json({
      success: true,
      metrics,
      subscriptions,
      plans: envConfig.CHARIOW_PLANS,
      platformConfig: {
        chariowConfigured: Boolean(envConfig.CHARIOW.API_KEY),
        kkiapayConfigured: Boolean(envConfig.KKIAPAY.PUBLIC_KEY),
        databaseConfigured: Boolean(envConfig.DATABASE_URL),
        defaultCurrency: envConfig.DEFAULT_CURRENCY,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkCreatorAuth(req)) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED: Authentification créateur requise." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, tenantId, planCode, status } = body;

    if (action === "CREATE_CHECKOUT") {
      const checkout = await chariowService.createCheckoutSession(
        tenantId || "tenant-vignoble-001",
        planCode || "MONTHLY_100K",
        body.returnUrl || "/dashboard"
      );

      return NextResponse.json({
        success: true,
        checkout,
      });
    }

    if (action === "UPDATE_STATUS") {
      if (!tenantId || !status) {
        return NextResponse.json(
          { success: false, error: "tenantId et status sont obligatoires" },
          { status: 400 }
        );
      }

      const updated = chariowService.updateSubscriptionStatus(tenantId, status, planCode);

      createAuditLogEntry({
        tenantId,
        action: "CREATOR_OVERRIDE_SUBSCRIPTION_STATUS",
        entityType: "SUBSCRIPTION",
        entityId: tenantId,
        details: { newStatus: status, planCode },
      });

      return NextResponse.json({
        success: true,
        subscription: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "Action non reconnue" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
