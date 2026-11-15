import { NextResponse } from "next/server";
import { verifySessionToken } from "@/modules/auth/auth-service";
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
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
