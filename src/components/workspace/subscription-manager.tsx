"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Lock,
  Building,
  Zap,
  Clock,
  ArrowRight,
  Download,
  RefreshCw,
  Award,
  Wallet,
  Phone,
  Check,
} from "lucide-react";
import {
  CHARIOW_SUBSCRIPTION_PLANS,
  ChariowPlanCode,
  chariowService,
} from "@/modules/subscription/chariow-service";

interface SubscriptionManagerProps {
  isPromoter: boolean;
}

export function SubscriptionManager({ isPromoter }: SubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<ChariowPlanCode>("SEMIANNUAL_540K");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const ops = chariowService.canPerformOperations("tenant-vignoble-001");
  const sub = chariowService.getSubscription("tenant-vignoble-001");

  // Invoices history for Groupe Le Vignoble
  const invoices = [
    {
      id: "INV-CH-2026-11",
      date: "15 Nov 2026",
      plan: "HotelGest Enterprise Multi-Sites (1 Mois)",
      amountXof: 100000,
      paymentMethod: "Chariow • Mobile Money MTN",
      ref: "chariow_sale_884920",
      status: "PAYÉ",
    },
    {
      id: "INV-CH-2026-10",
      date: "15 Oct 2026",
      plan: "HotelGest Enterprise Multi-Sites (1 Mois)",
      amountXof: 100000,
      paymentMethod: "Chariow • Moov Money",
      ref: "chariow_sale_773012",
      status: "PAYÉ",
    },
    {
      id: "INV-CH-2026-09",
      date: "15 Sep 2026",
      plan: "HotelGest Enterprise Multi-Sites (1 Mois)",
      amountXof: 100000,
      paymentMethod: "Chariow • Carte Visa",
      ref: "chariow_sale_661904",
      status: "PAYÉ",
    },
  ];

  const handleOpenChariow = (planCode: ChariowPlanCode) => {
    setLoadingPlan(planCode);
    const plan = CHARIOW_SUBSCRIPTION_PLANS[planCode];
    // Direct redirect to Chariow hosted checkout page for this plan
    window.open(plan.url, "_blank", "noopener,noreferrer");
    setTimeout(() => setLoadingPlan(null), 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner: License Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#111c33] to-[#080d18] border border-[#1e293b] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            {ops.isTrial ? (
              ops.isExpired ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  Période d'Essai de 50 Jours Expirée • Opérations Suspendues
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Période d'Essai Promoteur Active • {ops.daysRemaining} Jours Restants (sur 50j)
                </div>
              )
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Licence Commerciale Chariow Active • Multi-Établissements
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Abonnement & Facturation Logiciel
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {ops.isTrial ? (
                ops.isExpired ? (
                  <>
                    <strong className="text-red-400">Attention :</strong> La période d&apos;essai gratuite de 50 jours accordée au promoteur (M. Eddy GNACADJA) est arrivée à expiration. Le personnel peut continuer à se connecter en consultation seule, mais <strong>toutes les opérations (commandes, factures, encaissements, réservations) sont bloquées</strong>. Activez un forfait ci-dessous pour débloquer immédiatement le système.
                  </>
                ) : (
                  <>
                    Le logiciel <strong>HotelGest</strong> fonctionne actuellement sous la <strong className="text-amber-300">période d&apos;essai gratuite de 50 jours</strong> accordée au promoteur à compter d&apos;aujourd&apos;hui (17 Novembre 2026). À la fin de cette période ({new Date("2027-01-06T00:00:00.000Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}), le personnel pourra toujours se connecter mais ne pourra plus effectuer d&apos;opérations jusqu&apos;à activation de l&apos;un des forfaits Chariow ci-dessous.
                  </>
                )
              ) : (
                <>
                  Le logiciel <strong>HotelGest</strong> est hébergé et maintenu pour le{" "}
                  <strong className="text-[#d4af37]">Groupe Hôtelier Le Vignoble</strong> couvrant 4 établissements
                  (Bohicon, Abomey, Abomey-Calavi et Zogbodomey). Les renouvellements sont traités en toute sécurité
                  via la passerelle officielle <strong className="text-blue-400">Chariow</strong>.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className={`border rounded-2xl p-4 backdrop-blur-md ${ops.isTrial && ops.isExpired ? "bg-red-950/40 border-red-500/30" : "bg-white/5 border-white/10"}`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                {ops.isTrial ? (ops.isExpired ? "Statut Licence" : "Fin Période d'Essai") : "Prochain renouvellement"}
              </span>
              <div className={`text-lg font-bold mt-0.5 flex items-center gap-1.5 ${ops.isTrial && ops.isExpired ? "text-red-400" : "text-[#d4af37]"}`}>
                <Clock className="w-4 h-4" />
                <span>
                  {ops.isTrial
                    ? (ops.isExpired ? "Expirée (0 jour restant)" : "6 Janvier 2027 (50j)")
                    : "15 Décembre 2026"}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {ops.isTrial && ops.isExpired
                  ? "Opérations suspendues • Action requise"
                  : "Passerelle officielle Chariow • MoMo & Cartes"}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Sites Coverage Pills */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <Building className="w-4 h-4 text-[#d4af37]" />
            <span>Hôtel Le Vignoble - Bohicon</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <Building className="w-4 h-4 text-[#d4af37]" />
            <span>Hôtel Le Vignoble - Abomey</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <Building className="w-4 h-4 text-[#d4af37]" />
            <span>Hôtel Le Vignoble - Calavi</span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <Building className="w-4 h-4 text-[#d4af37]" />
            <span>Hôtel Le Vignoble - Zogbodomey</span>
          </div>
        </div>
      </div>

      {/* Subscription Plans Selection Grid */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-lg font-bold text-stone-900">
              Choisissez votre formule de renouvellement Chariow
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Paiement direct et sécurisé par Mobile Money (MTN, Moov, Celtiis) ou Carte Bancaire (Visa, Mastercard).
            L&apos;activation est instantanée après validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* PLAN 1 : 1 MOIS */}
          {(() => {
            const plan = CHARIOW_SUBSCRIPTION_PLANS.MONTHLY_100K;
            const isSelected = selectedPlan === "MONTHLY_100K";
            return (
              <div
                onClick={() => setSelectedPlan("MONTHLY_100K")}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all border-2 relative ${
                  isSelected
                    ? "bg-white border-blue-600 shadow-xl ring-4 ring-blue-500/10"
                    : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold uppercase tracking-wider border border-stone-200">
                      1 Mois
                    </span>
                    <span className="text-xs font-semibold text-stone-400">Mensuel</span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900">{plan.name}</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Formule sans engagement à tacite reconduction.
                  </p>

                  <div className="my-5 pb-5 border-b border-stone-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-stone-900">
                        {plan.amountXof.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-sm font-bold text-stone-500">XOF / mois</span>
                    </div>
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      Couvre l&apos;intégralité des 4 agences du groupe
                    </span>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-stone-600">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChariow("MONTHLY_100K");
                    }}
                    disabled={loadingPlan === "MONTHLY_100K"}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <span>Souscrire 1 Mois via Chariow</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-center text-stone-400 block">
                    Lien officiel Chariow • Paiement sécurisé
                  </span>
                </div>
              </div>
            );
          })()}

          {/* PLAN 2 : 6 MOIS (POPULAIRE - 10% DE RÉDUCTION) */}
          {(() => {
            const plan = CHARIOW_SUBSCRIPTION_PLANS.SEMIANNUAL_540K;
            const isSelected = selectedPlan === "SEMIANNUAL_540K";
            return (
              <div
                onClick={() => setSelectedPlan("SEMIANNUAL_540K")}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all border-2 relative ${
                  isSelected
                    ? "bg-white border-[#d4af37] shadow-2xl ring-4 ring-[#d4af37]/20"
                    : "bg-white border-amber-300/80 hover:border-[#d4af37] shadow-md"
                }`}
              >
                {/* Popular Pill */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-[#d4af37] text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Le Plus Populaire • -10% de Réduction
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 pt-1">
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-900 text-[11px] font-bold uppercase tracking-wider border border-amber-400/40">
                      6 Mois
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      Économisez 60 000 XOF
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900">{plan.name}</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Tranquillité semestrielle avec tarif remisé.
                  </p>

                  <div className="my-5 pb-5 border-b border-stone-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-stone-900">
                        {plan.amountXof.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-sm font-bold text-stone-500">XOF / 6 mois</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-400 line-through">600 000 XOF</span>
                      <span className="text-[11px] font-bold text-emerald-700">
                        Équivaut à 90 000 XOF / mois
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-stone-700">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                        <span className="font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChariow("SEMIANNUAL_540K");
                    }}
                    disabled={loadingPlan === "SEMIANNUAL_540K"}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#184f28] to-[#123c1f] hover:from-[#123c1f] hover:to-[#0c2714] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
                  >
                    <span>Choisir la Formule 6 Mois (-10%)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-center text-stone-400 block">
                    Page officielle Chariow • Validation immédiate
                  </span>
                </div>
              </div>
            );
          })()}

          {/* PLAN 3 : 12 MOIS (BEST VALUE - 30% DE RÉDUCTION) */}
          {(() => {
            const plan = CHARIOW_SUBSCRIPTION_PLANS.ANNUAL_840K;
            const isSelected = selectedPlan === "ANNUAL_840K";
            return (
              <div
                onClick={() => setSelectedPlan("ANNUAL_840K")}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all border-2 relative ${
                  isSelected
                    ? "bg-white border-purple-600 shadow-2xl ring-4 ring-purple-500/15"
                    : "bg-white border-purple-200 hover:border-purple-400 shadow-md"
                }`}
              >
                {/* Best Value Pill */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Meilleure Valeur • -30% de Réduction
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 pt-1">
                    <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-900 text-[11px] font-bold uppercase tracking-wider border border-purple-300">
                      12 Mois
                    </span>
                    <span className="text-xs font-bold text-purple-700">
                      Économisez 360 000 XOF
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900">{plan.name}</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Sérénité annuelle totale avec le tarif préférentiel groupe.
                  </p>

                  <div className="my-5 pb-5 border-b border-stone-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-stone-900">
                        {plan.amountXof.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-sm font-bold text-stone-500">XOF / an</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-400 line-through">1 200 000 XOF</span>
                      <span className="text-[11px] font-bold text-purple-700">
                        Soit seulement 70 000 XOF / mois !
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs text-stone-700">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChariow("ANNUAL_840K");
                    }}
                    disabled={loadingPlan === "ANNUAL_840K"}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all active:scale-95"
                  >
                    <span>Choisir la Formule 12 Mois (-30%)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-center text-stone-400 block">
                    Page officielle Chariow • Économie maximale
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Payment Methods & Security Box */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-stone-900 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Passerelle Certifiée Chariow • Chiffrement SSL 256 bits</span>
          </div>
          <p className="text-xs text-stone-500 max-w-xl">
            Réglez votre abonnement en toute autonomie grâce à la plateforme Chariow. Compatible avec tous
            les comptes Mobile Money du Bénin et d&apos;Afrique de l&apos;Ouest ainsi que les cartes Visa et Mastercard.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs">
            📱 MTN MoMo
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs">
            📱 Moov Money
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs">
            📱 Celtiis Cash
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs">
            💳 Cartes Bancaires
          </span>
        </div>
      </div>

      {/* Billing & Invoices History */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-stone-900">
              Historique des Factures de Licence Logiciel
            </h4>
            <p className="text-xs text-stone-500">
              Quittances et reçus de paiement émis via Chariow pour le compte de l&apos;éditeur.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-400">
            Établissement : Groupe Le Vignoble
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 uppercase tracking-wider text-[11px] text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Réf. Facture</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description du Forfait</th>
                <th className="py-3 px-4">Passerelle</th>
                <th className="py-3 px-4 text-right">Montant Réglé</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{inv.id}</td>
                  <td className="py-3.5 px-4 text-stone-500">{inv.date}</td>
                  <td className="py-3.5 px-4 font-medium text-stone-800">{inv.plan}</td>
                  <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                    {inv.paymentMethod}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-stone-900">
                    {inv.amountXof.toLocaleString("fr-FR")} XOF
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-400/40 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
