import { NextResponse } from "next/server";
import { syscohadaService } from "@/modules/accounting/syscohada-service";
import { resolveSessionContext } from "@/lib/auth/session";
import { checkPermission, hasPropertyAccess } from "@/lib/auth/rbac";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || context.propertyId;
    const format = searchParams.get("format");

    if (!hasPropertyAccess(context, propertyId) || !checkPermission(context, "reports:view", propertyId)) {
      return NextResponse.json(
        { success: false, error: "PERMISSION_DENIED: Accès aux rapports comptables interdit pour ce site." },
        { status: 403 }
      );
    }

    if (format === "csv") {
      const csvData = syscohadaService.exportCsv(propertyId);
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="journal-syscohada-${propertyId}.csv"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const entries = syscohadaService.getJournalEntries(propertyId);
    return NextResponse.json({ success: true, data: entries });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour exporter le journal comptable." },
      { status: 401 }
    );
  }
}
