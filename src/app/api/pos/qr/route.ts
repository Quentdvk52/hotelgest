import { NextResponse } from "next/server";
import { qrService } from "@/modules/pos/qr-service";
import { resolveSessionContext } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || undefined;
    const type = (searchParams.get("type") as "TABLE" | "ROOM") || undefined;

    // Optional auth check for listing all QR tokens
    const context = await resolveSessionContext(req);
    const resources = qrService.listQrResources(propertyId, type);

    return NextResponse.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Accès non autorisé" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { action, propertyId, tableNumber, spaceName, spaceType, capacity, unitNumber, roomName } = body;

    const targetProperty = propertyId || context.propertyId;

    if (action === "CREATE_TABLE") {
      if (!tableNumber || !spaceName) {
        return NextResponse.json(
          { success: false, error: "tableNumber et spaceName sont obligatoires" },
          { status: 400 }
        );
      }
      const result = qrService.createTableWithQr(
        targetProperty,
        tableNumber,
        spaceName,
        spaceType || "RESTAURANT",
        capacity || 4
      );
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "CREATE_ROOM") {
      if (!unitNumber || !roomName) {
        return NextResponse.json(
          { success: false, error: "unitNumber et roomName sont obligatoires" },
          { status: 400 }
        );
      }
      const result = qrService.createRoomWithQr(targetProperty, unitNumber, roomName);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur de création QR" },
      { status: 400 }
    );
  }
}
