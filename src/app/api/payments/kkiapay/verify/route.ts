import { NextRequest, NextResponse } from "next/server";
import { kkiapayService } from "@/modules/payments/kkiapay-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      transactionId,
      amountXof,
      type,
      referenceId,
      clientName,
      clientPhone,
      clientEmail,
      paymentMethod,
      propertyId,
    } = body;

    if (!transactionId || !amountXof || !type) {
      return NextResponse.json(
        { error: "Paramètres de paiement KkiaPay manquants ou invalides" },
        { status: 400 }
      );
    }

    // Verify transaction
    const verifyResult = await kkiapayService.verifyTransaction(transactionId);
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: "La vérification du paiement KkiaPay a échoué" },
        { status: 402 }
      );
    }

    // Record verified transaction
    const recorded = kkiapayService.recordTransaction({
      transactionId,
      amountXof: Number(amountXof),
      type,
      referenceId: referenceId || `REF-${Date.now()}`,
      clientName: clientName || "Client Hôtel Le Vignoble",
      clientPhone: clientPhone || "+229 97 00 00 00",
      clientEmail,
      paymentMethod: paymentMethod || "MTN_MOMO",
      status: "SUCCESS",
      propertyId: propertyId || "prop-bohicon-001",
    });

    return NextResponse.json({
      success: true,
      transaction: recorded,
      message: "Paiement KkiaPay validé avec succès",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur lors du traitement KkiaPay" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const publicKey = kkiapayService.getPublicKey();

  // Protect transactions history: only authenticated staff with reports/cash rights can inspect transactions
  try {
    const { resolveSessionContext } = await import("@/lib/auth/session");
    const { checkPermission } = await import("@/lib/auth/rbac");
    const context = await resolveSessionContext(req);

    if (
      checkPermission(context, "reports:view") ||
      checkPermission(context, "cash:payment:record")
    ) {
      const transactions = kkiapayService.listTransactions();
      return NextResponse.json({
        publicKey,
        transactions,
      });
    }
  } catch {
    // Unauthenticated caller: return public checkout key only without leaking customer records
  }

  return NextResponse.json({
    publicKey,
    transactions: [],
  });
}
