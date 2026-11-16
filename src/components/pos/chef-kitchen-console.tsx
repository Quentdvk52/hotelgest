"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChefHat,
  Utensils,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Check,
  AlertCircle,
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
  BookOpen,
  Timer,
  Flame,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  WaitstaffActiveOrder,
  KitchenCook,
  KitchenItemAssignment,
  KitchenVivreStockItem,
  ReplenishmentRequest,
} from "@/modules/pos/waitstaff-types";
import {
  getWaitstaffOrders,
  getKitchenCooks,
  getKitchenAssignments,
  createKitchenAssignment,
  advanceKitchenAssignmentStatus,
  getKitchenVivresStockItems,
  updateKitchenVivreStockItem,
  getReplenishmentRequests,
  submitReplenishmentRequest,
  advanceOrderItemStatus,
} from "@/modules/pos/waitstaff-service";

interface ChefKitchenConsoleProps {
  activeUser: any;
}

export function ChefKitchenConsole({ activeUser }: ChefKitchenConsoleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab from query param or default to kds_cuisine
  const tabParam = searchParams.get("tab") || "kds_cuisine";
  const [activeTab, setActiveTab] = useState<string>(
    ["kds_cuisine", "assignments", "stock_vivres", "recipes", "team_cuisine"].includes(tabParam)
      ? tabParam
      : "kds_cuisine"
  );

  useEffect(() => {
    if (tabParam && ["kds_cuisine", "assignments", "stock_vivres", "recipes", "team_cuisine"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const setConsoleTab = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/pos/stations?tab=${tab}`);
  };

  const propertyId = activeUser?.propertyId || "prop-bohicon-001";
  const propertyName = activeUser?.propertyName || "Hôtel Le Vignoble - Bohicon (BOH)";
  const chefName = activeUser?.fullName || "Chef Rodrigue Mensah";

  // Live States
  const [orders, setOrders] = useState<WaitstaffActiveOrder[]>([]);
  const [cooks, setCooks] = useState<KitchenCook[]>([]);
  const [assignments, setAssignments] = useState<KitchenItemAssignment[]>([]);
  const [vivres, setVivres] = useState<KitchenVivreStockItem[]>([]);
  const [replenishmentRequests, setReplenishmentRequests] = useState<ReplenishmentRequest[]>([]);

  // UI Filters
  const [destinationFilter, setDestinationFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stockDisplayMode, setStockDisplayMode] = useState<"QUANTITY" | "VALUE_XOF">("QUANTITY");
  const [notice, setNotice] = useState<string | null>(null);

  // Assignment Selection per meal line: { [orderItemId]: cookId }
  const [selectedCookPerItem, setSelectedCookPerItem] = useState<Record<string, string>>({});
  const [selectedQtyPerItem, setSelectedQtyPerItem] = useState<Record<string, string>>({});

  // New Vivres Replenishment Form
  const [newVivreName, setNewVivreName] = useState<string>("");
  const [newVivreQty, setNewVivreQty] = useState<string>("10");
  const [newVivreUnit, setNewVivreUnit] = useState<string>("Kg");
  const [newVivreReason, setNewVivreReason] = useState<string>("");

  // Load and refresh data
  const refreshData = () => {
    const rawOrders = getWaitstaffOrders("all", propertyId);
    setOrders([...rawOrders]);
    setCooks([...getKitchenCooks(propertyId)]);
    setAssignments([...getKitchenAssignments(propertyId)]);
    setVivres([...getKitchenVivresStockItems(propertyId)]);
    setReplenishmentRequests([...getReplenishmentRequests(propertyId)]);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [propertyId]);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 6000);
  };

  // 1. FILTERED MEAL ORDERS (MEAL only, isolated from drinks)
  const mealOrdersList = useMemo(() => {
    return orders
      .map((order) => {
        const mealItems = order.items.filter(
          (item) => item.targetStationCode === "CUISINE" || item.fulfillmentUnit === "MEAL"
        );
        return {
          ...order,
          mealItems,
        };
      })
      .filter((order) => order.mealItems.length > 0)
      .filter((order) => {
        if (destinationFilter !== "ALL") {
          const isChambre = order.tableLabel.toLowerCase().includes("chambre") || order.tableLabel.toLowerCase().includes("suite");
          const isSalle = order.tableLabel.toLowerCase().includes("salle");
          if (destinationFilter === "CHAMBRE" && !isChambre) return false;
          if (destinationFilter === "SALLE" && !isSalle) return false;
          if (destinationFilter === "TABLE" && (isChambre || isSalle)) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchOrder =
            order.orderNumber.toLowerCase().includes(q) ||
            order.tableLabel.toLowerCase().includes(q) ||
            order.waitstaffName.toLowerCase().includes(q) ||
            order.mealItems.some((m) => m.productName.toLowerCase().includes(q));
          if (!matchOrder) return false;
        }
        return true;
      });
  }, [orders, destinationFilter, searchQuery]);

  // Remaining quantities map for assignment
  const remainingAssignedMap = useMemo(() => {
    const map = new Map<string, number>();
    assignments.forEach((asgn) => {
      map.set(asgn.orderItemId, (map.get(asgn.orderItemId) || 0) + asgn.quantity);
    });
    return map;
  }, [assignments]);

  // Create Assignment Action
  const handleAssignCook = (order: WaitstaffActiveOrder, item: any) => {
    const cookId = selectedCookPerItem[item.id];
    if (!cookId) {
      alert("Veuillez sélectionner un cuisinier de la brigade.");
      return;
    }

    const assignedCount = remainingAssignedMap.get(item.id) || 0;
    const leftToAssign = item.quantity - assignedCount;
    const qtyToAssign = Number(selectedQtyPerItem[item.id] || leftToAssign);

    if (qtyToAssign <= 0 || qtyToAssign > leftToAssign) {
      alert(`La quantité à affecter doit être comprise entre 1 et ${leftToAssign}.`);
      return;
    }

    createKitchenAssignment({
      propertyId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderItemId: item.id,
      productName: item.productName,
      accompaniment: item.accompaniment,
      specialInstructions: item.specialInstructions || order.notes,
      tableLabel: order.tableLabel,
      waitstaffName: order.waitstaffName,
      cookId,
      quantity: qtyToAssign,
    });

    refreshData();
    triggerNotice(`✓ ${qtyToAssign}x ${item.productName} affecté(s) au cuisinier avec succès.`);
  };

  // Advance Assignment Status
  const handleAdvanceAssignment = (
    asgnId: string,
    orderId: string,
    orderItemId: string,
    nextStatus: "IN_PREPARATION" | "READY" | "HANDED_OFF"
  ) => {
    advanceKitchenAssignmentStatus(asgnId, nextStatus);
    advanceOrderItemStatus(orderId, orderItemId, nextStatus as any);
    refreshData();

    if (nextStatus === "READY") {
      triggerNotice("✓ Plat marqué PRÊT ! Notification envoyée à la serveuse et aux valets.");
    } else if (nextStatus === "HANDED_OFF") {
      triggerNotice("✓ Plat remis au passe-plat / service.");
    } else {
      triggerNotice("✓ Cuisson commencée en cuisine.");
    }
  };

  // Create Vivre Replenishment
  const handleCreateVivreReplenishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVivreName.trim()) {
      alert("Veuillez sélectionner ou renseigner un ingrédient / vivre.");
      return;
    }

    submitReplenishmentRequest({
      propertyId,
      destinationStation: "CUISINE",
      requestedBy: chefName,
      items: [
        {
          productName: newVivreName.trim(),
          quantity: Number(newVivreQty) || 1,
          unit: newVivreUnit,
          reason: newVivreReason || "Réapprovisionnement cuisine pour fabrication repas",
        },
      ],
      notes: "Demande formulée par le Chef de cuisine.",
    });

    setNewVivreName("");
    setNewVivreQty("10");
    setNewVivreReason("");
    refreshData();
    triggerNotice("✓ Bon d'approvisionnement vivres transmis au Promoteur / Économat.");
  };

  // Helper: Elapsed minutes & badge color
  const getElapsedBadge = (createdAtStr: string) => {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - new Date(createdAtStr).getTime()) / 60000));
    if (elapsedMinutes < 10) {
      return { text: `${elapsedMinutes} min (Optimal)`, color: "bg-emerald-100 text-emerald-900 border-emerald-300" };
    }
    if (elapsedMinutes < 20) {
      return { text: `${elapsedMinutes} min (En cours)`, color: "bg-amber-100 text-amber-900 border-amber-300" };
    }
    return { text: `${elapsedMinutes} min (URGENT)`, color: "bg-rose-100 text-rose-900 border-rose-300 animate-pulse font-bold" };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Chef Cuisine */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 border border-stone-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-rose-400" />
              Station Chef Cuisine • Repas à la Commande
            </span>
            <span className="text-stone-400 text-xs font-mono">
              Modèle DébitMaster • {propertyName}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Console Chef Cuisinier & Brigade
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl">
            Gestion de la file des repas (avec accompagnements gratuits choisis), affectation aux cuisiniers, suivi des cuissons et gestion des stocks de vivres et ingrédients.
          </p>
        </div>

        {/* Quick Shift Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Chef Responsable</span>
            <span className="text-sm font-bold text-white font-mono">{chefName}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="h-10 px-3 rounded-2xl border-stone-700 bg-stone-800/80 text-stone-200 hover:bg-stone-700 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200">
        {[
          { key: "kds_cuisine", label: "File KDS Repas", icon: Utensils, badge: mealOrdersList.length },
          { key: "assignments", label: "Brigade & Affectations", icon: Users, badge: assignments.filter((a) => a.status !== "HANDED_OFF").length },
          { key: "stock_vivres", label: "Stocks Vivres & Ingrédients", icon: Boxes, badge: vivres.filter((v) => v.currentStockQty <= v.alertThreshold).length },
          { key: "recipes", label: "Fiches Recettes & Carte", icon: BookOpen },
          { key: "team_cuisine", label: "Brigade & Permanence", icon: Clock },
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
          TAB 1: FILE KDS REPAS & CUISINE (ISOLÉE DES BOISSONS)
      ========================================================================== */}
      {activeTab === "kds_cuisine" && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Search */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-bold text-stone-500 whitespace-nowrap flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Destination :
              </span>
              {[
                { key: "ALL", label: "Toutes destinations" },
                { key: "TABLE", label: "Salle Restaurant & Terrasse" },
                { key: "CHAMBRE", label: "Chambres (Room Service)" },
                { key: "SALLE", label: "Salles Séminaires" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setDestinationFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    destinationFilter === filter.key
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
                placeholder="Rechercher plat, commande, table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          {/* Meals Orders Cards */}
          <div className="space-y-4">
            {mealOrdersList.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
                <ChefHat className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-base font-bold text-stone-800 font-serif">File Cuisine Dégagée</h4>
                <p className="text-xs text-stone-400">Aucun bon repas en attente de cuisson pour le moment.</p>
              </div>
            ) : (
              mealOrdersList.map((order) => {
                const timer = getElapsedBadge(order.createdAt);
                return (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4 transition-all"
                  >
                    {/* Header: Order info & Timer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-stone-100 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs bg-rose-100 text-rose-950 px-2.5 py-1 rounded-lg">
                          {order.orderNumber}
                        </span>
                        <div>
                          <h3 className="text-base font-black text-stone-900 font-serif">
                            Destination : {order.tableLabel}
                          </h3>
                          <p className="text-xs text-stone-500">
                            Serveuse : <strong>{order.waitstaffName}</strong> • Client : {order.clientName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono border flex items-center gap-1.5 ${timer.color}`}>
                          <Timer className="w-3.5 h-3.5" />
                          <span>{timer.text}</span>
                        </span>
                        <Badge variant="default">{order.status}</Badge>
                      </div>
                    </div>

                    {/* Meal Lines with Accompaniment and Cook Assignment */}
                    <div className="space-y-3">
                      {order.mealItems.map((item) => {
                        const assignedCount = remainingAssignedMap.get(item.id) || 0;
                        const leftToAssign = item.quantity - assignedCount;
                        const isFullyAssigned = leftToAssign <= 0;

                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div>
                                <span className="text-sm font-black text-stone-900 block">
                                  {item.quantity}x {item.productName}
                                </span>
                                {/* Accompagnement Gratuit */}
                                {item.accompaniment && (
                                  <div className="text-xs text-[#184f28] font-bold mt-1 flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                                    <span>Accompagnement inclus : {item.accompaniment}</span>
                                  </div>
                                )}
                                {item.specialInstructions && (
                                  <p className="text-[11px] text-amber-800 italic mt-0.5">
                                    Instructions spéciales : {item.specialInstructions}
                                  </p>
                                )}
                              </div>

                              <div className="text-right font-mono">
                                <span className="text-xs font-bold text-stone-500">
                                  {isFullyAssigned ? "Totalement affecté" : `${leftToAssign} restant(s) à affecter`}
                                </span>
                              </div>
                            </div>

                            {/* Cook Assignment Form if portions remain */}
                            {!isFullyAssigned && (
                              <div className="p-3 rounded-xl bg-white border border-stone-200/80 flex flex-col sm:flex-row items-center gap-2">
                                <span className="text-[11px] font-bold text-stone-600 whitespace-nowrap">
                                  Affecter à :
                                </span>
                                <select
                                  value={selectedCookPerItem[item.id] || ""}
                                  onChange={(e) =>
                                    setSelectedCookPerItem({ ...selectedCookPerItem, [item.id]: e.target.value })
                                  }
                                  className="h-9 px-3 rounded-xl border border-stone-200 text-xs bg-stone-50 flex-1 w-full sm:w-auto"
                                >
                                  <option value="">Choisir un Cuisinier de la brigade...</option>
                                  {cooks.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.firstName} {c.lastName} ({c.roleTitle})
                                    </option>
                                  ))}
                                </select>

                                <Input
                                  type="number"
                                  min="1"
                                  max={leftToAssign}
                                  value={selectedQtyPerItem[item.id] || leftToAssign}
                                  onChange={(e) =>
                                    setSelectedQtyPerItem({ ...selectedQtyPerItem, [item.id]: e.target.value })
                                  }
                                  className="h-9 w-20 text-xs rounded-xl"
                                />

                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAssignCook(order, item)}
                                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs h-9 px-3 rounded-xl whitespace-nowrap"
                                >
                                  Affecter à la cuisson
                                </Button>
                              </div>
                            )}

                            {/* Assigned Cooks List for this Item */}
                            {assignments
                              .filter((a) => a.orderItemId === item.id)
                              .map((asgn) => {
                                const nextStatus =
                                  asgn.status === "ASSIGNED"
                                    ? "IN_PREPARATION"
                                    : asgn.status === "IN_PREPARATION"
                                    ? "READY"
                                    : asgn.status === "READY"
                                    ? "HANDED_OFF"
                                    : null;

                                const nextButtonLabel =
                                  asgn.status === "ASSIGNED"
                                    ? "Commencer cuisson"
                                    : asgn.status === "IN_PREPARATION"
                                    ? "Marquer plat prêt ✓"
                                    : asgn.status === "READY"
                                    ? "Remettre au service ✓"
                                    : null;

                                return (
                                  <div
                                    key={asgn.id}
                                    className="p-3 rounded-xl bg-white border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Flame className="w-4 h-4 text-amber-500" />
                                      <div>
                                        <span className="font-bold text-stone-900">
                                          {asgn.quantity}x confié(s) à {asgn.cookName}
                                        </span>
                                        <span className="text-[10px] text-stone-400 block font-mono">
                                          Statut : <strong>{asgn.status}</strong>
                                        </span>
                                      </div>
                                    </div>

                                    {nextStatus && (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                          handleAdvanceAssignment(asgn.id, asgn.orderId, asgn.orderItemId, nextStatus)
                                        }
                                        className={`text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs ${
                                          nextStatus === "READY"
                                            ? "bg-[#184f28] hover:bg-[#123c1f]"
                                            : nextStatus === "HANDED_OFF"
                                            ? "bg-stone-900 hover:bg-stone-800"
                                            : "bg-amber-600 hover:bg-amber-700"
                                        }`}
                                      >
                                        <span>{nextButtonLabel}</span>
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BRIGADE & AFFECTATIONS CUISINE
      ========================================================================== */}
      {activeTab === "assignments" && (
        <div className="space-y-5">
          <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-rose-700 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Suivi par Cuisinier & Poste de Cuisson</h3>
                <p className="text-xs text-rose-800">
                  Vue consolidée des plats en cours par cuisinier de la brigade.
                </p>
              </div>
            </div>
            <Badge variant="default">{assignments.length} affectation(s)</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {cooks.map((cook) => {
              const cookAssignments = assignments.filter((a) => a.cookId === cook.id);
              const activeCount = cookAssignments.filter((a) => a.status !== "HANDED_OFF").length;

              return (
                <Card key={cook.id} className="p-5 border border-stone-200 bg-white shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 font-serif">
                        {cook.firstName} {cook.lastName}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-sans">{cook.roleTitle}</p>
                    </div>
                    <Badge variant={activeCount > 0 ? "warning" : "success"}>
                      {activeCount} en cours
                    </Badge>
                  </div>

                  <div className="text-[11px] text-stone-600 space-y-0.5">
                    <p>Spécialité : <strong>{cook.speciality}</strong></p>
                    <p className="font-mono text-stone-400">{cook.phone}</p>
                  </div>

                  {/* Assigned items list */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Plats confiés :</span>
                    {cookAssignments.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">Aucune charge en cours.</p>
                    ) : (
                      cookAssignments.map((asgn) => (
                        <div key={asgn.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-stone-900">
                            <span>{asgn.quantity}x {asgn.productName}</span>
                            <span className="text-[10px] font-mono text-stone-500">{asgn.tableLabel}</span>
                          </div>
                          {asgn.accompaniment && (
                            <p className="text-[10px] text-[#184f28] font-semibold">★ {asgn.accompaniment}</p>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <Badge variant={asgn.status === "READY" ? "success" : "warning"}>
                              {asgn.status}
                            </Badge>
                            {asgn.status === "ASSIGNED" && (
                              <button
                                type="button"
                                onClick={() => handleAdvanceAssignment(asgn.id, asgn.orderId, asgn.orderItemId, "IN_PREPARATION")}
                                className="text-[10px] font-bold text-amber-700 underline"
                              >
                                Commencer →
                              </button>
                            )}
                            {asgn.status === "IN_PREPARATION" && (
                              <button
                                type="button"
                                onClick={() => handleAdvanceAssignment(asgn.id, asgn.orderId, asgn.orderItemId, "READY")}
                                className="text-[10px] font-bold text-emerald-700 underline"
                              >
                                Prêt ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STOCKS DES VIVRES & INGRÉDIENTS (RÈGLE MÉTIER HÔTELGEST)
      ========================================================================== */}
      {activeTab === "stock_vivres" && (
        <div className="space-y-5">
          {/* Note Rule Reminder */}
          <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <Boxes className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Règle de Gestion des Stocks Cuisines</h4>
                <p className="text-xs text-amber-900">
                  Les repas ne sont pas stockés car préparés sur commande, mais les vivres qui concourent à leur réalisation sont stockés et suivis avec seuils de sécurité et d&apos;alerte.
                </p>
              </div>
            </div>

            <div className="bg-white p-1 rounded-2xl flex items-center gap-1 border border-amber-300">
              <button
                type="button"
                onClick={() => setStockDisplayMode("QUANTITY")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockDisplayMode === "QUANTITY" ? "bg-[#184f28] text-white" : "text-stone-600"
                }`}
              >
                Quantités (Kg, Sacs, Bidons)
              </button>
              <button
                type="button"
                onClick={() => setStockDisplayMode("VALUE_XOF")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockDisplayMode === "VALUE_XOF" ? "bg-[#184f28] text-white" : "text-stone-600"
                }`}
              >
                Valeurs en XOF
              </button>
            </div>
          </div>

          {/* Grid of Vivres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vivres.map((v) => {
              const isUnderAlert = v.currentStockQty <= v.alertThreshold;
              const isUnderSafety = v.currentStockQty <= v.safetyThreshold;
              const stockValue = v.currentStockQty * v.unitCostXof;

              return (
                <Card
                  key={v.id}
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
                      <span className="font-mono text-[10px] text-stone-400">{v.code}</span>
                      <Badge variant={isUnderSafety ? "danger" : isUnderAlert ? "warning" : "success"}>
                        {isUnderSafety ? "Rupture Imminente" : isUnderAlert ? "Alerte Vivres" : "Conforme"}
                      </Badge>
                    </div>

                    <div className="mt-2">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">{v.category}</span>
                      <h4 className="text-sm font-bold text-stone-900 font-serif mt-0.5">{v.name}</h4>
                      <p className="text-[11px] text-stone-500">Fournisseur : {v.supplierName}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 my-3 flex items-center justify-between">
                      {stockDisplayMode === "QUANTITY" ? (
                        <>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">Stock Disponible</span>
                            <span className="text-xl font-black font-mono text-[#184f28]">
                              {v.currentStockQty} {v.packagingUnit}
                            </span>
                          </div>
                          <div className="text-right text-[11px] font-mono text-stone-500">
                            <div>Alerte : <strong>{v.alertThreshold}</strong></div>
                            <div>Sécurité : <strong>{v.safetyThreshold}</strong></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">Valeur Stock Vivres</span>
                            <span className="text-lg font-black font-mono text-[#184f28]">
                              {stockValue.toLocaleString("fr-FR")} XOF
                            </span>
                          </div>
                          <div className="text-right text-[10px] font-mono text-stone-500">
                            Coût : {v.unitCostXof.toLocaleString("fr-FR")} XOF/{v.packagingUnit}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        updateKitchenVivreStockItem(v.id, 5);
                        refreshData();
                        triggerNotice(`✓ Réassort de +5 ${v.packagingUnit} de ${v.name} enregistré.`);
                      }}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold h-8 rounded-xl gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Réassort (+5 {v.packagingUnit})</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateKitchenVivreStockItem(v.id, -2);
                        refreshData();
                        triggerNotice(`✓ Sortie pour cuisson (-2 ${v.packagingUnit}) décomptée.`);
                      }}
                      className="text-stone-700 hover:bg-stone-100 text-[11px] font-bold h-8 px-2.5 rounded-xl"
                    >
                      Sortie Cuisson
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Form: Supply Request Vivres */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-stone-900 font-serif">
              Émettre un Bon de Réapprovisionnement Vivres (vers l&apos;Économat)
            </h4>

            <form onSubmit={handleCreateVivreReplenishment} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-600 block mb-1">Vivre / Ingrédient :</label>
                <select
                  value={newVivreName}
                  onChange={(e) => setNewVivreName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 text-xs bg-stone-50"
                  required
                >
                  <option value="">Sélectionner un ingrédient...</option>
                  {vivres.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name} (Restant: {v.currentStockQty} {v.packagingUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Quantité :</label>
                <Input
                  type="number"
                  min="1"
                  value={newVivreQty}
                  onChange={(e) => setNewVivreQty(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs h-10 rounded-xl gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Transmettre</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: FICHES RECETTES & CARTE DES REPAS
      ========================================================================== */}
      {activeTab === "recipes" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              Savoir-Faire & Gastronomie Béninoise
            </span>
            <h3 className="text-lg font-bold text-stone-900 font-serif mt-0.5">
              Fiches Techniques & Accompagnements Compatibles
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Consultez les ingrédients standards et temps moyen de dressage pour chaque plat de la carte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "Amiwo au Poulet Bicyclette Braisé",
                price: "5 500 XOF",
                time: "20-25 min",
                vivres: "Poulet fermier 1.2kg, Farine de maïs rouge, Piments, Ail & Oignon, Huile de palme",
                accompaniments: "Alloco fondant, Frites maison, Bananes bouillies, Salade",
              },
              {
                name: "Sauce Crincrin au Mouton Tendre & Akassa",
                price: "4 500 XOF",
                time: "15-20 min",
                vivres: "Mouton tendre, Feuilles de crincrin fraîches, Akassa de maïs blanc fermenté",
                accompaniments: "Pâte de maïs blanche Akassa, Igname pilée Agoun",
              },
              {
                name: "Tchep Royal au Mérou Braisé du Lac Nokoué",
                price: "6 000 XOF",
                time: "25 min",
                vivres: "Mérou frais 800g, Riz brisé parfumé, Carottes, Choux, Piment antillais, Tomates",
                accompaniments: "Riz gras rouge terroir, Alloco doré",
              },
              {
                name: "Poisson Braisé Entier (Capitaine) sauce Tomate",
                price: "7 000 XOF",
                time: "25-30 min",
                vivres: "Capitaine entier 1kg, Marinade aux épices du Zou, Tomates fraîches, Oignons",
                accompaniments: "Attiéké fin de Grand-Popo, Alloco fondant, Frites",
              },
            ].map((rcp, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 text-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <h4 className="font-bold text-stone-900 font-serif text-sm">{rcp.name}</h4>
                  <span className="font-mono font-bold text-[#184f28]">{rcp.price}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Timer className="w-3.5 h-3.5 text-amber-600" />
                  <span>Temps moyen de dressage : <strong>{rcp.time}</strong></span>
                </div>
                <p className="text-stone-600">
                  <strong className="text-stone-800">Vivres nécessaires :</strong> {rcp.vivres}
                </p>
                <p className="text-emerald-800">
                  <strong className="text-[#184f28]">Accompagnements offerts :</strong> {rcp.accompaniments}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: BRIGADE & PERMANENCE CUISINE
      ========================================================================== */}
      {activeTab === "team_cuisine" && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              Organisation de la Brigade
            </span>
            <h3 className="text-lg font-bold text-stone-900 font-serif mt-0.5">
              Permanence des Cuisiniers & Postes
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Plannings de feu et de garde en cuisine pour le service midi et soir.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {cooks.map((cook) => (
              <div key={cook.id} className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-sans font-bold text-stone-900 text-sm block">
                    {cook.firstName} {cook.lastName}
                  </span>
                  <span className="text-stone-500 text-[11px] font-sans">{cook.roleTitle} — {cook.speciality}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Poste :</span>
                    <strong className="text-stone-800">{cook.speciality}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase">Téléphone :</span>
                    <strong className="text-stone-800">{cook.phone}</strong>
                  </div>
                  <Badge variant={cook.isActive ? "success" : "default"}>
                    {cook.isActive ? "En Cuisine" : "Repos"}
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
