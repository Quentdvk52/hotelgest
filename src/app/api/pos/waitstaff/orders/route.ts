import { NextRequest, NextResponse } from "next/server";
import {
  getWaitstaffOrders,
  createWaitstaffOrder,
  advanceOrderItemStatus,
  settleWaitstaffOrder,
} from "@/modules/pos/waitstaff-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waitstaffId = searchParams.get("waitstaffId") || "user-srv-boh";
    const propertyId = searchParams.get("propertyId") || undefined;

    const orders = getWaitstaffOrders(waitstaffId, propertyId);
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, tableLabel, zone, waitstaffId, waitstaffName, clientName, notes, items } = body;

    if (!propertyId || !tableLabel || !waitstaffId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants (propertyId, tableLabel, waitstaffId, items)" },
        { status: 400 }
      );
    }

    const order = createWaitstaffOrder({
      propertyId,
      tableLabel,
      zone: zone || "Salle Principale",
      waitstaffId,
      waitstaffName: waitstaffName || "Serveuse en salle",
      clientName,
      notes,
      items,
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "ADVANCE_ITEM_STATUS") {
      const { orderId, itemId, newStatus } = body;
      const res = advanceOrderItemStatus(orderId, itemId, newStatus);
      if (!res.success) {
        return NextResponse.json({ success: false, error: "Article ou commande introuvable" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order: res.order });
    }

    if (action === "SETTLE_ORDER") {
      const { orderId, paymentMethod, cashAmountXof, mobileAmountXof, mobileOperator, mobileNumber, waitstaffName } = body;
      const res = settleWaitstaffOrder({
        orderId,
        paymentMethod: paymentMethod || "CASH",
        cashAmountXof: cashAmountXof || 0,
        mobileAmountXof: mobileAmountXof || 0,
        mobileOperator,
        mobileNumber,
        waitstaffName: waitstaffName || "Serveuse en salle",
      });

      if (!res.success) {
        return NextResponse.json({ success: false, error: "Commande introuvable pour encaissement" }, { status: 404 });
      }
      return NextResponse.json({ success: true, payment: res.payment, order: res.order });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
