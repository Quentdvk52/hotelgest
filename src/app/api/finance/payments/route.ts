import { NextResponse } from "next/server";
import { folioService } from "@/modules/finance/folio-service";
import { cashService } from "@/modules/finance/cash-service";
import { resolveSessionContext } from "@/lib/auth/session";
import { chariowService } from "@/modules/subscription/chariow-service";

export async function POST(req: Request) {
  try {
    const opsCheck = chariowService.canPerformOperations("tenant-vignoble-001");
    if (!opsCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "TRIAL_EXPIRED", message: opsCheck.reason },
        { status: 403 }
      );
    }

    const context = await resolveSessionContext(req);
    const body = await req.json();
    const { folioId, paymentMethod, amountXof, reference, notes, cashSessionId } = body;

    const payment = await folioService.recordPayment(context, folioId, {
      paymentMethod,
      amountXof,
      reference,
      notes,
    });

    if (paymentMethod === "CASH" && cashSessionId) {
      cashService.addCashMovement(cashSessionId, amountXof);
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du paiement" },
      { status: 400 }
    );
  }
}
