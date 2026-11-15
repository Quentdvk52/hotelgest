import { NextResponse } from "next/server";
import { messagingService } from "@/modules/messaging/messaging-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { action, receiverUserId, conversationId, callId, sdpOffer, sdpAnswer, reason } = body;

    if (action === "INITIATE") {
      if (!receiverUserId) {
        return NextResponse.json({ success: false, error: "receiverUserId requis" }, { status: 400 });
      }
      const call = messagingService.initiateCall(
        context,
        receiverUserId,
        conversationId,
        sdpOffer
      );
      return NextResponse.json({ success: true, data: call });
    }

    if (action === "ANSWER") {
      if (!callId) {
        return NextResponse.json({ success: false, error: "callId requis" }, { status: 400 });
      }
      const call = messagingService.answerCall(callId, context.userId, sdpAnswer);
      return NextResponse.json({ success: true, data: call });
    }

    if (action === "END" || action === "DECLINE") {
      if (!callId) {
        return NextResponse.json({ success: false, error: "callId requis" }, { status: 400 });
      }
      const call = messagingService.endCall(
        callId,
        context.userId,
        action === "DECLINE" ? "DECLINED" : "ENDED"
      );
      return NextResponse.json({ success: true, data: call });
    }

    if (action === "STATUS") {
      if (!callId) {
        return NextResponse.json({ success: false, error: "callId requis" }, { status: 400 });
      }
      const call = messagingService.getCallSession(callId);
      if (!call) {
        return NextResponse.json({ success: false, error: "Appel introuvable" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: call });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du traitement de l'appel" },
      { status: 400 }
    );
  }
}
