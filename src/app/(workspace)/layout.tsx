"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SEED_PROPERTIES, SEED_USERS } from "@/lib/db/seed";
import {
  LayoutDashboard,
  Hotel,
  UtensilsCrossed,
  Sparkles,
  Wallet,
  ShieldAlert,
  Moon,
  FileSpreadsheet,
  Building2,
  LogOut,
  UserCheck,
  Bed,
  Wine,
  Car,
  Users,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Megaphone,
  Clock,
  Key,
  Camera,
  Phone,
  Shield,
  Mail,
  User,
  CheckCircle2,
  X,
  ShoppingCart,
  CalendarCheck,
  ArrowLeftRight,
  Star,
  Eye,
  EyeOff,
  Boxes,
  Upload,
  Layers,
  Scale,
  FileText,
  Receipt,
  Coffee,
  Utensils,
  BookOpen,
  QrCode,
  Send,
} from "lucide-react";
import { NotificationBell } from "@/components/workspace/notification-bell";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  roleCode: string;
  roleName: string;
  propertyId: string | null;
  maxDiscount: string;
  permissions: string[];
}

function SidebarNavContent({
  activeUser,
  activeProperty,
}: {
  activeUser: UserProfile;
  activeProperty: any;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get("view") || "cockpit").toLowerCase();
  const currentTab = (searchParams.get("tab") || "dashboard").toLowerCase();

  const isPromoter = activeUser.roleCode === "PROMOTER" || activeUser.roleCode === "FINANCIAL_DIRECTOR";
  const isManager = activeUser.roleCode === "PROPERTY_MANAGER";
  const isWaitstaff = activeUser.roleCode === "WAITSTAFF";
  const isBartender = activeUser.roleCode === "BARTENDER";
  const isChef = activeUser.roleCode === "CHEF";
  const isBohiconManager = activeUser.propertyId === "prop-bohicon-001";

  // Bartender specific direct commands (6 tabs DébitMaster Gérant / Comptoir)
  const bartenderCommands = [
    {
      label: "KDS File Boissons",
      href: "/pos/stations?tab=kds_bar",
      tab: "kds_bar",
      icon: Coffee,
      badge: "KDS Bar",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      label: "Validation Caisse Serveuses",
      href: "/pos/stations?tab=remittances",
      tab: "remittances",
      icon: Receipt,
      badge: "Points",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Stock Bar & Cave",
      href: "/pos/stations?tab=stock",
      tab: "stock",
      icon: Boxes,
      badge: "Comptoir",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Demandes Réassort",
      href: "/pos/stations?tab=demande",
      tab: "demande",
      icon: Send,
      badge: "Appro",
      badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    },
    {
      label: "Plan Tables & Salle",
      href: "/pos/stations?tab=plan",
      tab: "plan",
      icon: LayoutDashboard,
      badge: "Synoptique",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Horaires & Permanence",
      href: "/pos/stations?tab=team",
      tab: "team",
      icon: Clock,
      badge: "Équipe",
      badgeColor: "bg-stone-800 text-stone-300",
    },
  ];

  // Chef Cuisine specific direct commands (5 tabs DébitMaster MealKitchenClient)
  const chefCommands = [
    {
      label: "KDS File Cuisine",
      href: "/pos/stations?tab=kds_cuisine",
      tab: "kds_cuisine",
      icon: Utensils,
      badge: "KDS Repas",
      badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    },
    {
      label: "Brigade & Affectations",
      href: "/pos/stations?tab=assignments",
      tab: "assignments",
      icon: Users,
      badge: "Cuisiniers",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      label: "Stocks Vivres & Ingrédients",
      href: "/pos/stations?tab=stock_vivres",
      tab: "stock_vivres",
      icon: Boxes,
      badge: "Vivres",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Fiches Recettes & Carte",
      href: "/pos/stations?tab=recipes",
      tab: "recipes",
      icon: BookOpen,
      badge: "Technique",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Brigade & Permanence",
      href: "/pos/stations?tab=team_cuisine",
      tab: "team_cuisine",
      icon: Clock,
      badge: "Planning",
      badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    },
  ];

  // Waitstaff specific direct commands (6 tabs)
  const waitstaffCommands = [
    {
      label: "Tableau de bord",
      href: "/pos/stations?tab=dashboard",
      tab: "dashboard",
      icon: LayoutDashboard,
      badge: "Shift",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Prendre commande",
      href: "/pos/stations?tab=orders",
      tab: "orders",
      icon: ShoppingCart,
      badge: "Tactile",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      label: "Encaissements & Livraisons",
      href: "/pos/stations?tab=encaissement",
      tab: "encaissement",
      icon: Receipt,
      badge: "2",
      badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    },
    {
      label: "Mon Point Caisse",
      href: "/pos/stations?tab=remittance",
      tab: "remittance",
      icon: Wallet,
      badge: "Sacoche",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Horaires & Permanence",
      href: "/pos/stations?tab=permanence",
      tab: "permanence",
      icon: Clock,
      badge: "Planning",
      badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    },
    {
      label: "Mes Notations Clients",
      href: "/pos/stations?tab=notations",
      tab: "notations",
      icon: Star,
      badge: "Avis",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
  ];

  // Promoter & DAF specific direct management commands
  const promoterCommands = [
    {
      label: "Vue d'ensemble",
      href: "/dashboard?view=cockpit",
      view: "cockpit",
      icon: LayoutDashboard,
      badge: "KPIs",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Qr Code et plan de site",
      href: "/dashboard?view=qrcodes",
      view: "qrcodes",
      icon: QrCode,
      badge: "Sites & QR",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Commandes",
      href: "/dashboard?view=commandes",
      view: "commandes",
      icon: ShoppingCart,
      badge: "Flux",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    {
      label: "Fichier Clients",
      href: "/dashboard?view=clients",
      view: "clients",
      icon: Users,
      badge: "Multi-Sites",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Chambres",
      href: "/dashboard?view=chambres",
      view: "chambres",
      icon: Bed,
      badge: "4",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Stocks Multi-Sites",
      href: "/dashboard?view=stocks",
      view: "stocks",
      icon: Boxes,
      badge: "Global",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Cave à Vin & Boutique",
      href: "/dashboard?view=cave",
      view: "cave",
      icon: Wine,
      badge: "6",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Repas & Carte",
      href: "/dashboard?view=repas",
      view: "repas",
      icon: UtensilsCrossed,
      badge: "5",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Location",
      href: "/dashboard?view=location",
      view: "location",
      icon: Car,
      badge: "9",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Service Traiteur",
      href: "/dashboard?view=traiteur",
      view: "traiteur",
      icon: Sparkles,
      badge: "3",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Évènements & RDV",
      href: "/dashboard?view=events",
      view: "events",
      icon: CalendarCheck,
      badge: "Agenda",
      badgeColor: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    },
    {
      label: "Personnel",
      href: "/dashboard?view=personnel",
      view: "personnel",
      icon: Users,
      badge: "20",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Mutation du personnel",
      href: "/dashboard?view=mutations",
      view: "mutations",
      icon: ArrowLeftRight,
      badge: "DAF/Promoteur",
      badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    },
    {
      label: "Rôles et Attributs",
      href: "/dashboard?view=roles",
      view: "roles",
      icon: ShieldCheck,
      badge: "Droits",
      badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    },
    {
      label: "Notation du personnel",
      href: "/dashboard?view=notations",
      view: "notations",
      icon: Star,
      badge: "Avis",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      label: "Permanence & Présence",
      href: "/dashboard?view=presence",
      view: "presence",
      icon: Clock,
      badge: "Direct",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      label: "Trésorerie & Comptes",
      href: "/dashboard?view=tresorerie",
      view: "tresorerie",
      icon: Wallet,
    },
    {
      label: "Documents Légaux",
      href: "/dashboard?view=legal",
      view: "legal",
      icon: Scale,
      badge: "Conformité",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      label: "Abonnement Logiciel",
      href: "/dashboard?view=abonnement",
      view: "abonnement",
      icon: ShieldCheck,
    },
  ];

  // Property Manager (Gérant d'établissement) specific management commands
  const managerCommands = [
    {
      label: "Vue d'ensemble",
      href: "/dashboard?view=cockpit",
      view: "cockpit",
      icon: LayoutDashboard,
      badge: "Mon Site",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Commandes du Site",
      href: "/dashboard?view=commandes",
      view: "commandes",
      icon: ShoppingCart,
      badge: "Direct",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    {
      label: "Clients de l'Agence",
      href: "/dashboard?view=clients",
      view: "clients",
      icon: Users,
      badge: "Mon Agence",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Chambres du Site",
      href: "/dashboard?view=chambres",
      view: "chambres",
      icon: Bed,
      badge: "Édition",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    ...(isBohiconManager
      ? [
          {
            label: "Cave à Vin & Stocks",
            href: "/dashboard?view=cave",
            view: "cave",
            icon: Wine,
            badge: "Boutique",
            badgeColor: "bg-[#8c101c]/20 text-[#d4af37] border border-[#8c101c]/30",
          },
        ]
      : []),
    {
      label: "Repas & Carte",
      href: "/dashboard?view=repas",
      view: "repas",
      icon: UtensilsCrossed,
      badge: "Création",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Personnel du Site",
      href: "/dashboard?view=personnel",
      view: "personnel",
      icon: Users,
      badge: "Équipe",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Permanence & Présence",
      href: "/dashboard?view=presence",
      view: "presence",
      icon: Clock,
      badge: "Planning",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    {
      label: "Évènements du Site",
      href: "/dashboard?view=events",
      view: "events",
      icon: CalendarCheck,
      badge: "Agenda",
      badgeColor: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    },
    {
      label: "Notation du personnel",
      href: "/dashboard?view=notations",
      view: "notations",
      icon: Star,
      badge: "Avis",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
  ];

  // Standard operational modules
  const operationalModules = [
    {
      label: "Messagerie Interne",
      href: "/messaging",
      icon: MessageSquare,
      roles: [
        "PROMOTER",
        "FINANCIAL_DIRECTOR",
        "PROPERTY_MANAGER",
        "RECEPTIONIST",
        "HOUSEKEEPING",
        "CHEF",
        "BARTENDER",
        "WAITSTAFF",
        "CATERING_MANAGER",
        "CASHIER",
        "ACCOUNTANT",
        "AUDITOR",
      ],
    },
    {
      label: "Annonces Officielles",
      href: "/announcements",
      icon: Megaphone,
      roles: [
        "PROMOTER",
        "FINANCIAL_DIRECTOR",
        "PROPERTY_MANAGER",
        "RECEPTIONIST",
        "HOUSEKEEPING",
        "CHEF",
        "BARTENDER",
        "WAITSTAFF",
        "CATERING_MANAGER",
        "CASHIER",
        "ACCOUNTANT",
        "AUDITOR",
      ],
    },
    {
      label: "Permanence & Présence",
      href: "/dashboard?view=presence",
      icon: Clock,
      roles: [
        "PROMOTER",
        "FINANCIAL_DIRECTOR",
        "PROPERTY_MANAGER",
        "RECEPTIONIST",
        "HOUSEKEEPING",
        "CHEF",
        "BARTENDER",
        "WAITSTAFF",
        "CATERING_MANAGER",
        "CASHIER",
        "ACCOUNTANT",
        "AUDITOR",
      ],
    },
    {
      label:
        activeUser.roleCode === "RECEPTIONIST"
          ? "Disponibilité & Chambres"
          : activeUser.roleCode === "PROPERTY_MANAGER"
          ? "Disponibilité & Salles"
          : "PMS & Disponibilité",
      href: "/pms/reception",
      icon: activeUser.roleCode === "RECEPTIONIST" ? Bed : Hotel,
      badge:
        activeUser.roleCode === "RECEPTIONIST"
          ? "Mon Agence"
          : activeUser.roleCode === "PROPERTY_MANAGER"
          ? "Mon Site"
          : "Chambres",
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER", "RECEPTIONIST", "HOUSEKEEPING"],
    },
    {
      label:
        activeUser.roleCode === "WAITSTAFF"
          ? "Prise de Commandes & Bar/Resto"
          : activeUser.roleCode === "CHEF"
          ? "Station Cuisine KDS"
          : activeUser.roleCode === "BARTENDER"
          ? "Station Bar KDS"
          : activeUser.roleCode === "HOUSEKEEPING"
          ? "Livraisons Room-Service & Salles"
          : "KDS Cuisine / Bar / Service",
      href: "/pos/stations",
      icon: UtensilsCrossed,
      badge:
        activeUser.roleCode === "WAITSTAFF"
          ? "Serveur"
          : activeUser.roleCode === "CHEF"
          ? "Cuisine"
          : activeUser.roleCode === "BARTENDER"
          ? "Barman"
          : activeUser.roleCode === "HOUSEKEEPING"
          ? "Valet"
          : "Service",
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER", "CHEF", "BARTENDER", "WAITSTAFF", "HOUSEKEEPING"],
    },
    {
      label: "Traiteur & Matériel",
      href: "/workspace-catering",
      icon: Sparkles,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER", "CATERING_MANAGER"],
    },
    {
      label: "Caisse & Folios",
      href: "/finance/cash",
      icon: Wallet,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER", "CASHIER", "ACCOUNTANT", "RECEPTIONIST"],
    },
    {
      label: "Remises & Seuils",
      href: "/governance/discounts",
      icon: ShieldAlert,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER"],
    },
    {
      label: "Night Audit",
      href: "/night-audit",
      icon: Moon,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER", "ACCOUNTANT"],
    },
    {
      label: "Rapports & SYSCOHADA",
      href: "/reports",
      icon: FileSpreadsheet,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "ACCOUNTANT", "AUDITOR"],
    },
  ];

  const visibleOperational = operationalModules.filter((m) => {
    if (
      (isWaitstaff || isBartender || isChef) &&
      (m.href === "/pos/stations" || m.href === "/dashboard?view=presence")
    ) {
      return false; // Already present in their direct commands
    }
    return m.roles.includes(activeUser.roleCode);
  });

  return (
    <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
      {/* Waitstaff Space Commands Section */}
      {isWaitstaff && (
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
            <span>Service en Salle & Buvette</span>
            <span className="text-[9px] text-stone-500 font-mono">Shift Actif</span>
          </div>
          {waitstaffCommands.map((item) => {
            const Icon = item.icon;
            const active = pathname === "/pos/stations" && currentTab === item.tab;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/30 font-bold"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? "text-[#d4af37]" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      active ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Bartender Space Commands Section */}
      {isBartender && (
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
            <span>Barman & Comptoir DébitMaster</span>
            <span className="text-[9px] text-stone-500 font-mono">Boissons</span>
          </div>
          {bartenderCommands.map((item) => {
            const Icon = item.icon;
            const active = pathname === "/pos/stations" && currentTab === item.tab;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/30 font-bold"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? "text-[#d4af37]" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      active ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Chef Cuisine Space Commands Section */}
      {isChef && (
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
            <span>Chef Cuisine DébitMaster</span>
            <span className="text-[9px] text-stone-500 font-mono">Brigade</span>
          </div>
          {chefCommands.map((item) => {
            const Icon = item.icon;
            const active = pathname === "/pos/stations" && currentTab === item.tab;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/30 font-bold"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? "text-[#d4af37]" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      active ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Promoter Space Commands Section */}
      {isPromoter && (
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
            Commandes du Promoteur & DAF
          </div>
          {promoterCommands.map((item) => {
            const Icon = item.icon;
            const active = pathname === "/dashboard" && currentView === item.view;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/30 font-bold"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? "text-[#d4af37]" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      active ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Property Manager Space Commands Section */}
      {isManager && (
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Gestion du Site ({activeProperty?.name?.replace("Hôtel Le Vignoble - ", "") || "Établissement"})
          </div>
          {managerCommands.map((item) => {
            const Icon = item.icon;
            const active = pathname === "/dashboard" && currentView === item.view;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/30 font-bold"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? "text-[#d4af37]" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      active ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Operational Modules Section */}
      <div className="space-y-1 pt-2 border-t border-stone-800/80">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          {isPromoter ? "Exploitation & Terrain" : "Modules Opérationnels"}
        </div>
        {visibleOperational.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-[#7c3c46] text-white shadow-sm"
                  : "text-stone-400 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-amber-300" : "text-stone-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState(SEED_PROPERTIES[0].id);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Profile Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    avatarUrl: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch unread messages periodically
  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/messaging/conversations");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setUnreadMessagesCount(json.unreadMessagesCount || 0);
          }
        }
      } catch {
        // Ignore
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  // Load session from API / localStorage
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            if (data.user.propertyId) {
              setSelectedPropertyId(data.user.propertyId);
            }
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to localStorage
      }

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hotelgest_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCurrentUser(parsed);
            if (parsed.propertyId) {
              setSelectedPropertyId(parsed.propertyId);
            }
            setLoading(false);
            return;
          } catch {
            localStorage.removeItem("hotelgest_user");
          }
        }
      }

      router.push("/staff/login");
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("hotelgest_user");
    }
    router.push("/staff/login");
  };

  const openProfileModal = () => {
    setProfileForm({
      fullName: (activeUser && activeUser.fullName) || "",
      phone: ((activeUser as any)?.phone) || "",
      avatarUrl: ((activeUser as any)?.avatarUrl) || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg("");
    setProfileSuccessMsg("");

    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 6) {
        setProfileErrorMsg("Le nouveau mot de passe doit comporter au moins 6 caractères.");
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileErrorMsg("La confirmation du mot de passe ne correspond pas.");
        return;
      }
    }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profileForm.fullName,
          phone: profileForm.phone,
          avatarUrl: profileForm.avatarUrl,
          newPassword: profileForm.newPassword || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentUser((prev: any) => ({ ...prev, ...json.user }));
        if (typeof window !== "undefined") {
          localStorage.setItem("hotelgest_user", JSON.stringify({ ...activeUser, ...json.user }));
        }
        setProfileSuccessMsg(json.message || "Profil mis à jour avec succès !");
        setTimeout(() => {
          setProfileModalOpen(false);
          setProfileSuccessMsg("");
        }, 1200);
      } else {
        setProfileErrorMsg(json.error || "Erreur de mise à jour");
      }
    } catch {
      setProfileErrorMsg("Erreur de connexion au serveur");
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-[#184f28] border-t-white rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-stone-400">Chargement de votre espace de travail...</p>
      </div>
    );
  }

  const activeUser = currentUser || {
    id: "user-prom-01",
    email: "gnacadjaeddy@gmail.com",
    fullName: "Eddy GNACADJA",
    roleCode: "PROMOTER",
    roleName: "Promoteur",
    propertyId: null,
    maxDiscount: "100",
    permissions: [],
  };

  const activeProperty =
    SEED_PROPERTIES.find((p) => p.id === selectedPropertyId) || SEED_PROPERTIES[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f7f6]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-950 text-stone-300 flex flex-col border-r border-stone-850">
        {/* Brand */}
        <div className="p-4 border-b border-stone-850 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
              <img
                src="/logo-vignoble-transparent.png"
                alt="Hotel Le Vignoble"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight block">HotelGest</span>
              <span className="block text-[10px] text-[#d4af37] font-semibold uppercase tracking-wider">
                Le Vignoble • Groupe
              </span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="text-stone-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-stone-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Display (Promoter/DAF: Multi-Sites Global scope, Staff: assigned agency) */}
        <div className="p-3 border-b border-stone-850 bg-stone-900/60">
          {activeUser.propertyId ? (
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Agence Assignée
              </label>
              <div className="text-xs font-semibold text-white bg-stone-850 border border-stone-800 px-3 py-1.5 rounded-lg truncate">
                {activeProperty.name} ({activeProperty.code})
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#d4af37]" /> Périmètre Groupe
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Multi-Sites (4 Agences)
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items in Suspense for SearchParams */}
        <Suspense fallback={<div className="p-4 text-xs text-stone-500">Chargement menu...</div>}>
          <SidebarNavContent activeUser={activeUser} activeProperty={activeProperty} />
        </Suspense>

        {/* Authenticated User Profile (Strictly personal & locked) */}
        <div className="p-3 border-t border-stone-850 bg-stone-900/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Compte Personnel
            </span>
            <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono font-semibold">
              Connecté
            </span>
          </div>
          <div className="bg-stone-850 border border-stone-800 rounded-lg p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#184f28] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
              {activeUser.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{activeUser.fullName}</div>
              <div className="text-[10px] text-stone-400 truncate">{activeUser.roleName}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-stone-400 hover:text-red-400 hover:bg-stone-850 border border-stone-800/60 hover:border-red-950/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <span className="font-bold text-stone-900">{activeProperty.name}</span>
            <span className="text-stone-300">/</span>
            <span className="text-xs bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-md">
              Bénin • XOF
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Messagerie Interne Icon with Red Unread Badge */}
            <Link
              href="/messaging"
              className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none"
              title="Messagerie interne du personnel"
              aria-label="Messagerie interne"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-black text-white bg-red-600 rounded-full px-1 shadow-xs animate-pulse border-2 border-white">
                  {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                </span>
              )}
            </Link>

            {/* Notification Center Bell with Red Badge */}
            <NotificationBell />

            {/* Interactive Profile Button for All Users */}
            <button
              onClick={openProfileModal}
              className="flex items-center gap-2 pl-3 border-l border-stone-200 text-left hover:bg-stone-50 py-1.5 px-2 rounded-xl transition-colors cursor-pointer group"
              title="Gérer mon profil, mot de passe et avatar"
            >
              <div className="w-8 h-8 rounded-full bg-[#184f28]/10 text-[#184f28] group-hover:bg-[#184f28] group-hover:text-white flex items-center justify-center font-bold text-xs overflow-hidden transition-colors shrink-0 shadow-xs border border-stone-200">
                {(activeUser as any)?.avatarUrl ? (
                  <img
                    src={(activeUser as any).avatarUrl}
                    alt={activeUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  activeUser.fullName.charAt(0)
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-stone-900 group-hover:text-[#184f28] transition-colors">
                  {activeUser.fullName}
                </div>
                <div className="text-[10px] text-stone-500 font-medium">
                  {activeUser.roleName}
                </div>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1 font-medium ml-1 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Profile Management Modal (For Everyone) */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#184f28]/10 text-[#184f28] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Gestion de Mon Profil</h3>
                  <p className="text-[11px] text-stone-500">Avatar, coordonnées et sécurité du mot de passe</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                <X className="w-4 h-4 text-red-600 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Avatar Section */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#184f28] text-white flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 shadow-md border-2 border-white">
                  {profileForm.avatarUrl ? (
                    <img
                      src={profileForm.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    activeUser.fullName.charAt(0)
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-stone-700 text-xs">
                      Photo de Profil / Avatar
                    </label>
                    {profileForm.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, avatarUrl: "" })}
                        className="text-[10px] text-red-600 hover:underline font-semibold"
                      >
                        Retirer la photo
                      </button>
                    )}
                  </div>

                  {/* Hidden native file input for camera & file picker */}
                  <input
                    type="file"
                    ref={avatarFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setProfileErrorMsg("L'image dépasse 5 Mo. Veuillez choisir une photo plus légère.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setProfileForm((prev) => ({ ...prev, avatarUrl: base64 }));
                          setProfileSuccessMsg("Photo chargée depuis votre appareil ! Cliquez sur 'Enregistrer mon profil' pour l'appliquer.");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {/* Upload button for mobile & computer */}
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#184f28]" />
                    <span>Téléverser depuis mon téléphone ou ordinateur</span>
                  </button>

                  <div className="relative">
                    <input
                      type="url"
                      value={profileForm.avatarUrl.startsWith("data:image") ? "[Photo chargée depuis votre appareil]" : profileForm.avatarUrl}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, avatarUrl: e.target.value })
                      }
                      placeholder="Ou collez une URL d'image (ex: https://...)"
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] text-stone-600 focus:outline-none focus:border-[#184f28]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 block">
                    Prenez une photo en direct avec votre smartphone ou importez une image depuis votre ordinateur.
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Informations Personnelles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Nom & Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-[#184f28]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      placeholder="+229 97 00 00 00"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-[#184f28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Adresse Email (Identifiant de connexion)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={activeUser.email}
                    className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Role & Property Attributions */}
              <div className="p-3.5 bg-stone-100/70 rounded-2xl border border-stone-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-stone-500">
                    Rôle Attribué
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#184f28] text-white font-bold text-[10px]">
                    {activeUser.roleName} ({activeUser.roleCode})
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600 text-[11px]">
                  <span>Site / Établissement :</span>
                  <span className="font-semibold text-stone-900">
                    {activeUser.propertyId
                      ? `${activeProperty.name} (${activeProperty.code})`
                      : "Direction Générale Groupe (Tous les sites)"}
                  </span>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" /> Modifier mon Mot de Passe
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Nouveau Mot de Passe
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={profileForm.newPassword}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, newPassword: e.target.value })
                        }
                        placeholder="Min. 6 caractères"
                        className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:border-[#184f28]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
                        aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Confirmer le Mot de Passe
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={profileForm.confirmPassword}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, confirmPassword: e.target.value })
                        }
                        placeholder="Répétez le mot de passe"
                        className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:border-[#184f28]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
                        aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 block">
                  Laissez vide si vous ne souhaitez pas modifier votre mot de passe actuel.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2 bg-[#184f28] hover:bg-[#1f6634] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-[#184f28]/20 transition-all"
                  >
                    {profileSaving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
