import { NextResponse } from "next/server";
import { orderService } from "@/modules/pos/order-service";
import { dispatchQrClientOrder } from "@/modules/pos/waitstaff-service";
import { resolveSessionContext } from "@/lib/auth/session";
import { chariowService } from "@/modules/subscription/chariow-service";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || context.propertyId;

    const { hasPropertyAccess, checkPermission } = await import("@/lib/auth/rbac");
    if (
      !hasPropertyAccess(context, propertyId) ||
      (!checkPermission(context, "pos:orders:create", propertyId) &&
       !checkPermission(context, "pos:stations:kitchen:view", propertyId))
    ) {
      return NextResponse.json(
        { success: false, error: "PERMISSION_DENIED: Accès aux commandes restaurant interdit pour ce site." },
        { status: 403 }
      );
    }

    const orders = orderService.getOrdersByProperty(propertyId);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour consulter les commandes restaurant." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const opsCheck = chariowService.canPerformOperations("tenant-vignoble-001");
    if (!opsCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "TRIAL_EXPIRED", message: opsCheck.reason },
        { status: 403 }
      );
    }

    const body = await req.json();

    // 1. QR Client Direct Flow
    if (body.source === "QR_CLIENT") {
      const waitstaffOrder = dispatchQrClientOrder({
        propertyId: body.propertyId,
        tableLabel: body.tableLabel || body.tableNumber || (body.unitNumber ? `Chambre ${body.unitNumber}` : "Table Directe"),
        zone: body.zone || body.spaceName || "Salle Restaurant",
        clientName: body.clientName,
        customerNotes: body.customerNotes,
        paymentMethod: body.paymentMethod || "PAY_ON_DELIVERY",
        kkiapayPhone: body.kkiapayPhone,
        kkiapayTransactionId: body.kkiapayTransactionId,
        items: body.items.map((it: any) => ({
          productId: it.productId || it.menuItemId,
          quantity: it.quantity,
          accompaniment: it.accompaniment,
          specialInstructions: it.specialInstructions,
        })),
      });

      return NextResponse.json({
        success: true,
        data: waitstaffOrder,
      });
    }

    // 2. Standard POS Staff Flow
    const order = await orderService.createOrder(body);
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la commande" },
      { status: 400 }
    );
  }
}
