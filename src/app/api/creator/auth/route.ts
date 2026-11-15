import { NextRequest, NextResponse } from "next/server";
import { envConfig } from "../../../../lib/config";
import { signCreatorToken } from "../../../../modules/auth/creator-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (
      email?.toLowerCase().trim() === envConfig.CREATOR.EMAIL.toLowerCase().trim() &&
      password === envConfig.CREATOR.PASSWORD
    ) {
      const sessionToken = signCreatorToken(envConfig.CREATOR.EMAIL);

      const response = NextResponse.json({
        success: true,
        user: {
          email: envConfig.CREATOR.EMAIL,
          role: "PLATFORM_CREATOR",
          name: "Créateur & Concepteur HotelGest",
        },
      });

      // Set cryptographically signed HTTP-Only Cookie
      response.cookies.set("hotelgest_creator_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Identifiants créateur invalides." },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("hotelgest_creator_session");
  return response;
}
