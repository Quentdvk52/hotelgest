"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Hotel,
  DollarSign,
  Users,
  UtensilsCrossed,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building,
  TrendingUp,
  TrendingDown,
  Layers,
  Bed,
  Wine,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Edit2,
  Check,
  X,
  CreditCard,
  Lock,
  ChevronRight,
  FileText,
  Percent,
  Plus,
  Car,
  Package,
} from "lucide-react";
import {
  SEED_PROPERTIES,
  SEED_USERS,
  SEED_ROOM_TYPES,
  SEED_CATERING_MENUS,
  SEED_EQUIPMENT_ITEMS,
} from "@/lib/db/seed";

export default function PromoterDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "COCKPIT" | "PRESTATIONS" | "PRODUITS" | "AGENCES" | "PERSONNEL" | "CHARIOW"
  >("COCKPIT");

  // Selected time filter
  const [timeFilter, setTimeFilter] = useState<"TODAY" | "WEEK" | "MONTH">("TODAY");

  // Multi-site consolidated statistics
  const [siteStats, setSiteStats] = useState([
    {
      id: "prop-bohicon-001",
      code: "BOH",
      city: "Bohicon (Siège)",
      manager: "Aimée Hounsinou",
      totalRooms: 18,
      occupiedRooms: 15,
      occupancyRate: 83,
      todayRevenueXof: 620000,
      activeBookings: 11,
      todayCheckIns: 4,
      todayCheckOuts: 2,
      alert: "Aucune",
      status: "OPTIMAL",
    },
    {
      id: "prop-abomey-002",
      code: "ABM",
      city: "Abomey (Cité Royale)",
      manager: "Sylvain KPOFFON",
      totalRooms: 12,
      occupiedRooms: 9,
      occupancyRate: 75,
      todayRevenueXof: 345000,
      activeBookings: 7,
      todayCheckIns: 2,
      todayCheckOuts: 1,
      alert: "Stock Chablis bas",
      status: "ATTENTION",
    },
    {
      id: "prop-calavi-003",
      code: "ABC",
      city: "Abomey-Calavi (Akassato)",
      manager: "Brice DOSSOU-YOVO",
      totalRooms: 12,
      occupiedRooms: 10,
      occupancyRate: 83,
      todayRevenueXof: 410000,
      activeBookings: 6,
      todayCheckIns: 2,
      todayCheckOuts: 1,
      alert: "Aucune",
      status: "OPTIMAL",
    },
    {
      id: "prop-zogbo-004",
      code: "ZOG",
      city: "Zogbodomey (Relais)",
      manager: "Clarisse ALLAGBE",
      totalRooms: 8,
      occupiedRooms: 5,
      occupancyRate: 63,
      todayRevenueXof: 180000,
      activeBookings: 4,
      todayCheckIns: 0,
      todayCheckOuts: 1,
      alert: "Chambre 104 maintenance",
      status: "ATTENTION",
    },
  ]);

  // Aggregate totals
  const totalRooms = siteStats.reduce((acc, curr) => acc + curr.totalRooms, 0);
  const totalOccupied = siteStats.reduce((acc, curr) => acc + curr.occupiedRooms, 0);
  const globalOccupancy = Math.round((totalOccupied / totalRooms) * 100);
  const totalTodayRevenue = siteStats.reduce((acc, curr) => acc + curr.todayRevenueXof, 0);
  const totalActiveBookings = siteStats.reduce((acc, curr) => acc + curr.activeBookings, 0);
  const totalTodayCheckIns = siteStats.reduce((acc, curr) => acc + curr.todayCheckIns, 0);
  const totalTodayCheckOuts = siteStats.reduce((acc, curr) => acc + curr.todayCheckOuts, 0);

  // Editable Prestations state
  const [roomRates, setRoomRates] = useState([
    { id: "std", name: "Chambre Standard Confort", basePrice: 25000, site: "Tous sites", syscohada: "7011" },
    { id: "sup", name: "Suite Supérieure Exécutive", basePrice: 45000, site: "Bohicon / Abomey / Calavi", syscohada: "7011" },
    { id: "roy", name: "Suite Royale Le Vignoble", basePrice: 85000, site: "Bohicon & Abomey", syscohada: "7011" },
    { id: "shuttle", name: "Navette VIP Aéroport Cotonou", basePrice: 35000, site: "Tous sites", syscohada: "7061" },
    { id: "prado", name: "Location Toyota Prado TXL / Jour", basePrice: 75000, site: "Parc Central", syscohada: "7062" },
  ]);

  // Editable Products state
  const [productsList, setProductsList] = useState([
    { id: "p1", name: "Amiwo au Poulet Bicyclette du Terroir", category: "RESTAURANT", price: 8500, stock: 24, available: true },
    { id: "p2", name: "Djenkoumé Royal & Pintade Braisée", category: "RESTAURANT", price: 9500, stock: 18, available: true },
    { id: "p3", name: "Carpe Braisée du Lac Nokoué", category: "RESTAURANT", price: 7500, stock: 15, available: true },
    { id: "p4", name: "Château Vignoble Réserve Prestige 2018", category: "CAVE_A_VIN", price: 38000, stock: 42, available: true },
    { id: "p5", name: "Champagne Moët & Chandon Brut Impérial", category: "CAVE_A_VIN", price: 65000, stock: 12, available: true },
    { id: "p6", name: "Dom Pérignon Vintage 2013", category: "CAVE_A_VIN", price: 210000, stock: 5, available: true },
    { id: "p7", name: "Cocktail Signature 'Le Vignoble Royal'", category: "BAR", price: 4500, stock: 60, available: true },
    { id: "p8", name: "Nectar Pur Hibiscus & Gingembre 75cl", category: "BOISSON_TERROIR", price: 3500, stock: 35, available: true },
  ]);

  // Price edition inline modal
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<number>(0);

  // Chariow Subscription direct payment trigger
  const [chariowLoading, setChariowLoading] = useState(false);
  const [chariowCheckoutUrl, setChariowCheckoutUrl] = useState<string | null>(null);

  const handleOpenEditPrice = (item: any) => {
    setEditingItem(item);
    setEditPriceInput(item.basePrice || item.price);
  };

  const handleSavePrice = () => {
    if (editingItem.basePrice !== undefined) {
      setRoomRates((prev) =>
        prev.map((r) => (r.id === editingItem.id ? { ...r, basePrice: editPriceInput } : r))
      );
    } else {
      setProductsList((prev) =>
        prev.map((p) => (p.id === editingItem.id ? { ...p, price: editPriceInput } : p))
      );
    }
    setEditingItem(null);
  };

  const handleToggleProduct = (id: string) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );
  };

  const handlePayChariow = async () => {
    setChariowLoading(true);
    try {
      const res = await fetch("/api/creator/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CHECKOUT",
          tenantId: "tenant-vignoble-001",
          planCode: "MONTHLY_100K",
          returnUrl: "/dashboard?renew=success",
        }),
      });
      const data = await res.json();
      if (data.success && data.checkout?.checkoutUrl) {
        setChariowCheckoutUrl(data.checkout.checkoutUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChariowLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Promoter Executive Cockpit Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#184f28]/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl shadow-black/40 border border-white/20 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo-vignoble-transparent.png"
                alt="Logo Hôtel Le Vignoble"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">
                  Direction Générale & Promoteur
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#184f28]/60 text-emerald-300 border border-[#184f28] text-[10px] font-bold uppercase">
                  Multi-Agences Live
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
                Cockpit Décisionnel du Promoteur
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Groupe Hôtelier Le Vignoble • Bohicon • Abomey • Abomey-Calavi • Zogbodomey
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-1 flex items-center text-xs">
              <button
                onClick={() => setTimeFilter("TODAY")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  timeFilter === "TODAY" ? "bg-[#184f28] text-white shadow-sm" : "text-stone-400 hover:text-white"
                }`}
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => setTimeFilter("WEEK")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  timeFilter === "WEEK" ? "bg-[#184f28] text-white shadow-sm" : "text-stone-400 hover:text-white"
                }`}
              >
                7 Jours
              </button>
              <button
                onClick={() => setTimeFilter("MONTH")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  timeFilter === "MONTH" ? "bg-[#184f28] text-white shadow-sm" : "text-stone-400 hover:text-white"
                }`}
              >
                Ce Mois
              </button>
            </div>

            <Link href="/pms/reception">
              <button className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89228] text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
                <Plus className="w-3.5 h-3.5 text-stone-950" />
                <span>Nouvelle Réservation</span>
              </button>
            </Link>

            <Link href="/finance/cash">
              <button className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Caisse Centrale</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-stone-200 pb-2 scrollbar-none">
        {[
          { id: "COCKPIT", label: "Vue Globale & Cockpit", icon: TrendingUp },
          { id: "PRESTATIONS", label: "Prestations & Tarifs", icon: DollarSign },
          { id: "PRODUITS", label: "Produits, Menus & Cave", icon: UtensilsCrossed },
          { id: "AGENCES", label: "Établissements (4 Agences)", icon: Building },
          { id: "PERSONNEL", label: "Personnel & Droits (RBAC)", icon: Users },
          { id: "CHARIOW", label: "Abonnement Logiciel (Chariow)", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/30 scale-[1.02]"
                  : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#d4af37]" : "text-stone-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: COCKPIT VUE GLOBALE & STATISTIQUES
         ========================================================================= */}
      {activeTab === "COCKPIT" && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          {/* Executive 8 KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Occupancy */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Taux d&apos;Occupation Global
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#184f28]/10 text-[#184f28] flex items-center justify-center font-bold">
                  <Hotel className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900">{globalOccupancy}%</span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +5.2% vs S-1
                </span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {totalOccupied} sur {totalRooms} chambres occupées en direct
              </div>
            </div>

            {/* KPI 2: Active Bookings */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Réservations Actives
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900">{totalActiveBookings}</span>
                <span className="text-xs text-stone-400 font-medium">dossiers en cours</span>
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1">
                Bénin direct + Ligne conciergerie VIP
              </div>
            </div>

            {/* KPI 3: Check-ins / Check-outs du jour */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Mouvements du Jour
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-2xl font-black text-emerald-600">+{totalTodayCheckIns}</span>
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">Arrivées</div>
                </div>
                <div className="h-8 w-px bg-stone-200" />
                <div>
                  <span className="text-2xl font-black text-amber-600">-{totalTodayCheckOuts}</span>
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">Libérations</div>
                </div>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                Housekeeping notifié automatiquement
              </div>
            </div>

            {/* KPI 4: CA du jour */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Chiffre d&apos;Affaires Consolidé
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {totalTodayRevenue.toLocaleString("fr-FR")}{" "}
                <span className="text-xs text-stone-500 font-medium">XOF</span>
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ventilé sur les 4 agences</span>
              </div>
            </div>
          </div>

          {/* Secondary Financial Row: Dépenses, Marge, Trésorerie, KkiaPay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Dépenses d&apos;Exploitation (Mois)
              </span>
              <div className="text-xl font-bold text-red-400">
                1 920 000 <span className="text-xs text-stone-400 font-medium">XOF</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Marché vivres, pressing, gasoil groupe</p>
            </div>

            <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Marge Nette Consolidée
              </span>
              <div className="text-xl font-bold text-emerald-400">
                +60.4% <span className="text-xs text-stone-400 font-medium">(Mois en cours)</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Rentabilité opérationnelle brute</p>
            </div>

            <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Trésorerie & Comptes Bancaires
              </span>
              <div className="text-xl font-bold text-[#d4af37]">
                12 450 000 <span className="text-xs text-stone-400 font-medium">XOF</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">BOA Bénin + Caisses centrales</p>
            </div>

            <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Encaissements KkiaPay (En Ligne)
              </span>
              <div className="text-xl font-bold text-teal-400">
                58% <span className="text-xs text-stone-400 font-medium">des réservations</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Mobile Money MTN / Moov / Celtiis</p>
            </div>
          </div>

          {/* Interactive Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: 7-Days Revenue Evolution */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Évolution des Recettes Hebdomadaires (XOF)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Consolidation multi-sites des 7 derniers jours (Lundi à Dimanche)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-[#184f28]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#184f28]" /> Hébergements
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#8c101c]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8c101c]" /> Resto & Cave
                  </span>
                </div>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="h-64 w-full pt-4">
                <svg viewBox="0 0 700 220" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f1f1" strokeDasharray="3 3" />
                  <line x1="40" y1="70" x2="680" y2="70" stroke="#f1f1f1" strokeDasharray="3 3" />
                  <line x1="40" y1="120" x2="680" y2="120" stroke="#f1f1f1" strokeDasharray="3 3" />
                  <line x1="40" y1="170" x2="680" y2="170" stroke="#f1f1f1" strokeDasharray="3 3" />

                  {/* Y Axis labels */}
                  <text x="5" y="25" fill="#a8a29e" fontSize="10">2.0M</text>
                  <text x="5" y="75" fill="#a8a29e" fontSize="10">1.5M</text>
                  <text x="5" y="125" fill="#a8a29e" fontSize="10">1.0M</text>
                  <text x="5" y="175" fill="#a8a29e" fontSize="10">0.5M</text>

                  {/* 7 Days Bars */}
                  {[
                    { day: "Lun", h: 95, r: 40, x: 80, val: "1.35M" },
                    { day: "Mar", h: 110, r: 45, x: 170, val: "1.55M" },
                    { day: "Mer", h: 100, r: 50, x: 260, val: "1.50M" },
                    { day: "Jeu", h: 130, r: 60, x: 350, val: "1.90M" },
                    { day: "Ven", h: 155, r: 75, x: 440, val: "2.30M" },
                    { day: "Sam", h: 165, r: 80, x: 530, val: "2.45M" },
                    { day: "Dim", h: 140, r: 70, x: 620, val: "2.10M" },
                  ].map((bar, i) => (
                    <g key={i}>
                      {/* Bar Hébergement (Green) */}
                      <rect
                        x={bar.x - 18}
                        y={170 - bar.h}
                        width="16"
                        height={bar.h}
                        rx="4"
                        fill="#184f28"
                        className="transition-all hover:opacity-85 cursor-pointer"
                      />
                      {/* Bar Resto & Cave (Wine red) */}
                      <rect
                        x={bar.x + 2}
                        y={170 - bar.r}
                        width="16"
                        height={bar.r}
                        rx="4"
                        fill="#8c101c"
                        className="transition-all hover:opacity-85 cursor-pointer"
                      />
                      {/* Day Label */}
                      <text
                        x={bar.x}
                        y="195"
                        textAnchor="middle"
                        fill="#57534e"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {bar.day}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Chart 2: Revenue Breakdown by Department */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  Répartition par Pôle d&apos;Activité
                </h3>
                <p className="text-xs text-stone-500">
                  Ventilation du chiffre d&apos;affaires consolidé
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {[
                  { label: "Hébergements & Suites", pct: 48, amount: "746 000 XOF", color: "bg-[#184f28]" },
                  { label: "Restaurant & Gastronomie", pct: 24, amount: "373 000 XOF", color: "bg-[#8c101c]" },
                  { label: "Cave à Vin & Champagnes", pct: 14, amount: "217 000 XOF", color: "bg-[#d4af37]" },
                  { label: "Service Traiteur & Matériel", pct: 9, amount: "140 000 XOF", color: "bg-purple-600" },
                  { label: "Location Véhicules VIP", pct: 5, amount: "78 000 XOF", color: "bg-blue-600" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-700">{item.label}</span>
                      <span className="text-stone-900">{item.pct}% ({item.amount})</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Règlements KkiaPay + Espèces + Cartes</span>
                <span className="font-bold text-emerald-600">100% Réconcilié</span>
              </div>
            </div>
          </div>

          {/* Detailed Multi-Site Table */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Statistiques Comparatives des 4 Établissements
                </h3>
                <p className="text-xs text-stone-500">
                  Contrôle direct de l&apos;occupation, des réservations et des alertes opérationnelles.
                </p>
              </div>
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualiser les flux</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 uppercase tracking-wider text-[11px] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Gérant de Site</th>
                    <th className="py-3 px-4">Chambres Occupées</th>
                    <th className="py-3 px-4">Taux d&apos;Occupation</th>
                    <th className="py-3 px-4">CA du Jour</th>
                    <th className="py-3 px-4">Mouvements (Arr/Dép)</th>
                    <th className="py-3 px-4">Statut & Alertes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {siteStats.map((site) => (
                    <tr key={site.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 text-[10px] font-mono font-bold">
                            {site.code}
                          </span>
                          <span>{site.city}</span>
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {site.totalRooms} chambres au total
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-stone-800">
                        {site.manager}
                      </td>
                      <td className="py-4 px-4 font-bold text-stone-900">
                        {site.occupiedRooms} / {site.totalRooms}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-stone-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#184f28] h-full rounded-full"
                              style={{ width: `${site.occupancyRate}%` }}
                            />
                          </div>
                          <span className="font-bold text-stone-800">{site.occupancyRate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#184f28] text-sm">
                        {site.todayRevenueXof.toLocaleString("fr-FR")} XOF
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-emerald-700 font-semibold">+{site.todayCheckIns} arr.</span>
                        <span className="text-stone-300 mx-1">/</span>
                        <span className="text-amber-700 font-semibold">-{site.todayCheckOuts} lib.</span>
                      </td>
                      <td className="py-4 px-4">
                        {site.status === "OPTIMAL" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> {site.alert}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> {site.alert}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stocks & Supplies Quick Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Cave à Vins & Champagnes
                </span>
                <Wine className="w-4 h-4 text-[#8c101c]" />
              </div>
              <div className="text-2xl font-black text-stone-900">148 Bouteilles</div>
              <p className="text-xs text-stone-500">
                12 Moët & Chandon, 42 Château Vignoble, 5 Dom Pérignon en stock climatisé.
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-amber-700 font-medium">
                <span>Alerte réassort Chablis</span>
                <span>3 restant</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Matériel Événementiel
                </span>
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-stone-900">450 Chaises Napoléon</div>
              <p className="text-xs text-stone-500">
                300 déployées sur réceptions Bohicon et Calavi. 150 disponibles au dépôt.
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                <span>Caution de retour à 100%</span>
                <span>0 casse signalée</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Cuisine & Approvisionnements
                </span>
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900">Approvisionné</div>
              <p className="text-xs text-stone-500">
                Volailles locales bicyclette, carpes fraîches et condiments du marché central.
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600 font-medium">
                <span>Prochaine livraison marché</span>
                <span>Demain 06h00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PRESTATIONS & TARIFS
         ========================================================================= */}
      {activeTab === "PRESTATIONS" && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Gestion des Prestations & Grille Tarifaire du Groupe
              </h3>
              <p className="text-xs text-stone-500">
                Modifiez en direct les prix des chambres, navettes, forfaits traiteur et locations de véhicules.
              </p>
            </div>
            <button
              onClick={() => alert("Formulaire d'ajout de nouvelle prestation")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une Prestation</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 uppercase tracking-wider text-[11px] text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Prestation / Service</th>
                  <th className="py-3 px-4">Sites Couverts</th>
                  <th className="py-3 px-4">Compte SYSCOHADA</th>
                  <th className="py-3 px-4">Tarif Public Actuel</th>
                  <th className="py-3 px-4 text-right">Actions Promoteur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {roomRates.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-stone-900 text-sm">
                      {item.name}
                    </td>
                    <td className="py-4 px-4 text-stone-500 font-medium">{item.site}</td>
                    <td className="py-4 px-4 font-mono text-stone-500">
                      Compte {item.syscohada}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-[#184f28] text-sm">
                      {item.basePrice.toLocaleString("fr-FR")} XOF
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenEditPrice(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#184f28] hover:text-white text-stone-700 text-xs font-semibold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier Tarif</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PRODUITS, MENUS & CAVE A VIN
         ========================================================================= */}
      {activeTab === "PRODUITS" && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Catalogue Restaurant, Bar & Cave à Vin
              </h3>
              <p className="text-xs text-stone-500">
                Gérez la disponibilité immédiate et les prix de vente des plats, boissons et grands crus.
              </p>
            </div>
            <button
              onClick={() => alert("Formulaire d'ajout de nouveau produit")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un Produit</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 uppercase tracking-wider text-[11px] text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Désignation Produit</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Stock Restant</th>
                  <th className="py-3 px-4">Prix de Vente</th>
                  <th className="py-3 px-4">Disponibilité</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {productsList.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-stone-900 text-sm">
                      {prod.name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold text-[10px]">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-800">
                      {prod.stock} unités
                    </td>
                    <td className="py-4 px-4 font-extrabold text-[#8c101c] text-sm">
                      {prod.price.toLocaleString("fr-FR")} XOF
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          prod.available
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {prod.available ? "✓ En Vente" : "✗ Épuisé"}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenEditPrice(prod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: AGENCES & ETABLISSEMENTS (MULTI-SITES)
         ========================================================================= */}
      {activeTab === "AGENCES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 duration-200">
          {SEED_PROPERTIES.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4 hover:border-[#184f28] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#184f28]/10 text-[#184f28]">
                    {prop.code}
                  </span>
                  <h4 className="text-lg font-bold font-serif text-stone-900 mt-2">
                    {prop.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">{prop.address}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Opérationnel
                </span>
              </div>

              <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-stone-400">Téléphone Réception :</span>
                  <span className="font-semibold text-stone-900">{prop.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Email Officiel :</span>
                  <span className="font-semibold text-stone-900">{prop.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Chambres en service :</span>
                  <span className="font-bold text-[#184f28]">12 à 18 chambres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Équipements :</span>
                  <span>Restaurant, Bar, Climatisation, Wi-Fi</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Link href="/pms/reception" className="flex-1">
                  <button className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors">
                    Planning Chambres
                  </button>
                </Link>
                <Link href="/pos/stations" className="flex-1">
                  <button className="w-full py-2 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold transition-colors">
                    KDS Cuisine / Bar
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          TAB 5: PERSONNEL & DROITS (RBAC)
         ========================================================================= */}
      {activeTab === "PERSONNEL" && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Matrice du Personnel & Gestion des Droits (20 Comptes)
              </h3>
              <p className="text-xs text-stone-500">
                Consultez les attributions, les agences d&apos;affectation et les plafonds de remise accordés aux collaborateurs.
              </p>
            </div>
            <div className="text-xs font-semibold text-stone-500">
              Isolation stricte multi-sites activée
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 uppercase tracking-wider text-[11px] text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Collaborateur</th>
                  <th className="py-3 px-4">Identifiant Email</th>
                  <th className="py-3 px-4">Rôle Attribué</th>
                  <th className="py-3 px-4">Plafond Remise</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {SEED_USERS.map((usr) => (
                  <tr key={usr.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {usr.fullName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-500 text-[11px]">
                      {usr.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-semibold text-[10px]">
                        {usr.roleName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#184f28]">
                      {usr.maxDiscount}% max
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: ABONNEMENT LOGICIEL (CHARIOW)
         ========================================================================= */}
      {activeTab === "CHARIOW" && (
        <div className="max-w-3xl mx-auto bg-stone-900 text-white rounded-3xl border border-stone-800 p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200 shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                CH
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-white">
                  Abonnement Logiciel HotelGest
                </h3>
                <p className="text-xs text-stone-400">
                  Géré et prélevé de manière sécurisée via <strong>Chariow</strong> pour l&apos;éditeur de la plateforme.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" /> Licence Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Formule Souscrite
              </span>
              <div className="text-lg font-bold text-white">HotelGest Enterprise Multi-Sites</div>
              <p className="text-xs text-stone-400">
                Couvre les 4 établissements (Bohicon, Abomey, Calavi, Zogbodomey), utilisateurs illimités.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Montant Périodique
              </span>
              <div className="text-2xl font-black text-[#d4af37]">
                100 000 <span className="text-xs text-stone-400 font-medium">XOF / mois</span>
              </div>
              <p className="text-xs text-stone-400">
                Prochaine échéance le 15 du mois prochain via Chariow.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 text-xs space-y-2">
            <div className="flex justify-between text-stone-400">
              <span>Bénéficiaire :</span>
              <span className="font-semibold text-white">Éditeur & Créateur HotelGest</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Moyens acceptés par Chariow :</span>
              <span className="font-semibold text-blue-400">MTN MoMo, Moov Flooz, Carte Bancaire</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Dernier règlement validé :</span>
              <span className="font-mono text-emerald-400">chariow_inv_live_884920 (100 000 XOF)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePayChariow}
              disabled={chariowLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {chariowLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Renouveler / Payer l&apos;Abonnement via Chariow (100 000 XOF)</span>
                </>
              )}
            </button>
          </div>

          {chariowCheckoutUrl && (
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800 text-xs space-y-2 animate-in fade-in duration-200">
              <span className="font-bold text-blue-300 block">
                Session de paiement Chariow générée :
              </span>
              <a
                href={chariowCheckoutUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-white underline font-mono text-[11px] break-all"
              >
                <span>{chariowCheckoutUrl}</span>
                <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Modal Edition Tarif Inline */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Modifier le Tarif de la Prestation
            </h3>
            <p className="text-xs text-stone-500 mb-4">{editingItem.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nouveau Tarif Public (XOF)
                </label>
                <input
                  type="number"
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:border-[#184f28]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSavePrice}
                  className="flex-1 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
