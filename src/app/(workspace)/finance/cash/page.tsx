"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  DollarSign,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle,
  FileText,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";

export default function CashFinancePage() {
  const [session, setSession] = useState<{
    status: "OPEN" | "CLOSED";
    openingBalanceXof: number;
    theoreticalBalanceXof: number;
    countedBalanceXof?: number;
    discrepancyXof: number;
    discrepancyReason?: string;
  }>({
    status: "OPEN",
    openingBalanceXof: 50000,
    theoreticalBalanceXof: 125000, // 50 000 open + 75 000 cash sales
    discrepancyXof: 0,
  });

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [countedCash, setCountedCash] = useState(125000);
  const [justification, setJustification] = useState("");

  const recentTransactions = [
    {
      id: "pay-101",
      method: "CASH",
      amountXof: 25000,
      label: "Règlement Chambre 101",
      ref: "REC-ESP-001",
      time: "10:15",
    },
    {
      id: "pay-102",
      method: "MOBILE_MONEY",
      amountXof: 35000,
      label: "Règlement Resto Table 2",
      ref: "MTN-MOMO-89872",
      time: "11:30",
    },
    {
      id: "pay-103",
      method: "CASH",
      amountXof: 50000,
      label: "Acompte Traiteur (Espèces)",
      ref: "REC-ESP-002",
      time: "12:45",
    },
  ];

  const handleCloseSession = (e: React.FormEvent) => {
    e.preventDefault();
    const discrepancy = countedCash - session.theoreticalBalanceXof;

    if (discrepancy !== 0 && (!justification || justification.trim().length < 5)) {
      alert("ERREUR : Un écart de caisse exige une justification formelle d'au moins 5 caractères.");
      return;
    }

    setSession({
      status: "CLOSED",
      openingBalanceXof: session.openingBalanceXof,
      theoreticalBalanceXof: session.theoreticalBalanceXof,
      countedBalanceXof: countedCash,
      discrepancyXof: discrepancy,
      discrepancyReason: justification,
    });

    setShowCloseModal(false);
    alert("Session de caisse clôturée avec succès.");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Gestion de Caisse & Règlements</h1>
          <p className="text-xs text-stone-500 mt-1">
            Fonds de caisse, mouvements d&apos;encaissement par mode (Espèces, MoMo, TPE, Virement) et clôture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={session.status === "OPEN" ? "success" : "danger"}>
            Session {session.status === "OPEN" ? "OUVERTE" : "CLÔTURÉE"}
          </Badge>
          {session.status === "OPEN" && (
            <Button
              variant="danger"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setCountedCash(session.theoreticalBalanceXof);
                setJustification("");
                setShowCloseModal(true);
              }}
            >
              <Lock className="w-4 h-4" /> Clôturer la Session
            </Button>
          )}
        </div>
      </div>

      {/* Cash Balances Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Fonds d&apos;Ouverture
          </span>
          <div className="text-2xl font-black text-stone-900">
            {session.openingBalanceXof.toLocaleString("fr-FR")} <span className="text-xs font-semibold text-stone-500">XOF</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">Espèces initiales en tiroir</div>
        </Card>

        <Card className="p-6 border-[#7c3c46]/30 bg-gradient-to-br from-white to-[#faf5f5]">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Solde Théorique Espèces
          </span>
          <div className="text-2xl font-black text-[#7c3c46]">
            {session.theoreticalBalanceXof.toLocaleString("fr-FR")} <span className="text-xs font-semibold text-stone-500">XOF</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">Fonds initial + Ventes espèces</div>
        </Card>

        <Card className="p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Écart de Caisse
          </span>
          <div className={`text-2xl font-black ${session.discrepancyXof === 0 ? "text-emerald-600" : "text-red-600"}`}>
            {session.discrepancyXof.toLocaleString("fr-FR")} <span className="text-xs font-semibold text-stone-500">XOF</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            {session.discrepancyXof === 0 ? "Caisse parfaitement équilibrée" : "Écart justifié au rapport"}
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Règlements Enregistrés de la Session</CardTitle>
          <CardDescription>
            Tous modes de paiement hors plateforme (Espèces, Mobile Money, TPE, Virement).
          </CardDescription>
        </CardHeader>

        <div className="divide-y divide-stone-200">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                  {tx.method === "CASH" ? (
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">{tx.label}</div>
                  <div className="text-stone-500">
                    Mode : <strong className="text-stone-700">{tx.method}</strong> • Réf : {tx.ref}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-[#7c3c46]">
                  {tx.amountXof.toLocaleString("fr-FR")} XOF
                </div>
                <div className="text-stone-400">{tx.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Close Cash Session Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Clôture de Caisse & Comptage Réel
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Solde théorique attendu : <strong>{session.theoreticalBalanceXof.toLocaleString("fr-FR")} XOF</strong>
            </p>

            <form onSubmit={handleCloseSession} className="space-y-4">
              <Input
                label="Montant espèces physiquement compté en caisse (XOF)"
                type="number"
                value={countedCash}
                onChange={(e) => setCountedCash(parseInt(e.target.value, 10) || 0)}
                required
              />

              {countedCash !== session.theoreticalBalanceXof && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" /> Écart détecté :{" "}
                    {(countedCash - session.theoreticalBalanceXof).toLocaleString("fr-FR")} XOF
                  </div>
                  <div>Une justification explicite est obligatoire pour valider la clôture.</div>
                  <div className="mt-2">
                    <Input
                      label="Justification formelle de l'écart"
                      placeholder="Motif de l'écart (ex: monnaie client non réclamée...)"
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCloseModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="danger" className="flex-1">
                  Valider la Clôture
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
