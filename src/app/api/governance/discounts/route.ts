import { NextResponse } from "next/server";
import { discountService } from "@/modules/governance/discount-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || context.propertyId;

    const { hasPropertyAccess, checkPermission } = await import("@/lib/auth/rbac");
    if (
      !hasPropertyAccess(context, propertyId) ||
      (!checkPermission(context, "discounts:request", propertyId) &&
       !checkPermission(context, "discounts:approve", propertyId))
    ) {
      return NextResponse.json(
        { success: false, error: "PERMISSION_DENIED: Accès aux remises interdit pour ce site." },
        { status: 403 }
      );
    }

    const requests = discountService.getRequestsByProperty(propertyId);
    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentification requise pour consulter les remises." },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { action, requestId, decision, notes, ...createData } = body;

    if (action === "REVIEW") {
      const reviewed = await discountService.reviewDiscountRequest(context, requestId, {
        decision,
        notes,
      });
      return NextResponse.json({ success: true, data: reviewed });
    }

    const request = await discountService.createDiscountRequest(context, createData);
    return NextResponse.json({ success: true, data: request });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de remise" },
      { status: 400 }
    );
  }
}
