import { NextResponse } from "next/server";
import { announcementService } from "@/modules/announcements/announcement-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const receiptsForId = searchParams.get("receiptsForId");

    if (receiptsForId) {
      const receipts = announcementService.getReceiptsForAnnouncement(context, receiptsForId);
      return NextResponse.json({ success: true, receipts });
    }

    if (id) {
      const announcement = announcementService.getAnnouncementById(id);
      if (!announcement) {
        return NextResponse.json({ success: false, error: "Annonce introuvable" }, { status: 404 });
      }
      const acknowledged = announcementService.hasUserAcknowledged(context.userId, id);
      return NextResponse.json({ success: true, data: { announcement, acknowledged } });
    }

    const announcements = announcementService.listAnnouncementsForUser(context);
    return NextResponse.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour les annonces." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { action, announcementId, ...dto } = body;

    if (action === "CREATE") {
      const announcement = await announcementService.createAnnouncement(context, dto);
      return NextResponse.json({ success: true, data: announcement });
    }

    if (action === "APPROVE") {
      if (!announcementId) {
        return NextResponse.json({ success: false, error: "announcementId requis" }, { status: 400 });
      }
      const approved = await announcementService.approveAnnouncement(context, announcementId);
      return NextResponse.json({ success: true, data: approved });
    }

    if (action === "CANCEL") {
      if (!announcementId) {
        return NextResponse.json({ success: false, error: "announcementId requis" }, { status: 400 });
      }
      const cancelled = await announcementService.cancelAnnouncement(context, announcementId);
      return NextResponse.json({ success: true, data: cancelled });
    }

    if (action === "ACKNOWLEDGE") {
      if (!announcementId) {
        return NextResponse.json({ success: false, error: "announcementId requis" }, { status: 400 });
      }
      const userName = context.roles[0] || "Collaborateur";
      const result = announcementService.acknowledgeAnnouncement(context.userId, userName, announcementId);
      return NextResponse.json({ ...result });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du traitement de l'annonce" },
      { status: 400 }
    );
  }
}
