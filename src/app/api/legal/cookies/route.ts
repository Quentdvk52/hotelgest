import { NextRequest, NextResponse } from "next/server";
import {
  getCookieSettings,
  updateCookieSettings,
  isAuthorizedToManageLegal,
} from "@/modules/legal/legal-service";

export async function GET() {
  const settings = getCookieSettings();
  return NextResponse.json({ settings });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, user } = body;

    const role = user?.roleCode || request.headers.get("x-user-role");
    if (!isAuthorizedToManageLegal(role)) {
      return NextResponse.json(
        { error: "Privilège insuffisant pour modifier les réglages de traceurs." },
        { status: 403 }
      );
    }

    const res = updateCookieSettings(settings, {
      name: user?.name || "Direction Générale",
      roleCode: role,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, settings: res.settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des réglages cookies : " + err.message },
      { status: 500 }
    );
  }
}
