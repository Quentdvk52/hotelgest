import { NextResponse } from "next/server";
import { qrService } from "@/modules/pos/qr-service";
import { SEED_PROPERTIES } from "@/lib/db/seed";
import {
  WAITSTAFF_CATALOG,
  BENIN_MEAL_ACCOMPANIMENTS,
} from "@/modules/pos/waitstaff-service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const resource = qrService.resolveToken(token);

  if (!resource) {
    return NextResponse.json(
      { success: false, error: "QR Code invalide, expiré ou révoqué" },
      { status: 404 }
    );
  }

  const property = SEED_PROPERTIES.find((p) => p.id === resource.propertyId);

  // Group catalog strictly into the 3 requested tabs:
  // 1. Boissons (Bières, sodas, jus, eaux, cocktails)
  // 2. Repas (Plats chauds & grillades avec accompagnement inclus)
  // 3. Cave (Vins fins de garde, grands crus, champagnes de prestige)
  const beverages = WAITSTAFF_CATALOG.filter((p) => p.unit === "BEVERAGE");
  const meals = WAITSTAFF_CATALOG.filter((p) => p.unit === "MEAL");
  const wines = WAITSTAFF_CATALOG.filter((p) => p.unit === "WINE");

  return NextResponse.json({
    success: true,
    data: {
      resource,
      property,
      catalog: {
        beverages,
        meals,
        wines,
      },
      accompaniments: BENIN_MEAL_ACCOMPANIMENTS,
    },
  });
}
