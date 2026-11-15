import { NextResponse } from "next/server";
import { equipmentService } from "@/modules/catering-equipment/equipment-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";
  const itemId = searchParams.get("itemId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (itemId && startDate && endDate) {
    const available = await equipmentService.getAvailableQuantity(
      propertyId,
      itemId,
      startDate,
      endDate
    );
    return NextResponse.json({ success: true, data: { available } });
  }

  const rentals = equipmentService.getRentalsByProperty(propertyId);
  const items = equipmentService.getItemsByProperty(propertyId);
  return NextResponse.json({ success: true, data: { rentals, items } });
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const rental = await equipmentService.createRental(context, body);
    return NextResponse.json({ success: true, data: rental });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de réservation de matériel" },
      { status: 400 }
    );
  }
}
