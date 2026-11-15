import { NextResponse } from "next/server";
import { equipmentService } from "@/modules/catering-equipment/equipment-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const inspection = await equipmentService.performInspection(context, body);
    return NextResponse.json({ success: true, data: inspection });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de l'état des lieux" },
      { status: 400 }
    );
  }
}
