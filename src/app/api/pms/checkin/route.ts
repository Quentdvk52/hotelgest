import { NextResponse } from "next/server";
import { pmsService } from "@/modules/pms/pms-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { reservationId, unitId } = body;

    const stay = await pmsService.performCheckIn(context, reservationId, unitId);
    return NextResponse.json({ success: true, data: stay });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du check-in" },
      { status: 400 }
    );
  }
}
