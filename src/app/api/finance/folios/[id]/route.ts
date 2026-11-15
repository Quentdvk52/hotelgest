import { NextResponse } from "next/server";
import { folioService } from "@/modules/finance/folio-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await resolveSessionContext(req);
    const { id } = await params;
    const folio = folioService.getFolioById(id);
    if (!folio) {
      return NextResponse.json({ success: false, error: "Folio introuvable" }, { status: 404 });
    }

    const { hasPropertyAccess } = await import("@/lib/auth/rbac");
    if (!hasPropertyAccess(context, folio.propertyId)) {
      return NextResponse.json(
        { success: false, error: "PERMISSION_DENIED: Accès interdit à ce folio pour votre agence." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: folio });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour consulter un folio." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const context = await resolveSessionContext(req);
    const body = await req.json();

    const line = await folioService.addCharge(context, id, body);
    return NextResponse.json({ success: true, data: line });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur d'ajout de charge" },
      { status: 400 }
    );
  }
}
