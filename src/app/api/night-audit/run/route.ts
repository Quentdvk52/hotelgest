import { NextResponse } from "next/server";
import { nightAuditService } from "@/modules/night-audit/audit-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || context.propertyId;
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const { checkPermission } = await import("@/lib/auth/rbac");
    if (
      !checkPermission(context, "night_audit:run", propertyId) &&
      !checkPermission(context, "reports:view", propertyId)
    ) {
      return NextResponse.json(
        { success: false, error: "PERMISSION_DENIED: Droit d'accès au Night Audit insuffisant pour ce site." },
        { status: 403 }
      );
    }

    const preflight = await nightAuditService.runPreflight(propertyId, date);
    return NextResponse.json({ success: true, data: preflight });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour le Night Audit." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { propertyId, auditDate, notes } = body;

    const audit = await nightAuditService.executeNightAudit(
      context,
      propertyId,
      auditDate,
      notes
    );
    return NextResponse.json({ success: true, data: audit });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du night audit" },
      { status: 400 }
    );
  }
}
