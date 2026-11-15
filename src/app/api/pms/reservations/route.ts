import { NextResponse } from "next/server";
import { pmsService } from "@/modules/pms/pms-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (checkIn && checkOut) {
    const available = await pmsService.getAvailableUnits(propertyId, checkIn, checkOut);
    return NextResponse.json({ success: true, data: available });
  }

  const reservations = pmsService.getReservationsByProperty(propertyId);
  return NextResponse.json({ success: true, data: reservations });
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
