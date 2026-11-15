import { NextResponse } from "next/server";
import { discountService } from "@/modules/governance/discount-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";
  const requests = discountService.getRequestsByProperty(propertyId);
  return NextResponse.json({ success: true, data: requests });
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
