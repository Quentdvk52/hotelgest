"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
        // Ignore network errors and try localStorage fallback
      }

      // Fallback check from localStorage
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

      // If not authenticated, redirect to staff login
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
        <div className="w-10 h-10 border-4 border-[#7c3c46] border-t-white rounded-full animate-spin mb-4" />
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

  // Filter navigation items by role
  const allNavItems = [
    {
      label: "Vue d'ensemble",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["PROMOTER", "FINANCIAL_DIRECTOR", "PROPERTY_MANAGER"],
    },
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

  const visibleNavItems = allNavItems.filter((item) =>
    item.roles.includes(activeUser.roleCode)
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f7f6]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col border-r border-stone-800">
        {/* Brand */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7c3c46] flex items-center justify-center text-white font-bold text-lg shadow-inner">
              H
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">HotelGest</span>
              <span className="block text-[10px] text-stone-500 font-medium">Le Vignoble PMS</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="text-stone-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Site Selector (Only for group roles or locked to assigned agency) */}
        <div className="p-4 border-b border-stone-800 bg-stone-950/40">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            {activeUser.propertyId ? "Agence Assignée" : "Site Actif (Multi-Sites)"}
          </label>
          {activeUser.propertyId ? (
            <div className="text-xs font-semibold text-white bg-stone-800 border border-stone-700 px-3 py-2 rounded-lg">
              {activeProperty.name} ({activeProperty.code})
            </div>
          ) : (
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#7c3c46]"
            >
              {SEED_PROPERTIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Navigation Items (Filtered by Role) */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
        </nav>

        {/* Role Switcher (For Demo & Fast Role Verification) */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Profil Connecté
          </label>
          <select
            value={SEED_USERS.findIndex((u) => u.email === activeUser.email)}
            onChange={(e) => handleEmulateUser(parseInt(e.target.value, 10))}
            className="w-full bg-stone-800 border border-stone-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
          >
            {SEED_USERS.map((u, idx) => (
              <option key={u.id} value={idx}>
                {u.fullName} ({u.roleName})
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
            <span>Périmètre : {activeUser.propertyId ? activeProperty.code : "Groupe Entier"}</span>
            <span className="text-amber-400 font-bold">Max Remise {activeUser.maxDiscount}%</span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-red-950/50 hover:text-red-300 text-stone-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-stone-700/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
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
            <span className="text-xs bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-md">
              Bénin • XOF
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/order/hg_table_bohicon_tbl01"
              target="_blank"
              className="text-xs text-[#7c3c46] hover:underline font-semibold hidden sm:inline-block"
            >
              Ouvrir Menu QR Client ↗
            </Link>
            <div className="flex items-center gap-2 pl-4 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-[#f5e8e8] text-[#7c3c46] flex items-center justify-center font-bold text-xs">
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
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
