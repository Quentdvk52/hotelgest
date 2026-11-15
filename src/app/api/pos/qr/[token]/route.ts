import { NextResponse } from "next/server";
import { qrService } from "@/modules/pos/qr-service";
import { SEED_MENU_ITEMS, SEED_PROPERTIES } from "@/lib/db/seed";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const resource = qrService.resolveToken(token);

  if (!resource) {
    return NextResponse.json(
      { success: false, error: "QR Code invalide, expiré ou révoqué" },
      { status: 404 }
    );
  }

  const property = SEED_PROPERTIES.find((p) => p.id === resource.propertyId);
  const menu = SEED_MENU_ITEMS.filter((m) => m.propertyId === resource.propertyId);

  return NextResponse.json({
    success: true,
    data: {
      resource,
      property,
      menu,
    },
  });
}
