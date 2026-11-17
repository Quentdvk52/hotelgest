import { NextResponse } from "next/server";
import { chariowService } from "@/modules/subscription/chariow-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const signature =
      req.headers.get("x-chariow-signature") ||
      req.headers.get("x-pulse-signature") ||
      req.headers.get("x-signature") ||
      "";
    const rawPayload = await req.text();

    const result = await chariowService.processWebhook(rawPayload, signature);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de traitement du webhook Chariow" },
      { status: 400 }
    );
  }
}
