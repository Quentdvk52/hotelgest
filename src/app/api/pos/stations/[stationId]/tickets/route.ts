import { NextResponse } from "next/server";
import { orderService } from "@/modules/pos/order-service";

export async function GET(req: Request, { params }: { params: Promise<{ stationId: string }> }) {
  const { stationId } = await params;
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";

  const code = stationId.toUpperCase() as "CUISINE" | "BAR" | "CAVE";
  const tickets = orderService.getTicketsByStation(propertyId, code);
  return NextResponse.json({ success: true, data: tickets });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ stationId: string }> }) {
  try {
    const body = await req.json();
    const { ticketId, status } = body;
    const ticket = orderService.updateTicketStatus(ticketId, status);
    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de mise à jour du ticket" },
      { status: 400 }
    );
  }
}
