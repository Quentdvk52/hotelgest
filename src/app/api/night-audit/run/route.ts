import { NextResponse } from "next/server";
import { nightAuditService } from "@/modules/night-audit/audit-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  const preflight = await nightAuditService.runPreflight(propertyId, date);
  return NextResponse.json({ success: true, data: preflight });
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
