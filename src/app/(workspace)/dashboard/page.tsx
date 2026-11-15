"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Hotel,
  DollarSign,
  Users,
  UtensilsCrossed,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function WorkspaceDashboard() {
  const [stats, setStats] = useState({
    occupancyRate: 67,
    occupiedRooms: 4,
    totalRooms: 6,
    dailyRevenueXof: 145000,
    pendingOrdersCount: 2,
    activeCateringEvents: 1,
    cashDrawerStatus: "OPEN",
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Tableau de Bord Quotidien</h1>
          <p className="text-xs text-stone-500 mt-1">
            Indicateurs d&apos;exploitation en temps réel — Hôtel Le Vignoble
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pms/reception">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Hotel className="w-4 h-4" /> Nouvelle Arrivée
            </Button>
          </Link>
          <Link href="/night-audit">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Clock className="w-4 h-4" /> Clôture de Nuit
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Occupation Chambres</span>
            <div className="w-8 h-8 rounded-lg bg-[#f5e8e8] text-[#7c3c46] flex items-center justify-center">
              <Hotel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{stats.occupancyRate}%</div>
          <div className="text-xs text-stone-500 mt-1">
            {stats.occupiedRooms} sur {stats.totalRooms} chambres occupées
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Chiffre d&apos;Affaires Jour</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {stats.dailyRevenueXof.toLocaleString("fr-FR")} <span className="text-xs text-stone-500 font-medium">XOF</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Hébergement + Restauration
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Commandes KDS en Cours</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{stats.pendingOrdersCount}</div>
          <div className="text-xs text-amber-700 font-medium mt-1">
            En préparation Cuisine / Bar
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Traiteur & Événements</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{stats.activeCateringEvents}</div>
          <div className="text-xs text-stone-500 mt-1">
            Manifestation confirmée pour ce soir
          </div>
        </Card>
      </div>

      {/* Main Operational Modules Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent activity & quick links */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Flux Opérationnels du Jour</span>
                <Badge variant="gold">Temps Réel</Badge>
              </CardTitle>
              <CardDescription>
                Dernières opérations saisies sur le site actif.
              </CardDescription>
            </CardHeader>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">Check-in Effectué — Chambre 101</div>
                    <div className="text-stone-500">Client : M. Dossou Mathieu • Folio ouvert</div>
                  </div>
                </div>
                <span className="text-stone-400">Il y a 15 min</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    QR
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">Nouvelle commande QR — Table 2</div>
                    <div className="text-stone-500">2x Amiwo Poulet, 2x Cocktails Vignoble • Ticket Cuisine & Bar généré</div>
                  </div>
                </div>
                <span className="text-stone-400">Il y a 28 min</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    TR
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">Devis Traiteur & Matériel Validé</div>
                    <div className="text-stone-500">50 chaises Napoléon + Buffet Prestige Béninois (TRT-001)</div>
                  </div>
                </div>
                <span className="text-stone-400">Il y a 1h</span>
              </div>
            </div>
          </Card>

          {/* Quick Modules Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/pms/reception" className="block">
              <Card className="hover:border-[#7c3c46] transition-colors p-5">
                <h4 className="font-bold text-stone-900 text-sm flex items-center justify-between">
                  <span>Planning des Chambres</span>
                  <ArrowUpRight className="w-4 h-4 text-stone-400" />
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Attribuer une chambre, faire un check-in/out, vérifier l&apos;état housekeeping.
                </p>
              </Card>
            </Link>

            <Link href="/pos/stations" className="block">
              <Card className="hover:border-[#7c3c46] transition-colors p-5">
                <h4 className="font-bold text-stone-900 text-sm flex items-center justify-between">
                  <span>Console Stations (KDS)</span>
                  <ArrowUpRight className="w-4 h-4 text-stone-400" />
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Écrans de préparation séparés pour Cuisine, Bar et Cave à Vin.
                </p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right col: Cash & Security status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> État de Caisse & Sécurité
              </CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-stone-500">Session de caisse :</span>
                <Badge variant="success">Ouverte (Fonds : 50 000 XOF)</Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-stone-500">Clôture journalière (Audit) :</span>
                <span className="font-semibold text-stone-800">Prévue à 23h30</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-stone-500">Journal SYSCOHADA :</span>
                <Badge variant="info">Équilibré (D=C)</Badge>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-stone-500">Abonnement Chariow :</span>
                <Badge variant="gold">Actif (Plan Semestriel)</Badge>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 space-y-2">
              <Link href="/finance/cash" className="block">
                <Button variant="secondary" size="sm" className="w-full">
                  Gérer la Session de Caisse
                </Button>
              </Link>
              <Link href="/reports" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Exporter Écritures SYSCOHADA
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
