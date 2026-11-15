import { NextResponse } from "next/server";
import { cashService } from "@/modules/finance/cash-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || context.propertyId;

    const { hasPropertyAccess, checkPermission } = await import("@/lib/auth/rbac");
    if (
      !hasPropertyAccess(context, propertyId) ||
      (!checkPermission(context, "cash:session:open", propertyId) &&
       !checkPermission(context, "reports:view", propertyId))
    ) {
      return NextResponse.json(
        { success: false, error: "PERMISSION_DENIED: Accès à la caisse interdit pour ce site." },
        { status: 403 }
      );
    }

    const activeSession = cashService.getActiveSession(propertyId);
    return NextResponse.json({ success: true, data: activeSession || null });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour consulter la session de caisse." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { action, drawerId, openingBalanceXof, sessionId, countedBalanceXof, justification } = body;

    if (action === "OPEN") {
      const session = await cashService.openSession(
        context,
        drawerId || "caisse-principale",
        openingBalanceXof || 0
      );
      return NextResponse.json({ success: true, data: session });
    }

    if (action === "CLOSE") {
      const session = await cashService.closeSession(
        context,
        sessionId,
        countedBalanceXof,
        justification
      );
      return NextResponse.json({ success: true, data: session });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de caisse" },
      { status: 400 }
    );
  }
}
