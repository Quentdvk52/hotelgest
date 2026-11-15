import { NextResponse } from "next/server";
import { pmsService } from "@/modules/pms/pms-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { stayId } = body;

    const result = await pmsService.performCheckOut(context, stayId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du check-out" },
      { status: 400 }
    );
  }
}
