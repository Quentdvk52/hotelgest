import { NextResponse } from "next/server";
import { chariowService } from "@/modules/subscription/chariow-service";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-chariow-signature") || "";
    const rawPayload = await req.text();

    const result = await chariowService.processWebhook(rawPayload, signature);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de traitement du webhook" },
      { status: 400 }
    );
  }
}
