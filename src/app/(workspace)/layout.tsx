"use client";

import React, { useState, useEffect, Suspense } from "react";
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
} from "lucide-react";

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

  const isPromoter = activeUser.roleCode === "PROMOTER" || activeUser.roleCode === "FINANCIAL_DIRECTOR";

  // Promoter specific direct management commands
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
      label: "Chambres",
      href: "/dashboard?view=chambres",
      view: "chambres",
      icon: Bed,
      badge: "4",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Cave à Vin & Stocks",
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
      badge: "5",
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
      label: "Personnel",
      href: "/dashboard?view=personnel",
      view: "personnel",
      icon: Users,
      badge: "20",
      badgeColor: "bg-stone-800 text-stone-300",
    },
    {
      label: "Trésorerie & Comptes",
      href: "/dashboard?view=tresorerie",
      view: "tresorerie",
      icon: Wallet,
    },
    {
      label: "Abonnement Logiciel",
      href: "/dashboard?view=abonnement",
      view: "abonnement",
      icon: ShieldCheck,
    },
  ];

  // Standard operational modules
  const operationalModules = [
    {
      label: "PMS & Réception",
      href: "/pms/reception",
      icon: Hotel,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER", "RECEPTIONIST", "HOUSEKEEPING"],
    },
    {
      label: "KDS Cuisine / Bar",
      href: "/pos/stations",
      icon: UtensilsCrossed,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER", "CHEF", "BARTENDER", "WAITSTAFF"],
    },
    {
      label: "Traiteur & Matériel",
      href: "/workspace-catering",
      icon: Sparkles,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER", "CATERING_MANAGER", "RECEPTIONIST"],
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

  const visibleOperational = operationalModules.filter((m) =>
    m.roles.includes(activeUser.roleCode)
  );

  return (
    <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
      {/* Promoter Space Commands Section */}
      {isPromoter && (
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
            Commandes du Promoteur
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

  const handleEmulateUser = (userIndex: number) => {
    const selected = SEED_USERS[userIndex];
    if (selected) {
      const updatedUser: UserProfile = {
        id: selected.id,
        email: selected.email,
        fullName: selected.fullName,
        roleCode: selected.roleCode,
        roleName: selected.roleName,
        propertyId: selected.propertyId,
        maxDiscount: selected.maxDiscount,
        permissions: [],
      };
      setCurrentUser(updatedUser);
      if (selected.propertyId) {
        setSelectedPropertyId(selected.propertyId);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("hotelgest_user", JSON.stringify(updatedUser));
      }
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

        {/* Site Selector */}
        <div className="p-3 border-b border-stone-850 bg-stone-900/60">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            {activeUser.propertyId ? "Agence Assignée" : "Site Actif"}
          </label>
          {activeUser.propertyId ? (
            <div className="text-xs font-semibold text-white bg-stone-850 border border-stone-800 px-3 py-1.5 rounded-lg truncate">
              {activeProperty.name} ({activeProperty.code})
            </div>
          ) : (
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full bg-stone-850 border border-stone-800 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#184f28]"
            >
              {SEED_PROPERTIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Navigation Items in Suspense for SearchParams */}
        <Suspense fallback={<div className="p-4 text-xs text-stone-500">Chargement menu...</div>}>
          <SidebarNavContent activeUser={activeUser} activeProperty={activeProperty} />
        </Suspense>

        {/* Quick Role Emulator & Logout */}
        <div className="p-3 border-t border-stone-850 bg-stone-900/80">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Profil Connecté
          </label>
          <select
            value={SEED_USERS.findIndex((u) => u.email === activeUser.email)}
            onChange={(e) => handleEmulateUser(parseInt(e.target.value, 10))}
            className="w-full bg-stone-850 border border-stone-800 text-white text-[11px] rounded-lg px-2 py-1.5 focus:outline-none truncate"
          >
            {SEED_USERS.map((u, idx) => (
              <option key={u.id} value={idx}>
                {u.fullName} ({u.roleName})
              </option>
            ))}
          </select>
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

          <div className="flex items-center gap-4">
            <Link
              href="/order/hg_table_bohicon_tbl01"
              target="_blank"
              className="text-xs text-[#184f28] hover:underline font-semibold hidden sm:inline-block"
            >
              Ouvrir Menu QR Client ↗
            </Link>
            <div className="flex items-center gap-2 pl-4 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-[#184f28]/10 text-[#184f28] flex items-center justify-center font-bold text-xs">
                {activeUser.fullName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-stone-900">{activeUser.fullName}</div>
                <div className="text-[10px] text-stone-500 font-medium">{activeUser.roleName}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1 font-medium ml-2"
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
    </div>
  );
}
