import { NextResponse } from "next/server";
import { pmsService } from "@/modules/pms/pms-service";
import { resolveSessionContext } from "@/lib/auth/session";
import { chariowService } from "@/modules/subscription/chariow-service";

export async function POST(req: Request) {
  try {
    const opsCheck = chariowService.canPerformOperations("tenant-vignoble-001");
    if (!opsCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "TRIAL_EXPIRED", message: opsCheck.reason },
        { status: 403 }
      );
    }

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
