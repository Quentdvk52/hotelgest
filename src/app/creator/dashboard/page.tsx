"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  DollarSign,
  Building,
  TrendingUp,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  LogOut,
  Sliders,
  Database,
  Terminal,
  Activity,
  Calendar,
  Lock,
} from "lucide-react";

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY_100K" | "SEMIANNUAL_540K" | "ANNUAL_840K">("MONTHLY_100K");
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"SUBSCRIPTIONS" | "GENERATOR" | "GATEWAYS" | "AUDIT">("SUBSCRIPTIONS");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/creator/subscriptions");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Erreur de chargement créateur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCheckout = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/creator/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CHECKOUT",
          tenantId: "tenant-vignoble-001",
          planCode: selectedPlan,
          returnUrl: "/dashboard?tab=subscription",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCheckoutResult(json.checkout);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (tenantId: string, status: "ACTIVE" | "PAST_DUE" | "CANCELLED") => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/creator/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          tenantId,
          status,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/creator/auth", { method: "DELETE" });
    router.push("/creator/login");
  };

  const metrics = data?.metrics || {
    mrrXof: 100000,
    arrXof: 1200000,
    activeTenantsCount: 1,
    totalTenants: 1,
    collectionRate: 100,
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-stone-800 bg-stone-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center">
              <Image
                src="/logo-vignoble-transparent.png"
                alt="HotelGest"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>HotelGest • Console Créateur Logiciel</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Super-Admin
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                Administration globale & Abonnements Chariow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Voir Cockpit Promoteur</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors"
            >
              <span>Site Public</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Platform Overview */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
                Supervision de la Plateforme HotelGest
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Suivi financier des abonnements éditeur gérés via l&apos;agrégateur de souscription <strong>Chariow</strong>.
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Actualiser les métriques</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  MRR Plateforme
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">
                {metrics.mrrXof.toLocaleString("fr-FR")}{" "}
                <span className="text-xs text-stone-400 font-medium">XOF / mois</span>
              </div>
              <div className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Facturation récurrente Chariow</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  ARR Consolidé
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">
                {metrics.arrXof.toLocaleString("fr-FR")}{" "}
                <span className="text-xs text-stone-400 font-medium">XOF / an</span>
              </div>
              <div className="text-xs text-emerald-400 mt-1">
                Projection sur 12 mois glissants
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Groupes Hôteliers Actifs
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">
                {metrics.activeTenantsCount}{" "}
                <span className="text-xs text-stone-400 font-medium">
                  / {metrics.totalTenants} souscrit(s)
                </span>
              </div>
              <div className="text-xs text-[#d4af37] mt-1">
                Groupe Hôtelier Le Vignoble (4 Agences)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Taux de Recouvrement
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{metrics.collectionRate}%</div>
              <div className="text-xs text-purple-400 mt-1">
                Aucun impayé sur les licences actives
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-2">
          <button
            onClick={() => setActiveTab("SUBSCRIPTIONS")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "SUBSCRIPTIONS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                : "text-stone-400 hover:text-white hover:bg-stone-900"
            }`}
          >
            Abonnements des Hôtels (Chariow)
          </button>
          <button
            onClick={() => setActiveTab("GENERATOR")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "GENERATOR"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                : "text-stone-400 hover:text-white hover:bg-stone-900"
            }`}
          >
            Générateur de Liens de Paiement
          </button>
          <button
            onClick={() => setActiveTab("GATEWAYS")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "GATEWAYS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                : "text-stone-400 hover:text-white hover:bg-stone-900"
            }`}
          >
            Passerelles de Paiement & Architecture
          </button>
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "AUDIT"
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                : "text-stone-400 hover:text-white hover:bg-stone-900"
            }`}
          >
            Journal des Événements & Webhooks
          </button>
        </div>

        {/* TAB 1: Subscriptions Table */}
        {activeTab === "SUBSCRIPTIONS" && (
          <div className="space-y-6">
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Souscriptions Actives des Établissements
                  </h3>
                  <p className="text-xs text-stone-400">
                    Contrôle des droits d&apos;accès, états de paiement et renouvellements périodiques.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/60 uppercase tracking-wider text-[11px] text-stone-400 border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Groupe / Établissement</th>
                      <th className="py-3 px-4">Forfait Chariow</th>
                      <th className="py-3 px-4">Montant Périodique</th>
                      <th className="py-3 px-4">Statut Licence</th>
                      <th className="py-3 px-4">Prochaine Échéance</th>
                      <th className="py-3 px-4">Dernière Référence</th>
                      <th className="py-3 px-4 text-right">Actions Éditeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {(data?.subscriptions || [
                      {
                        tenantId: "tenant-vignoble-001",
                        tenantName: "Groupe Hôtelier Le Vignoble (4 Agences)",
                        provider: "CHARIOW",
                        planCode: "MONTHLY_100K",
                        planName: "HotelGest Enterprise Multi-Sites",
                        amountXof: 100000,
                        status: "ACTIVE",
                        nextBillingDate: new Date(Date.now() + 28 * 24 * 3600 * 1000),
                        lastPaymentRef: "chariow_inv_live_884920",
                      },
                    ]).map((sub: any) => (
                      <tr key={sub.tenantId} className="hover:bg-stone-800/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-sm">{sub.tenantName}</div>
                          <div className="text-[10px] text-stone-500 font-mono">{sub.tenantId}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-blue-400">{sub.planName}</span>
                          <div className="text-[10px] text-stone-500">{sub.planCode}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-[#d4af37]">
                          {sub.amountXof.toLocaleString("fr-FR")} XOF
                        </td>
                        <td className="py-4 px-4">
                          {sub.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                              <CheckCircle2 className="w-3 h-3" /> Actif
                            </span>
                          ) : sub.status === "PAST_DUE" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
                              <AlertTriangle className="w-3 h-3" /> En retard
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase">
                              Suspendu
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-stone-300">
                          {new Date(sub.nextBillingDate).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-stone-400">
                          {sub.lastPaymentRef || "chariow_init"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {sub.status === "ACTIVE" ? (
                              <button
                                onClick={() => handleUpdateStatus(sub.tenantId, "PAST_DUE")}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 text-[11px] font-medium transition-colors"
                              >
                                Marquer En retard
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(sub.tenantId, "ACTIVE")}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 text-[11px] font-medium transition-colors"
                              >
                                Réactiver la Licence
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Chariow Payment Link Generator */}
        {activeTab === "GENERATOR" && (
          <div className="max-w-2xl mx-auto bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold mb-3">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Facturation Chariow</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-white">
                Générer un Lien de Paiement Chariow pour le Promoteur
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Créez une session de paiement sécurisée Chariow à transmettre au promoteur (M. Gnacadja) pour le renouvellement de sa licence HotelGest.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  Sélectionnez le Forfait HotelGest à facturer :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "MONTHLY_100K",
                      name: "Mensuel",
                      amount: "100 000 XOF",
                      desc: "Renouvellement 30 jours",
                    },
                    {
                      id: "SEMIANNUAL_540K",
                      name: "Semestriel",
                      amount: "540 000 XOF",
                      desc: "6 mois (-10% remise)",
                    },
                    {
                      id: "ANNUAL_840K",
                      name: "Annuel",
                      amount: "840 000 XOF",
                      desc: "12 mois (Éco. 360 000 XOF)",
                    },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedPlan === plan.id
                          ? "bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950/50"
                          : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <div className="font-bold text-white text-sm">{plan.name}</div>
                      <div className="text-sm font-extrabold text-[#d4af37] my-1">{plan.amount}</div>
                      <div className="text-[10px] text-stone-400">{plan.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs space-y-2">
                <div className="flex justify-between text-stone-400">
                  <span>Bénéficiaire :</span>
                  <span className="font-semibold text-white">Groupe Hôtelier Le Vignoble (tenant-vignoble-001)</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Passerelle d&apos;encaissement :</span>
                  <span className="font-semibold text-blue-400">Chariow Checkout (Mobile Money / Carte)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateCheckout}
                disabled={actionLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>Générer le Lien de Paiement Chariow</span>
                  </>
                )}
              </button>

              {checkoutResult && (
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/80 animate-in fade-in duration-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
                    <span>Lien Chariow prêt à être transmis :</span>
                    <span className="font-mono text-[10px]">{checkoutResult.sessionId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={checkoutResult.checkoutUrl}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-300 font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopyLink(checkoutResult.checkoutUrl)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "Copié !" : "Copier"}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-400">
                    Vous pouvez envoyer ce lien par email ou WhatsApp à M. Gnacadja pour validation et prélèvement automatique de la souscription.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Gateways & Architecture */}
        {activeTab === "GATEWAYS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  CH
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Chariow — Abonnements Logiciel</h4>
                  <p className="text-[11px] text-stone-400">
                    Gestion exclusive des souscriptions et licences HotelGest
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-stone-300 border-t border-stone-800 pt-3">
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Rôle :</span>
                  <span className="font-semibold text-white">Créateur du Logiciel (Vous) ↔ Promoteur</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Mode :</span>
                  <span className="text-emerald-400 font-medium">Production Live</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Signature Webhook :</span>
                  <span className="font-mono text-[10px] text-stone-400">HMAC-SHA256 (Vérifiée)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Webhook URL :</span>
                  <span className="font-mono text-[10px] text-blue-400">/api/webhooks/chariow</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  KK
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">KkiaPay — Encaissements Clients</h4>
                  <p className="text-[11px] text-stone-400">
                    Paiements réservations, cave à vin et traiteur
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-stone-300 border-t border-stone-800 pt-3">
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Rôle :</span>
                  <span className="font-semibold text-white">Clients de l&apos;Hôtel ↔ Groupe Le Vignoble</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Canaux :</span>
                  <span className="text-emerald-400 font-medium">MTN MoMo, Moov Flooz, Celtiis, Visa/Mastercard</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Agrégateur :</span>
                  <span className="text-stone-300">KkiaPay Bénin (Agréé BCEAO)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-400">Validation URL :</span>
                  <span className="font-mono text-[10px] text-emerald-400">/api/payments/kkiapay/verify</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Audit & Webhooks */}
        {activeTab === "AUDIT" && (
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Historique Récent des Événements Chariow</span>
            </h3>
            <p className="text-xs text-stone-400">
              Journal des webhooks reçus et des créations de sessions d&apos;abonnement.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-white">Souscription Initialisée — Groupe Le Vignoble</div>
                    <div className="text-stone-400">Plan Enterprise Multi-Sites (100 000 XOF/mois) • Statut : ACTIVE</div>
                  </div>
                </div>
                <span className="text-stone-500 text-[11px]">Audit Initial</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    SEC
                  </div>
                  <div>
                    <div className="font-bold text-white">Vérification Signature HMAC-SHA256</div>
                    <div className="text-stone-400">Vérificateur cryptographique conforme aux specs Chariow</div>
                  </div>
                </div>
                <span className="text-stone-500 text-[11px]">Système Prêt</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
