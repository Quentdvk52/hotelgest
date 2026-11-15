import { NextResponse } from "next/server";
import { messagingService } from "@/modules/messaging/messaging-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || undefined;

    const conversations = messagingService.listConversationsForUser(context, query);
    const unreadMessagesCount = messagingService.getUnreadMessagesCount(context.userId);

    return NextResponse.json({
      success: true,
      unreadMessagesCount,
      count: conversations.length,
      data: conversations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour la messagerie." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { name, description, memberUserIds, avatarUrl } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Le nom du groupe est obligatoire." },
        { status: 400 }
      );
    }

    const group = messagingService.createGroup(
      context,
      name,
      description,
      memberUserIds || [],
      avatarUrl
    );

    return NextResponse.json({ success: true, data: group });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de création de groupe" },
      { status: 400 }
    );
  }
}
