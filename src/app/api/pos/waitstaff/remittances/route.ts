import { NextRequest, NextResponse } from "next/server";
import {
  getWaitstaffRemittanceSnapshot,
  submitServerRemittance,
  confirmServerRemittance,
} from "@/modules/pos/waitstaff-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waitstaffId = searchParams.get("waitstaffId") || "user-srv-boh";
    const propertyId = searchParams.get("propertyId") || "prop-bohicon-001";

    const snapshot = getWaitstaffRemittanceSnapshot(waitstaffId, propertyId);
    return NextResponse.json({ success: true, snapshot });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      waitstaffId,
      waitstaffName,
      declaredCashXof,
      declaredMobileXof,
      expectedCashXof,
      note,
    } = body;

    if (!propertyId || !waitstaffId) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants (propertyId, waitstaffId)" },
        { status: 400 }
      );
    }

    const remittance = submitServerRemittance({
      propertyId,
      waitstaffId,
      waitstaffName: waitstaffName || "Serveuse en salle",
      declaredCashXof: Number(declaredCashXof) || 0,
      declaredMobileXof: Number(declaredMobileXof) || 0,
      expectedCashXof: Number(expectedCashXof) || 0,
      note,
    });

    return NextResponse.json({ success: true, remittance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { remittanceId, receivedCashXof, confirmedBy, note } = body;

    if (!remittanceId || receivedCashXof === undefined) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants (remittanceId, receivedCashXof)" },
        { status: 400 }
      );
    }

    const res = confirmServerRemittance({
      remittanceId,
      receivedCashXof: Number(receivedCashXof),
      confirmedBy: confirmedBy || "Gérant d'établissement",
      note,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: "Remise introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, remittance: res.remittance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
