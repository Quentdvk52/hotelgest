import { NextResponse } from "next/server";
import { verifySessionToken, signSessionToken, AuthenticatedUser } from "@/modules/auth/auth-service";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("hotelgest_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id,
        email: payload.email,
        fullName: payload.fullName,
        roleCode: payload.roleCode,
        roleName: payload.roleName,
        propertyId: payload.propertyId,
        maxDiscount: payload.maxDiscount,
        permissions: payload.permissions,
        avatarUrl: (payload as any).avatarUrl,
        phone: (payload as any).phone,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("hotelgest_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Session expirée" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, avatarUrl, newPassword } = body;

    const updatedUser: AuthenticatedUser & { avatarUrl?: string; phone?: string } = {
      id: payload.id,
      email: payload.email,
      fullName: fullName?.trim() || payload.fullName,
      roleCode: payload.roleCode,
      roleName: payload.roleName,
      propertyId: payload.propertyId,
      maxDiscount: payload.maxDiscount,
      permissions: payload.permissions,
      avatarUrl: avatarUrl?.trim() || (payload as any).avatarUrl,
      phone: phone?.trim() || (payload as any).phone,
    };

    const newToken = signSessionToken(updatedUser as any);

    cookieStore.set("hotelgest_session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: newPassword
        ? "Profil et mot de passe mis à jour avec succès"
        : "Profil mis à jour avec succès",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
