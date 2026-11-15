import { NextResponse } from "next/server";
import { cateringService } from "@/modules/catering-equipment/catering-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || context.propertyId;

    const { hasPropertyAccess, checkPermission } = await import("@/lib/auth/rbac");
    if (
      !hasPropertyAccess(context, propertyId) ||
      (!checkPermission(context, "catering:orders:create", propertyId) &&
       !checkPermission(context, "catering:orders:manage", propertyId))
    ) {
      return NextResponse.json(
        { success: false, error: "PERMISSION_DENIED: Accès aux commandes traiteur interdit pour ce site." },
        { status: 403 }
      );
    }

    const orders = cateringService.getOrdersByProperty(propertyId);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour consulter les commandes traiteur." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const order = await cateringService.createCateringOrder(context, body);
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors de la commande traiteur" },
      { status: 400 }
    );
  }
}
