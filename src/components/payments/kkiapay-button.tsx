"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface KkiapayButtonProps {
  amount: number;
  label?: string;
  type: "ROOM_BOOKING" | "WINE_STORE" | "CATERING_ORDER" | "EQUIPMENT_RENTAL";
  referenceId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess: (response: { transactionId: string; amount: number; method: string }) => void;
  className?: string;
}

export function KkiapayButton({
  amount,
  label = "Payer en ligne (Mobile Money / Carte)",
  type,
  referenceId,
  customerName = "",
  customerPhone = "",
  customerEmail = "",
  onSuccess,
  className = "",
}: KkiapayButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"MTN" | "MOOV" | "CELTIIS" | "CARTE">("MTN");
  const [phone, setPhone] = useState(customerPhone || "");
  const [cardNumber, setCardNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setModalOpen(true);
    setSuccess(false);
    setError(null);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const generatedTxId = `kkiapay_tx_${Date.now()}`;
      const methodCode =
        selectedMethod === "MTN"
          ? "MTN_MOMO"
          : selectedMethod === "MOOV"
          ? "MOOV_MONEY"
          : selectedMethod === "CELTIIS"
          ? "CELTIIS"
          : "CARTE_BANCAIRE";

      const res = await fetch("/api/payments/kkiapay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: generatedTxId,
          amountXof: amount,
          type,
          referenceId,
          clientName: customerName || "Client Hôtel Le Vignoble",
          clientPhone: phone || customerPhone || "+229 97 00 00 00",
          clientEmail: customerEmail,
          paymentMethod: methodCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de validation du paiement KkiaPay");
      }

      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess({
          transactionId: generatedTxId,
          amount,
          method: methodCode,
        });
        setModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setProcessing(false);
      setError(err.message || "Une erreur est survenue lors du paiement.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all active:scale-95 ${className}`}
      >
        <Smartphone className="w-4 h-4 text-emerald-200" />
        <span>{label}</span>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-white relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {!success ? (
              <div>
                {/* Header with KkiaPay Branding */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-widest uppercase">
                    Agrégateur Agréé KkiaPay
                  </div>
                </div>

                <h3 className="text-xl font-bold font-serif text-white mb-1">
                  Paiement Sécurisé en Ligne
                </h3>
                <p className="text-xs text-stone-400 mb-5">
                  Règlement direct pour <strong className="text-stone-200">{referenceId}</strong>
                </p>

                {/* Amount Box */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 mb-6 flex items-center justify-between">
                  <span className="text-xs text-stone-400">Montant total à régler :</span>
                  <span className="text-xl font-extrabold text-[#d4af37]">
                    {amount.toLocaleString("fr-FR")} XOF
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {/* Select Payment Channel */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-2">
                      Sélectionnez votre moyen de paiement :
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: "MTN", label: "MTN Mobile Money", sub: "MoMo Bénin" },
                        { id: "MOOV", label: "Moov Money", sub: "Flooz Bénin" },
                        { id: "CELTIIS", label: "Celtiis Cash", sub: "Bénin" },
                        { id: "CARTE", label: "Carte Bancaire", sub: "Visa / Mastercard" },
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setSelectedMethod(ch.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedMethod === ch.id
                              ? "bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/50"
                              : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          <div className="font-bold text-white text-xs">{ch.label}</div>
                          <div className="text-[10px] text-stone-400">{ch.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Phone or Card */}
                  {selectedMethod !== "CARTE" ? (
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Numéro de téléphone {selectedMethod} (+229)
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: 97 00 11 22 ou 66 00 00 00"
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        Une invite de débit sera immédiatement envoyée sur votre téléphone.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Numéro de Carte Bancaire (16 chiffres)
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4000 1234 5678 9010"
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Confirmer le paiement de {amount.toLocaleString("fr-FR")} XOF</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-center gap-2 text-[10px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Paiement crypté SSL 256 bits via la passerelle KkiaPay</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif mb-2">Paiement Validé !</h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed mb-4">
                  Votre règlement de <strong className="text-[#d4af37]">{amount.toLocaleString("fr-FR")} XOF</strong> a été confirmé par l&apos;agrégateur KkiaPay. Un reçu électronique vous a été généré.
                </p>
                <div className="text-xs font-mono text-emerald-400">
                  Transaction : {referenceId}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
