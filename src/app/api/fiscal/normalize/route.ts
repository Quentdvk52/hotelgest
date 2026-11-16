import { NextRequest, NextResponse } from "next/server";
import { normalizeInvoiceWithEmecef, EmecefInvoicePayload } from "@/lib/fiscal/emecef-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { client, items, payment, type = "FV", ifu, operator, reference } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "La facture doit comporter au moins une ligne d'article ou prestation." },
        { status: 400 }
      );
    }

    if (!client || !client.name) {
      return NextResponse.json(
        { error: "Le nom du client ou la mention 'Client Comptoir' est obligatoire." },
        { status: 400 }
      );
    }

    const payload: EmecefInvoicePayload = {
      ifu: ifu || process.env.COMPANY_IFU || "0201910839213",
      type: type || "FV",
      operator: operator || { name: process.env.COMPANY_NAME || "Hôtel Le Vignoble S.A." },
      client: {
        name: client.name,
        ifu: client.ifu || undefined,
        contact: client.contact || undefined,
        address: client.address || undefined,
      },
      payment: Array.isArray(payment) && payment.length > 0
        ? payment
        : [{ name: "ESPECES", amount: 0 }],
      items: items.map((i: any) => ({
        name: String(i.name || "Prestation Hôtelière"),
        price: Math.max(0, Number(i.price) || 0),
        quantity: Math.max(1, Number(i.quantity) || 1),
        taxGroup: ["A", "B", "C", "D", "E"].includes(i.taxGroup) ? i.taxGroup : "B",
      })),
      reference: reference || `REF-${Date.now().toString().slice(-6)}`,
    };

    const normalizedResult = await normalizeInvoiceWithEmecef(payload);

    return NextResponse.json({
      success: true,
      message: normalizedResult.isSimulated
        ? "Facture normalisée émise en mode simulateur conforme DGI (e-MECeF/SYGMEF)"
        : "Facture normalisée certifiée par la DGI Bénin",
      ...normalizedResult,
    });
  } catch (error: any) {
    console.error("Erreur normalisation e-MECeF :", error);
    return NextResponse.json(
      {
        error: "Échec de la normalisation de la facture",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
