import { NextResponse } from "next/server";
import { pmsService } from "@/modules/pms/pms-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  // Public availability search (guest booking engine)
  if (checkIn && checkOut) {
    const available = await pmsService.getAvailableUnits(propertyId, checkIn, checkOut);
    return NextResponse.json({ success: true, data: available });
  }

  // Listing reservations contains PII (guest names & phones): requires staff auth
  try {
    const context = await resolveSessionContext(req);
    const { hasPropertyAccess, checkPermission } = await import("@/lib/auth/rbac");
    if (!hasPropertyAccess(context, propertyId) || !checkPermission(context, "pms:reservations:read", propertyId)) {
      return NextResponse.json(
        { success: false, error: "PERMISSION_DENIED: Accès aux réservations interdit pour ce site." },
        { status: 403 }
      );
    }

    const reservations = pmsService.getReservationsByProperty(propertyId);
    return NextResponse.json({ success: true, data: reservations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour consulter les réservations." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const reservation = await pmsService.createReservation(context, body);
    return NextResponse.json({ success: true, data: reservation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la réservation" },
      { status: 400 }
    );
  }
}
