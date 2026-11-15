import { NextResponse } from "next/server";
import { messagingService } from "@/modules/messaging/messaging-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await resolveSessionContext(req);

    const messages = messagingService.getMessagesByConversation(context, id);
    // Mark conversation as read on opening
    messagingService.markConversationAsRead(context.userId, id);

    return NextResponse.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de chargement des messages" },
      { status: 400 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { content, attachments, isVoiceNote, replyToMessageId, idempotencyKey } = body;

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { success: false, error: "Le contenu du message ou une pièce jointe est requis." },
        { status: 400 }
      );
    }

    const message = await messagingService.sendMessage(context, id, content || "", {
      attachments,
      isVoiceNote,
      replyToMessageId,
      idempotencyKey,
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de l'envoi du message" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { messageId, newContent } = body;

    if (!messageId || !newContent) {
      return NextResponse.json(
        { success: false, error: "messageId et newContent sont requis." },
        { status: 400 }
      );
    }

    const edited = messagingService.editMessage(context, messageId, newContent);
    return NextResponse.json({ success: true, data: edited });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la modification du message" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: "messageId requis en paramètre." },
        { status: 400 }
      );
    }

    const result = messagingService.deleteMessage(context, messageId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la suppression du message" },
      { status: 400 }
    );
  }
}
