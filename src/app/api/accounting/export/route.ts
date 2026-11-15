import { NextResponse } from "next/server";
import { syscohadaService } from "@/modules/accounting/syscohada-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";
  const format = searchParams.get("format");

  if (format === "csv") {
    const csvData = syscohadaService.exportCsv(propertyId);
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="journal-syscohada-${propertyId}.csv"`,
      },
    });
  }

  const entries = syscohadaService.getJournalEntries(propertyId);
  return NextResponse.json({ success: true, data: entries });
}
