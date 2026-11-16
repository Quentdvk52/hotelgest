"use client";

import React, { useState, useRef } from "react";
import {
  Printer,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Building,
  FileText,
  Download,
  Receipt,
  X,
  CreditCard,
  User,
  Phone,
  Layers,
} from "lucide-react";
import { executeUniversalPrint, PrintFormat } from "@/lib/print/print-service";
import { EmecefNormalizedResponse } from "@/lib/fiscal/emecef-service";

interface NormalizedInvoiceViewProps {
  invoiceData: {
    reference: string;
    propertyName: string;
    propertyCity: string;
    propertyPhone: string;
    ifu?: string;
    client: {
      name: string;
      ifu?: string;
      contact?: string;
      address?: string;
    };
    operatorName: string;
    items: {
      name: string;
      price: number;
      quantity: number;
      taxGroup: "A" | "B" | "C" | "D" | "E";
    }[];
    paymentMethod: string;
    createdAt?: string;
  };
  normalizedData: EmecefNormalizedResponse;
  onClose?: () => void;
}

export function NormalizedInvoiceView({
  invoiceData,
  normalizedData,
  onClose,
}: NormalizedInvoiceViewProps) {
  const [format, setFormat] = useState<PrintFormat>("A4");
  const [printing, setPrinting] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const ifu = invoiceData.ifu || "0201910839213";
  const dateStr = normalizedData.ts
    ? new Date(normalizedData.ts).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : new Date().toLocaleString("fr-FR");

  const handlePrint = async () => {
    if (!printableAreaRef.current) return;
    setPrinting(true);
    try {
      const html = printableAreaRef.current.innerHTML;
      await executeUniversalPrint(
        html,
        format,
        `Facture_Normalisee_${normalizedData.uid}`
      );
    } catch (e) {
      console.error("Erreur d'impression :", e);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="bg-stone-900/90 fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Control Bar */}
        <div className="p-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>Facture Normalisée e-MECeF</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  DGI Bénin
                </span>
              </div>
              <div className="text-sm font-semibold text-white">
                UID : {normalizedData.uid}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Selector */}
            <div className="inline-flex rounded-xl bg-stone-800 p-1 border border-stone-700 text-xs">
              <button
                type="button"
                onClick={() => setFormat("A4")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  format === "A4"
                    ? "bg-[#184f28] text-white shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                A4 Grand Format
              </button>
              <button
                type="button"
                onClick={() => setFormat("THERMAL_80MM")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  format === "THERMAL_80MM"
                    ? "bg-[#184f28] text-white shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                Ticket 80mm POS
              </button>
            </div>

            <button
              onClick={handlePrint}
              disabled={printing}
              className="px-4 py-2 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{printing ? "Impression..." : "Imprimer Document"}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-stone-100 flex justify-center">
          <div
            ref={printableAreaRef}
            className={`bg-white shadow-lg border border-stone-300 transition-all ${
              format === "A4"
                ? "w-full max-w-2xl p-8 rounded-2xl text-stone-900"
                : "w-[80mm] p-4 rounded-xl text-stone-900 text-[11px] leading-tight"
            }`}
          >
            {/* Official Header */}
            <div className="text-center pb-4 border-b-2 border-[#184f28]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
                RÉPUBLIQUE DU BÉNIN
              </div>
              <div className="text-[9px] font-semibold text-stone-500 uppercase">
                MINISTÈRE DE L&apos;ÉCONOMIE ET DES FINANCES • DIRECTION GÉNÉRALE DES IMPÔTS
              </div>
              <div className="mt-2 text-lg font-black font-serif text-[#184f28] uppercase tracking-wide">
                HÔTEL LE VIGNOBLE
              </div>
              <div className="text-xs text-stone-600">
                {invoiceData.propertyName} — {invoiceData.propertyCity} • Tél : {invoiceData.propertyPhone}
              </div>
              <div className="mt-1 inline-block px-3 py-0.5 rounded-full bg-stone-100 text-stone-800 font-mono text-[10px] font-bold border border-stone-300">
                IFU N° : {ifu} • Régime Fiscal : Réel Normal
              </div>
            </div>

            {/* Document Title & Reference */}
            <div className="my-4 py-2 border-y border-dashed border-stone-300 flex justify-between items-center text-xs">
              <div>
                <span className="font-black text-stone-900 uppercase">
                  FACTURE NORMALISÉE DE VENTE (FV)
                </span>
                <div className="text-[11px] text-stone-500 font-mono">
                  Réf Interne : {invoiceData.reference}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-stone-800">{dateStr}</div>
                <div className="text-[10px] text-stone-500">
                  Opérateur : {invoiceData.operatorName}
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mb-4 text-xs space-y-0.5">
              <div className="font-bold text-stone-800 flex items-center justify-between">
                <span>Client : {invoiceData.client.name}</span>
                {invoiceData.client.ifu && (
                  <span className="font-mono text-[10px] text-stone-600">
                    IFU Client : {invoiceData.client.ifu}
                  </span>
                )}
              </div>
              {invoiceData.client.contact && (
                <div className="text-stone-500 text-[11px]">
                  Contact : {invoiceData.client.contact}
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs mb-4">
              <thead>
                <tr className="border-b-2 border-stone-200 text-stone-600 text-[10px] uppercase font-bold">
                  <th className="py-1.5">Désignation</th>
                  <th className="py-1.5 text-center">Qté</th>
                  <th className="py-1.5 text-right">P.U TTC</th>
                  <th className="py-1.5 text-center">Taxe</th>
                  <th className="py-1.5 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoiceData.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1.5 font-medium">{item.name}</td>
                    <td className="py-1.5 text-center">{item.quantity}</td>
                    <td className="py-1.5 text-right font-mono">
                      {item.price.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-1.5 text-center font-bold text-stone-700">
                      [{item.taxGroup}]
                    </td>
                    <td className="py-1.5 text-right font-bold text-stone-900 font-mono">
                      {(item.price * item.quantity).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary & Benin Taxes */}
            <div className="border-t-2 border-stone-800 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Total Hors Taxe (HT) :</span>
                <span className="font-mono font-semibold">
                  {normalizedData.totalHtXof.toLocaleString("fr-FR")} XOF
                </span>
              </div>

              {normalizedData.taxBreakdown.map((tb, idx) => (
                <div key={idx} className="flex justify-between text-stone-600">
                  <span>
                    TVA {tb.groupLabel} [{tb.group}] :
                  </span>
                  <span className="font-mono">
                    {tb.vatAmount.toLocaleString("fr-FR")} XOF
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-stone-300 flex justify-between text-base font-black text-[#184f28]">
                <span>TOTAL TTC :</span>
                <span className="font-mono">
                  {normalizedData.totalTtcXof.toLocaleString("fr-FR")} XOF
                </span>
              </div>
              <div className="text-[11px] text-stone-500 text-right pt-0.5">
                Règlement : <strong>{invoiceData.paymentMethod}</strong>
              </div>
            </div>

            {/* Official e-MECeF Fiscal Security Box */}
            <div className="mt-5 pt-4 border-t-2 border-dashed border-stone-400 bg-stone-50/80 p-3 rounded-2xl border border-stone-200">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Visual QR Code Generator */}
                <div className="w-24 h-24 bg-white p-1 rounded-xl border border-stone-300 flex items-center justify-center shrink-0 shadow-xs">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-stone-900 mx-auto" />
                    <span className="text-[8px] font-bold text-emerald-800 uppercase block mt-0.5">
                      DGI e-MECeF
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-1 text-left w-full text-[10px]">
                  <div className="font-bold text-stone-800 uppercase tracking-wider text-[9px] text-[#184f28]">
                    ÉLÉMENTS FISCAUX DE SÉCURITÉ DGI BÉNIN
                  </div>
                  <div>
                    <span className="text-stone-500">MECeF NIM :</span>{" "}
                    <strong className="font-mono text-stone-900">{normalizedData.nim}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">MECeF Compteur :</span>{" "}
                    <strong className="font-mono text-stone-900">{normalizedData.codeMECeF}</strong>
                  </div>
                  <div className="break-all">
                    <span className="text-stone-500">MECeF UID :</span>{" "}
                    <strong className="font-mono text-[#184f28]">{normalizedData.uid}</strong>
                  </div>
                  <div className="text-[9px] text-stone-500 pt-1">
                    Vérification en direct : <em>https://facture.dgi.bj</em>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-4 pt-2 text-center text-[9px] text-stone-400 border-t border-stone-200">
              Hôtel Le Vignoble • La facture normalisée certifie la conformité de vos transactions auprès de la DGI Bénin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
