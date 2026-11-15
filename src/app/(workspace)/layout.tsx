"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  UserCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [selectedPropertyId, setSelectedPropertyId] = useState(SEED_PROPERTIES[0].id);
  const [activeUserIndex, setActiveUserIndex] = useState(0); // 0 = Promoteur, 1 = Directeur, 2 = Réceptionniste...

  const activeUser = SEED_USERS[activeUserIndex];
  const activeProperty = SEED_PROPERTIES.find((p) => p.id === selectedPropertyId) || SEED_PROPERTIES[0];

  const navItems = [
    { label: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { label: "PMS & Réception", href: "/pms/reception", icon: Hotel },
    { label: "KDS Cuisine / Bar", href: "/pos/stations", icon: UtensilsCrossed },
    { label: "Traiteur & Matériel", href: "/workspace-catering", icon: Sparkles },
    { label: "Caisse & Folios", href: "/finance/cash", icon: Wallet },
    { label: "Remises & Seuils", href: "/governance/discounts", icon: ShieldAlert },
    { label: "Night Audit", href: "/night-audit", icon: Moon },
    { label: "Rapports & SYSCOHADA", href: "/reports", icon: FileSpreadsheet },
  ];

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
        </div>

        {/* Site Selector */}
        <div className="p-4 border-b border-stone-800 bg-stone-950/40">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" /> Site Actif
          </label>
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
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
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

        {/* Role Switcher (For Demo & Auditing) */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Profil Connecté (Émulation)
          </label>
          <select
            value={activeUserIndex}
            onChange={(e) => setActiveUserIndex(parseInt(e.target.value, 10))}
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
