"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Coffee,
  Wine,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Check,
  AlertCircle,
  TrendingUp,
  Receipt,
  Wallet,
  CalendarCheck,
  Users,
  LayoutDashboard,
  Boxes,
  Plus,
  Send,
  Bed,
  ArrowRight,
  Filter,
  DollarSign,
  PackageCheck,
  RefreshCw,
  Bell,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  WaitstaffActiveOrder,
  ServerCashRemittance,
  BarmanStockItem,
  ReplenishmentRequest,
  WaitstaffTable,
} from "@/modules/pos/waitstaff-types";
import {
  getWaitstaffOrders,
  getAllServerRemittances,
  confirmServerRemittance,
  getBarmanStockItems,
  updateBarmanStockItem,
  getReplenishmentRequests,
  submitReplenishmentRequest,
  receiveStockTransfer,
  getWaitstaffTables,
  advanceOrderItemStatus,
} from "@/modules/pos/waitstaff-service";

interface BarmanServiceConsoleProps {
  activeUser: any;
}

export function BarmanServiceConsole({ activeUser }: BarmanServiceConsoleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab from query param or default to kds_bar
  const tabParam = searchParams.get("tab") || "kds_bar";
  const [activeTab, setActiveTab] = useState<string>(
    ["kds_bar", "remittances", "stock", "demande", "plan", "team"].includes(tabParam)
      ? tabParam
      : "kds_bar"
  );

  useEffect(() => {
    if (tabParam && ["kds_bar", "remittances", "stock", "demande", "plan", "team"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const setConsoleTab = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/pos/stations?tab=${tab}`);
  };

  const propertyId = activeUser?.propertyId || "prop-bohicon-001";
  const propertyName = activeUser?.propertyName || "Hôtel Le Vignoble - Bohicon (BOH)";
  const barmanName = activeUser?.fullName || "Pascal Agbossou (Gérant Bar)";

  // Live State
  const [orders, setOrders] = useState<WaitstaffActiveOrder[]>([]);
  const [remittances, setRemittances] = useState<ServerCashRemittance[]>([]);
  const [stocks, setStocks] = useState<BarmanStockItem[]>([]);
  const [replenishmentRequests, setReplenishmentRequests] = useState<ReplenishmentRequest[]>([]);
  const [tables, setTables] = useState<WaitstaffTable[]>([]);

  // UI Filters
  const [kdsDestinationFilter, setKdsDestinationFilter] = useState<string>("ALL");
  const [kdsSearch, setKdsSearch] = useState<string>("");
  const [stockDisplayMode, setStockDisplayMode] = useState<"QUANTITY" | "VALUE_XOF">("QUANTITY");
  const [stockSearch, setStockSearch] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);

  // Remittance Modal Validation State
  const [selectedRemittance, setSelectedRemittance] = useState<ServerCashRemittance | null>(null);
  const [receivedCashInput, setReceivedCashInput] = useState<string>("");
  const [remittanceArbitrageNote, setRemittanceArbitrageNote] = useState<string>("");

  // New Replenishment Request State
  const [newReqProductName, setNewReqProductName] = useState<string>("");
  const [newReqQuantity, setNewReqQuantity] = useState<string>("5");
  const [newReqUnit, setNewReqUnit] = useState<string>("Casiers de 12");
  const [newReqReason, setNewReqReason] = useState<string>("");

  // Table Assignment State
  const [selectedTableForAssign, setSelectedTableForAssign] = useState<string>("");
  const [selectedWaitstaffForAssign, setSelectedWaitstaffForAssign] = useState<string>("user-srv-boh");

  // Load and refresh data
  const refreshData = () => {
    const rawOrders = getWaitstaffOrders("all", propertyId);
    setOrders([...rawOrders]);
    setRemittances([...getAllServerRemittances(propertyId)]);
    setStocks([...getBarmanStockItems(propertyId)]);
    setReplenishmentRequests([...getReplenishmentRequests(propertyId)]);
    setTables([...getWaitstaffTables(propertyId)]);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [propertyId]);

  // Flash Notice Helper
  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 6000);
  };

  // 1. BEVERAGE ITEMS FOR KDS (Bar + Cave)
  const beverageItemsList = useMemo(() => {
    const list: {
      orderId: string;
      orderNumber: string;
      itemId: string;
      productName: string;
      quantity: number;
      station: "BAR" | "CAVE";
      destination: string;
      destinationType: "TABLE" | "CHAMBRE" | "SALLE";
      waitstaffName: string;
      status: string;
      createdAt: string;
      notes?: string;
    }[] = [];

    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.targetStationCode === "BAR" || item.targetStationCode === "CAVE") {
          const isChambre = o.tableLabel.toLowerCase().includes("chambre") || o.tableLabel.toLowerCase().includes("suite");
          const isSalle = o.tableLabel.toLowerCase().includes("salle");
          const destinationType = isChambre ? "CHAMBRE" : isSalle ? "SALLE" : "TABLE";

          list.push({
            orderId: o.id,
            orderNumber: o.orderNumber,
            itemId: item.id,
            productName: item.productName,
            quantity: item.quantity,
            station: item.targetStationCode,
            destination: o.tableLabel,
            destinationType,
            waitstaffName: o.waitstaffName,
            status: item.preparationStatus,
            createdAt: o.createdAt,
            notes: o.notes,
          });
        }
      });
    });

    return list.filter((item) => {
      if (kdsDestinationFilter !== "ALL") {
        if (kdsDestinationFilter === "TABLE" && item.destinationType !== "TABLE") return false;
        if (kdsDestinationFilter === "CHAMBRE" && item.destinationType !== "CHAMBRE") return false;
        if (kdsDestinationFilter === "SALLE" && item.destinationType !== "SALLE") return false;
      }
      if (kdsSearch.trim()) {
        const q = kdsSearch.toLowerCase();
        return (
          item.productName.toLowerCase().includes(q) ||
          item.orderNumber.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q) ||
          item.waitstaffName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, kdsDestinationFilter, kdsSearch]);

  // Group beverage items into 4 KDS columns
  const kdsColumns = useMemo(() => {
    return {
      PENDING: beverageItemsList.filter((i) => i.status === "PENDING"),
      IN_PREPARATION: beverageItemsList.filter((i) => i.status === "IN_PREPARATION"),
      READY: beverageItemsList.filter((i) => i.status === "READY"),
      HANDED_OFF: beverageItemsList.filter((i) => i.status === "HANDED_OFF" || i.status === "DELIVERED"),
    };
  }, [beverageItemsList]);

  // Advance Beverage Status
  const handleAdvanceBeverageStatus = (orderId: string, itemId: string, nextStatus: any) => {
    advanceOrderItemStatus(orderId, itemId, nextStatus);
    refreshData();
    if (nextStatus === "READY") {
      triggerNotice("✓ Boisson marquée PRÊTE au comptoir ! Alerte envoyée à la serveuse.");
    } else if (nextStatus === "HANDED_OFF") {
      triggerNotice("✓ Boisson remise au service (serveuse / valet de chambre).");
    } else {
      triggerNotice("✓ Préparation prise en charge au bar.");
    }
  };

  // Remittance Validation Actions
  const handleOpenRemittanceModal = (rem: ServerCashRemittance) => {
    setSelectedRemittance(rem);
    setReceivedCashInput(rem.declaredCashXof.toString());
    setRemittanceArbitrageNote("");
  };

  const handleConfirmRemittance = () => {
    if (!selectedRemittance) return;
    const receivedCash = parseFloat(receivedCashInput) || 0;
    confirmServerRemittance({
      remittanceId: selectedRemittance.id,
      receivedCashXof: receivedCash,
      confirmedBy: barmanName,
      note: remittanceArbitrageNote || undefined,
    });
    setSelectedRemittance(null);
    refreshData();
    triggerNotice(`✓ Reversement de ${selectedRemittance.waitstaffName} validé avec succès.`);
  };

  // Stock Actions
  const handleReceiveStockTransfer = (stockId: string, qty: number) => {
    updateBarmanStockItem(stockId, qty);
    refreshData();
    triggerNotice(`✓ Réception de stock validée (+${qty} unités au comptoir).`);
  };

  const handleDeclareBreakage = (stockId: string) => {
    const qty = prompt("Nombre d'unités de perte / casse à imputer :", "1");
    if (qty && Number(qty) > 0) {
      updateBarmanStockItem(stockId, -Number(qty));
      refreshData();
      triggerNotice(`⚠ Perte / casse de ${qty} unité(s) enregistrée.`);
    }
  };

  // Replenishment Submit
  const handleCreateReplenishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqProductName.trim()) {
      alert("Veuillez sélectionner ou saisir un produit.");
      return;
    }
    submitReplenishmentRequest({
      propertyId,
      destinationStation: "BAR",
      requestedBy: barmanName,
      items: [
        {
          productName: newReqProductName.trim(),
          quantity: Number(newReqQuantity) || 1,
          unit: newReqUnit,
          reason: newReqReason || "Seuil d'alerte bar atteint",
        },
      ],
      notes: "Demande formulée depuis le comptoir bar.",
    });
    setNewReqProductName("");
    setNewReqQuantity("5");
    setNewReqReason("");
    refreshData();
    triggerNotice("✓ Bon d'approvisionnement transmis pour visa au Promoteur / DAF.");
  };

  // Table Occupancy stats
  const occupiedTablesCount = tables.filter((t) => t.status === "OCCUPIED").length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedTablesCount / tables.length) * 100) : 0;

  // Render
  return (
    <div className="space-y-6">
      {/* Top Banner: Gérant Bar & Comptoir */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              Gérant d&apos;Exploitation Bar & Comptoir
            </span>
            <span className="text-stone-400 text-xs font-mono">
              Modèle DébitMaster • {propertyName}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Console Barman & Comptoir Boissons
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl">
            Préparation KDS en temps réel des boissons, validation des points de caisse des serveuses, contrôle des stocks du bar et de la cave à vin.
          </p>
        </div>

        {/* Quick Shift Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Responsable au Poste</span>
            <span className="text-sm font-bold text-white font-mono">{barmanName}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="h-10 px-3 rounded-2xl border-stone-700 bg-stone-800/80 text-stone-200 hover:bg-stone-700 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold">Actualiser</span>
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-sm font-bold">
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs (Vertical in Sidebar, Quick Bar on Desktop) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200">
        {[
          { key: "kds_bar", label: "File KDS Boissons", icon: Coffee, badge: beverageItemsList.filter((i) => i.status !== "HANDED_OFF" && i.status !== "DELIVERED").length },
          { key: "remittances", label: "Validation Caisse Serveuses", icon: Receipt, badge: remittances.filter((r) => r.status === "SUBMITTED").length },
          { key: "stock", label: "Stock Bar & Cave", icon: Boxes, badge: stocks.filter((s) => s.currentStockUnits <= s.alertThreshold).length },
          { key: "demande", label: "Demandes Réassort", icon: Send, badge: replenishmentRequests.filter((r) => r.status === "PENDING_APPROVAL").length },
          { key: "plan", label: "Plan des Tables", icon: LayoutDashboard, badge: `${occupancyRate}%` },
          { key: "team", label: "Horaires & Permanence", icon: Users },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setConsoleTab(t.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/25"
                  : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/70"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#d4af37]" : "text-stone-400"}`} />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-700 border border-stone-200"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: FILE KDS BOISSONS (4 COLONNES DÉBITMASTER TACTILES)
      ========================================================================== */}
      {activeTab === "kds_bar" && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Search */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-bold text-stone-500 whitespace-nowrap flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Destination :
              </span>
              {[
                { key: "ALL", label: "Toutes destinations" },
                { key: "TABLE", label: "Tables Salle / Terrasse" },
                { key: "CHAMBRE", label: "Chambres (Room Service)" },
                { key: "SALLE", label: "Salles Séminaires" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setKdsDestinationFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    kdsDestinationFilter === filter.key
                      ? "bg-[#184f28] text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <Input
                type="text"
                placeholder="Rechercher boisson, table, commande..."
                value={kdsSearch}
                onChange={(e) => setKdsSearch(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          {/* 4 KDS Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Column 1: À préparer (PENDING) */}
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    1. À Préparer
                  </span>
                </div>
                <Badge variant="warning">{kdsColumns.PENDING.length}</Badge>
              </div>

              <div className="space-y-3">
                {kdsColumns.PENDING.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6 font-mono">Aucune boisson en attente.</p>
                ) : (
                  kdsColumns.PENDING.map((item) => (
                    <Card key={`${item.orderId}-${item.itemId}`} className="p-4 border border-amber-200 bg-white shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                          {item.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 font-mono">
                          {item.station === "CAVE" ? "Cave à vin" : "Bar"}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-stone-900 flex items-center justify-between">
                          <span>{item.quantity}x {item.productName}</span>
                        </div>
                        <div className="text-xs text-[#184f28] font-bold mt-1">
                          ★ Pour : {item.destination} ({item.destinationType})
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Lancé par : {item.waitstaffName}
                        </div>
                        {item.notes && <div className="text-[11px] text-amber-800 italic mt-1">Note : {item.notes}</div>}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAdvanceBeverageStatus(item.orderId, item.itemId, "IN_PREPARATION")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5"
                      >
                        <span>Prendre en charge →</span>
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: En préparation au bar (IN_PREPARATION) */}
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    2. Au Bar / Verres
                  </span>
                </div>
                <Badge variant="info">{kdsColumns.IN_PREPARATION.length}</Badge>
              </div>

              <div className="space-y-3">
                {kdsColumns.IN_PREPARATION.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6 font-mono">Aucun verre en cours de dressage.</p>
                ) : (
                  kdsColumns.IN_PREPARATION.map((item) => (
                    <Card key={`${item.orderId}-${item.itemId}`} className="p-4 border-2 border-blue-300 bg-white shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                          {item.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 font-mono">En cours de service</span>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          {item.quantity}x {item.productName}
                        </div>
                        <div className="text-xs text-[#184f28] font-bold mt-1">
                          ★ Pour : {item.destination}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Serveuse : {item.waitstaffName}
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAdvanceBeverageStatus(item.orderId, item.itemId, "READY")}
                        className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>MARQUER PRÊT ✓</span>
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Prêtes au comptoir (READY) */}
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    3. Prêtes au Comptoir
                  </span>
                </div>
                <Badge variant="success">{kdsColumns.READY.length}</Badge>
              </div>

              <div className="space-y-3">
                {kdsColumns.READY.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6 font-mono">Comptoir dégagé.</p>
                ) : (
                  kdsColumns.READY.map((item) => (
                    <Card key={`${item.orderId}-${item.itemId}`} className="p-4 border-2 border-emerald-400 bg-emerald-50/30 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                          {item.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">Alerte envoyée</span>
                      </div>

                      <div>
                        <div className="text-sm font-black text-stone-900">
                          {item.quantity}x {item.productName}
                        </div>
                        <div className="text-xs text-[#184f28] font-bold mt-1">
                          ★ Table/Chambre : {item.destination}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          En attente de prise par : <strong>{item.waitstaffName}</strong>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAdvanceBeverageStatus(item.orderId, item.itemId, "HANDED_OFF")}
                        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs h-9 rounded-xl gap-1.5"
                      >
                        <span>Remettre au service ✓</span>
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Column 4: Remises au service (HANDED_OFF) */}
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  4. Remises au Service
                </span>
                <Badge variant="default">{kdsColumns.HANDED_OFF.length}</Badge>
              </div>

              <div className="space-y-3">
                {kdsColumns.HANDED_OFF.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6 font-mono">Aucun historique récent.</p>
                ) : (
                  kdsColumns.HANDED_OFF.slice(0, 6).map((item) => (
                    <Card key={`${item.orderId}-${item.itemId}`} className="p-3 border border-stone-200 bg-stone-50 opacity-70 text-xs space-y-1">
                      <div className="flex justify-between font-mono font-bold text-[10px] text-stone-500">
                        <span>{item.orderNumber}</span>
                        <span>{item.destination}</span>
                      </div>
                      <div className="font-bold text-stone-800">
                        {item.quantity}x {item.productName}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Pris en charge par {item.waitstaffName}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: VALIDATION DES POINTS DE CAISSE SERVEUSES (REVERSEMENTS)
      ========================================================================== */}
      {activeTab === "remittances" && (
        <div className="space-y-5">
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Contrôle & Arbitrage des Reversements Serveuses</h3>
                <p className="text-xs text-amber-800">
                  Vérifiez le montant physique des espèces remises, constatez les écarts et validez pour clore le shift et alimenter la caisse centrale.
                </p>
              </div>
            </div>
            <Badge variant="warning">{remittances.filter((r) => r.status === "SUBMITTED").length} en attente</Badge>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-stone-900 font-serif">
              Reversements de Caisse Soumis par les Serveuses
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="pb-3">Date / Shift</th>
                    <th className="pb-3">Serveuse</th>
                    <th className="pb-3 text-right">Ventes Totales</th>
                    <th className="pb-3 text-right">Mobile Money</th>
                    <th className="pb-3 text-right">Espèces Attendues</th>
                    <th className="pb-3 text-right">Espèces Reçues</th>
                    <th className="pb-3 text-center">Écart Constaté</th>
                    <th className="pb-3 text-center">Statut</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {remittances.map((rem) => {
                    const isPending = rem.status === "SUBMITTED";
                    return (
                      <tr key={rem.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 text-stone-600">{rem.shiftDate}</td>
                        <td className="py-3 font-bold text-stone-900 font-sans">{rem.waitstaffName}</td>
                        <td className="py-3 text-right text-stone-700">
                          {rem.totalSalesXof.toLocaleString("fr-FR")} XOF
                        </td>
                        <td className="py-3 text-right text-sky-700 font-bold">
                          {rem.declaredMobileXof.toLocaleString("fr-FR")} XOF
                        </td>
                        <td className="py-3 text-right font-bold text-amber-800">
                          {rem.expectedCashXof.toLocaleString("fr-FR")} XOF
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-800">
                          {rem.receivedCashXof !== null && rem.receivedCashXof !== undefined
                            ? `${rem.receivedCashXof.toLocaleString("fr-FR")} XOF`
                            : "—"}
                        </td>
                        <td className="py-3 text-center">
                          {rem.discrepancyType === "SHORTAGE" ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                              Manquant -{rem.discrepancyAmountXof.toLocaleString("fr-FR")} XOF
                            </span>
                          ) : rem.discrepancyType === "REMAINING_BALANCE" ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Excédent +{rem.discrepancyAmountXof.toLocaleString("fr-FR")} XOF
                            </span>
                          ) : rem.status === "ACCEPTED" ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Conforme (0 XOF)
                            </span>
                          ) : (
                            <span className="text-stone-400">En attente</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={isPending ? "warning" : "success"}>
                            {isPending ? "Soumis" : "Validé"}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          {isPending ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenRemittanceModal(rem)}
                              className="bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-[11px] h-8 px-3 rounded-xl gap-1 shadow-sm font-sans"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Vérifier & Valider</span>
                            </Button>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-sans">
                              Visé par {rem.confirmedBy}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remittance Validation Modal */}
          {selectedRemittance && (
            <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-serif">
                      Validation du Reversement de Caisse
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      Serveuse : <strong>{selectedRemittance.waitstaffName}</strong> • {selectedRemittance.shiftDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRemittance(null)}
                    className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 block">Ventes Totales :</span>
                    <strong className="text-base text-stone-900 font-black">
                      {selectedRemittance.totalSalesXof.toLocaleString("fr-FR")} XOF
                    </strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200">
                    <span className="text-sky-700 block">Part Mobile Money :</span>
                    <strong className="text-base text-sky-900 font-black">
                      {selectedRemittance.declaredMobileXof.toLocaleString("fr-FR")} XOF
                    </strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">Espèces physiques attendues :</span>
                    <span className="text-lg font-black font-mono text-amber-950">
                      {selectedRemittance.expectedCashXof.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>

                  <div className="pt-2 border-t border-amber-200/80">
                    <label className="text-[11px] font-bold uppercase text-stone-600 block mb-1">
                      Espèces réellement comptées & perçues en main propre (XOF) :
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="500"
                      value={receivedCashInput}
                      onChange={(e) => setReceivedCashInput(e.target.value)}
                      className="font-mono text-base font-black h-11 rounded-xl bg-white"
                    />
                  </div>

                  {/* Dynamic Discrepancy Preview */}
                  {(() => {
                    const parsed = parseFloat(receivedCashInput) || 0;
                    const diff = selectedRemittance.expectedCashXof - parsed;
                    if (diff === 0) {
                      return (
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Montant conforme : Aucun écart relevé sur ce shift.</span>
                        </div>
                      );
                    }
                    if (diff > 0) {
                      return (
                        <div className="p-2.5 rounded-xl bg-rose-100 text-rose-950 text-xs font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-700" />
                          <span>Manquant constaté : -{diff.toLocaleString("fr-FR")} XOF à imputer à la serveuse.</span>
                        </div>
                      );
                    }
                    return (
                      <div className="p-2.5 rounded-xl bg-amber-100 text-amber-950 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>Excédent constaté : +{Math.abs(diff).toLocaleString("fr-FR")} XOF consigné en pourboire/solde.</span>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-stone-500 block mb-1">
                    Note ou arbitrage du Gérant (Optionnel) :
                  </label>
                  <Input
                    type="text"
                    placeholder="ex: Billet froissé vérifié, conforme"
                    value={remittanceArbitrageNote}
                    onChange={(e) => setRemittanceArbitrageNote(e.target.value)}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedRemittance(null)} className="rounded-xl h-10 text-xs font-bold">
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConfirmRemittance}
                    className="bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs h-10 px-5 rounded-xl gap-2 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                    <span>Valider & Encaisser Définitivement</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: STOCK BAR & CAVE À VIN
      ========================================================================== */}
      {activeTab === "stock" && (
        <div className="space-y-4">
          {/* Controls Bar: Switch Quantité vs Valeur XOF */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Affichage des Stocks :</span>
              <div className="bg-stone-100 p-1 rounded-2xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStockDisplayMode("QUANTITY")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    stockDisplayMode === "QUANTITY"
                      ? "bg-[#184f28] text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  En Quantités (Unités / Casiers)
                </button>
                <button
                  type="button"
                  onClick={() => setStockDisplayMode("VALUE_XOF")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    stockDisplayMode === "VALUE_XOF"
                      ? "bg-[#184f28] text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>En Valeur Marchande (XOF)</span>
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <Input
                type="text"
                placeholder="Rechercher boisson en stock..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          {/* Stock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks
              .filter((s) => !stockSearch.trim() || s.name.toLowerCase().includes(stockSearch.toLowerCase()))
              .map((stk) => {
                const isUnderAlert = stk.currentStockUnits <= stk.alertThreshold;
                const isUnderSafety = stk.currentStockUnits <= stk.safetyThreshold;
                const stockValueXof = stk.currentStockUnits * stk.unitSalePriceXof;

                return (
                  <Card
                    key={stk.id}
                    className={`p-4 border-2 transition-all flex flex-col justify-between ${
                      isUnderSafety
                        ? "border-rose-400 bg-rose-50/20"
                        : isUnderAlert
                        ? "border-amber-300 bg-amber-50/15"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="font-mono text-[10px] text-stone-400">{stk.code}</span>
                        <Badge variant={isUnderSafety ? "danger" : isUnderAlert ? "warning" : "success"}>
                          {isUnderSafety ? "Rupture Imminente" : isUnderAlert ? "Sous Seuil d'Alerte" : "Normal"}
                        </Badge>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase">
                          {stk.family === "WINE" ? <Wine className="w-3.5 h-3.5 text-[#8c101c]" /> : <Coffee className="w-3.5 h-3.5 text-amber-600" />}
                          <span>{stk.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 font-serif mt-0.5">
                          {stk.name}
                        </h4>
                        <p className="text-[11px] text-stone-500">Conditionnement : {stk.unitPackaging}</p>
                      </div>

                      {/* Display Mode: Quantity vs Value */}
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 my-3 flex items-center justify-between">
                        {stockDisplayMode === "QUANTITY" ? (
                          <>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 block">Stock Disponible</span>
                              <span className="text-xl font-black font-mono text-[#184f28]">
                                {stk.currentStockUnits} btles
                              </span>
                            </div>
                            <div className="text-right text-[11px] font-mono text-stone-500">
                              <div>Alerte : <strong>{stk.alertThreshold}</strong></div>
                              <div>Sécurité : <strong>{stk.safetyThreshold}</strong></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 block">Valeur en Stock</span>
                              <span className="text-lg font-black font-mono text-[#184f28]">
                                {stockValueXof.toLocaleString("fr-FR")} XOF
                              </span>
                            </div>
                            <div className="text-right text-[10px] font-mono text-stone-500">
                              PV : {stk.unitSalePriceXof.toLocaleString("fr-FR")} XOF
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stock Quick Actions */}
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReceiveStockTransfer(stk.id, stk.bottlesPerPackage || 12)}
                        className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold h-8 rounded-xl gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Réception (+1 Casier)</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclareBreakage(stk.id)}
                        className="text-rose-700 hover:bg-rose-50 border-rose-200 text-[11px] font-bold h-8 px-2.5 rounded-xl"
                      >
                        Déclarer Casse
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DEMANDES D'APPROVISIONNEMENT & RÉASSORT
      ========================================================================== */}
      {activeTab === "demande" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form: Create Replenishment */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                Buvette & Bar • Réassort Magasin
              </span>
              <h3 className="text-lg font-bold text-stone-900 font-serif mt-0.5">
                Nouvelle Demande d&apos;Approvisionnement
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Soumettez un bon d&apos;approvisionnement vers la Cave centrale ou l&apos;Économat pour visa par le Promoteur.
              </p>
            </div>

            <form onSubmit={handleCreateReplenishment} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Boisson ou Vin à Réapprovisionner :
                </label>
                <select
                  value={newReqProductName}
                  onChange={(e) => setNewReqProductName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white"
                  required
                >
                  <option value="">Sélectionnez une boisson...</option>
                  {stocks.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (Restant: {s.currentStockUnits} btles)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Quantité :</label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={newReqQuantity}
                    onChange={(e) => setNewReqQuantity(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Unité :</label>
                  <select
                    value={newReqUnit}
                    onChange={(e) => setNewReqUnit(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-stone-200 text-xs bg-stone-50"
                  >
                    <option value="Casiers de 12">Casiers de 12</option>
                    <option value="Casiers de 24">Casiers de 24</option>
                    <option value="Cartons de 6">Cartons de 6</option>
                    <option value="Packs de 6">Packs de 6</option>
                    <option value="Bouteilles">Bouteilles individuelles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Justification / Motif du réassort :
                </label>
                <Input
                  type="text"
                  placeholder="ex: Stock d'alerte atteint, événement ce week-end"
                  value={newReqReason}
                  onChange={(e) => setNewReqReason(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs h-11 rounded-2xl gap-2 shadow-md"
              >
                <Send className="w-4 h-4 text-[#d4af37]" />
                <span>Soumettre le Bon d&apos;Approvisionnement</span>
              </Button>
            </form>
          </div>

          {/* Right List: Past and Pending Requests */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-stone-900 font-serif">
              Historique des Demandes d&apos;Approvisionnement Bar
            </h4>

            <div className="space-y-3">
              {replenishmentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/80">
                    <span className="font-mono font-bold text-stone-800">{req.requestNumber}</span>
                    <Badge
                      variant={
                        req.status === "APPROVED"
                          ? "success"
                          : req.status === "RECEIVED"
                          ? "info"
                          : "warning"
                      }
                    >
                      {req.status === "APPROVED"
                        ? "Approuvé par Promoteur"
                        : req.status === "RECEIVED"
                        ? "Réceptionné au Bar"
                        : "En attente de visa"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {req.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-bold text-stone-800">
                        <span>• {it.quantity} {it.unit} de {it.productName}</span>
                        {it.reason && <span className="text-stone-400 text-[10px] italic">{it.reason}</span>}
                      </div>
                    ))}
                  </div>

                  {req.notes && (
                    <p className="text-[11px] text-stone-500 italic pt-1">{req.notes}</p>
                  )}

                  {req.status === "APPROVED" && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          receiveStockTransfer(req.id);
                          refreshData();
                          triggerNotice("✓ Réception physique des boissons enregistrée au bar.");
                        }}
                        className="bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-[11px] h-8 px-3 rounded-xl gap-1.5"
                      >
                        <PackageCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Confirmer Réception Physique au Comptoir</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: PLAN DES TABLES & OCCUPATION (DÉBITMASTER SYNOPTIQUE)
      ========================================================================== */}
      {activeTab === "plan" && (
        <div className="space-y-5">
          {/* Occupancy Indicator Banner */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Disponibilité & Salle
              </span>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Taux d&apos;Occupation en Direct
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {occupiedTablesCount} table(s) occupée(s) sur {tables.length} tables installées
              </p>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl font-black font-mono text-[#184f28]">
                {occupancyRate}%
              </span>
              <span className="text-[10px] text-stone-400 font-semibold uppercase">Affluence Actuelle</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Remplissage Terrasse & Salle</span>
                <span>{occupiedTablesCount}/{tables.length}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-[#184f28] rounded-full transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-stone-900 font-serif">
              État Synoptique des Tables
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tables.map((tbl) => {
                const isOccupied = tbl.status === "OCCUPIED";
                return (
                  <div
                    key={tbl.id}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isOccupied
                        ? "bg-amber-50/70 border-amber-300 shadow-2xs"
                        : "bg-stone-50 border-stone-200 hover:border-[#184f28]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sm text-stone-900">{tbl.label}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${isOccupied ? "bg-amber-500" : "bg-emerald-500"}`} />
                    </div>
                    <p className="text-[10px] text-stone-500 truncate">{tbl.zone}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-stone-400">{tbl.capacity} places</span>
                      <span className={`font-bold ${isOccupied ? "text-amber-800" : "text-emerald-800"}`}>
                        {isOccupied ? "Occupée" : "Libre"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: ÉQUIPE, HORAIRES & PERMANENCE DU BAR
      ========================================================================== */}
      {activeTab === "team" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Organisation de Service
            </span>
            <h3 className="text-lg font-bold text-stone-900 font-serif mt-0.5">
              Horaires, Permanence & Repos de l&apos;Équipe
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Planning de rotation pour les serveuses et les barmans du site.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { name: "Pascal AGBOSSOU", role: "Gérant Bar / Comptoir", shift: "08:00 - 18:00", rest: "Lundi", status: "Au poste" },
              { name: "Chantal TOSSOU", role: "Serveuse (Terrasse)", shift: "11:00 - 23:00", rest: "Mardi", status: "Au poste" },
              { name: "Yvette TOSSOU", role: "Serveuse (Salle Restaurant)", shift: "07:00 - 16:00", rest: "Mercredi", status: "Au poste" },
              { name: "Justine AMOUZOU", role: "Serveuse (VIP & Événements)", shift: "14:00 - 00:00", rest: "Jeudi", status: "Repos" },
            ].map((collab, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-sans font-bold text-stone-900 text-sm block">{collab.name}</span>
                  <span className="text-stone-500 text-[11px] font-sans">{collab.role}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Horaire :</span>
                    <strong className="text-stone-800">{collab.shift}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Jour de Repos :</span>
                    <strong className="text-amber-800">{collab.rest}</strong>
                  </div>
                  <Badge variant={collab.status === "Au poste" ? "success" : "default"}>
                    {collab.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
