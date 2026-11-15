import { NextResponse } from "next/server";
import { notificationService, NotificationCategory } from "@/modules/notifications/notification-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") as NotificationCategory) || undefined;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = notificationService.getNotificationsForUser(
      context.userId,
      category,
      unreadOnly
    );
    const unreadCount = notificationService.getUnreadCount(context.userId);
    const preferences = notificationService.getPreferences(context.userId);

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
      preferences,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour les notifications." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { action, notificationId, category, preferences } = body;

    if (action === "MARK_READ") {
      if (!notificationId) {
        return NextResponse.json({ success: false, error: "notificationId requis" }, { status: 400 });
      }
      const success = notificationService.markAsRead(context.userId, notificationId);
      return NextResponse.json({ success });
    }

    if (action === "MARK_ALL_READ") {
      const count = notificationService.markAllAsRead(context.userId, category);
      return NextResponse.json({ success: true, count });
    }

    if (action === "UPDATE_PREFERENCES") {
      const updated = notificationService.updatePreferences(context.userId, preferences || {});
      return NextResponse.json({ success: true, preferences: updated });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de traitement des notifications." },
      { status: 400 }
    );
  }
}
