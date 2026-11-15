import { NextResponse } from "next/server";
import { orderService } from "@/modules/pos/order-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";
  const orders = orderService.getOrdersByProperty(propertyId);
  return NextResponse.json({ success: true, data: orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = await orderService.createOrder(body);
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la commande" },
      { status: 400 }
    );
  }
}
