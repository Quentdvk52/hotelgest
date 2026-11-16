"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  Coffee,
  Wine,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Bell,
  Sparkles,
  ShoppingBag,
  Send,
  User,
  Check,
  Search,
  Receipt,
  DollarSign,
  Smartphone,
  ChevronRight,
  Printer,
  History,
  Star,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  WaitstaffProduct,
  WaitstaffCartLine,
  WaitstaffActiveOrder,
  WaitstaffOrderItem,
  WaitstaffTable,
  WaitstaffShift,
  ServerCashRemittance,
  WaitstaffRemittanceSnapshot,
  WaitstaffRatingFeedback,
  PaymentMethod,
  MobileMoneyOperator,
  ProductFulfillmentUnit,
} from "@/modules/pos/waitstaff-types";
import {
  WAITSTAFF_CATALOG,
  BENIN_MEAL_ACCOMPANIMENTS,
  getWaitstaffShift,
  getWaitstaffTables,
  getWaitstaffOrders,
  createWaitstaffOrder,
  advanceOrderItemStatus,
  settleWaitstaffOrder,
  getWaitstaffRemittanceSnapshot,
  submitServerRemittance,
  getWaitstaffRatings,
} from "@/modules/pos/waitstaff-service";

interface WaitstaffConsoleProps {
  activeUser?: {
    id: string;
    email: string;
    fullName: string;
    roleCode: string;
    roleName: string;
    propertyId: string | null;
  } | null;
}

export function WaitstaffServiceConsole({ activeUser }: WaitstaffConsoleProps) {
  // Current authenticated waitstaff or fallback to Bohicon seed
  const waitstaffId = activeUser?.id || "user-srv-boh";
  const propertyId = activeUser?.propertyId || "prop-bohicon-001";
  const waitstaffName = activeUser?.fullName || "Chantal Tossou";

  // Shift & profile data
  const [shift, setShift] = useState<WaitstaffShift>(() => getWaitstaffShift(waitstaffId));
  const [tables, setTables] = useState<WaitstaffTable[]>(() => getWaitstaffTables(propertyId));
  const [orders, setOrders] = useState<WaitstaffActiveOrder[]>(() =>
    getWaitstaffOrders(waitstaffId, propertyId)
  );
  const [remittanceSnapshot, setRemittanceSnapshot] = useState<WaitstaffRemittanceSnapshot>(() =>
    getWaitstaffRemittanceSnapshot(waitstaffId, propertyId)
  );
  const [ratings, setRatings] = useState<WaitstaffRatingFeedback[]>(() => getWaitstaffRatings());

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "encaissement" | "remittance" | "permanence" | "notations"
  >("dashboard");

  // Filter & Search states in Catalog
  const [selectedFamily, setSelectedFamily] = useState<"ALL" | "BEVERAGE" | "MEAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Active Order Taking State
  const [selectedTable, setSelectedTable] = useState<string>(tables[0]?.label || "Table 1");
  const [selectedZone, setSelectedZone] = useState<string>(tables[0]?.zone || "Terrasse Jardin");
  const [clientName, setClientName] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [cart, setCart] = useState<WaitstaffCartLine[]>([]);
  const [orderSuccessBanner, setOrderSuccessBanner] = useState<string | null>(null);

  // Accompaniment modal for meal selection
  const [pendingMealProduct, setPendingMealProduct] = useState<WaitstaffProduct | null>(null);
  const [chosenAccompaniment, setChosenAccompaniment] = useState<string>(
    BENIN_MEAL_ACCOMPANIMENTS[0]
  );
  const [mealInstructions, setMealInstructions] = useState<string>("");

  // Payment Modal State
  const [settlingOrder, setSettlingOrder] = useState<WaitstaffActiveOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [momoOperator, setMomoOperator] = useState<MobileMoneyOperator>("MTN");
  const [momoNumber, setMomoNumber] = useState<string>("+229 97 00 11 22");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [splitCashAmount, setSplitCashAmount] = useState<string>("");
  const [splitMomoAmount, setSplitMomoAmount] = useState<string>("");
  const [lastFiscalReceipt, setLastFiscalReceipt] = useState<any | null>(null);

  // Remittance Declaration Form State
  const [declaredCashInput, setDeclaredCashInput] = useState<string>("");
  const [declaredMobileInput, setDeclaredMobileInput] = useState<string>("");
  const [remittanceNote, setRemittanceNote] = useState<string>("");
  const [remittanceSubmittedSuccess, setRemittanceSubmittedSuccess] = useState<boolean>(false);

  // Sync data on changes
  useEffect(() => {
    setShift(getWaitstaffShift(waitstaffId));
    setTables(getWaitstaffTables(propertyId));
    setOrders(getWaitstaffOrders(waitstaffId, propertyId));
    setRemittanceSnapshot(getWaitstaffRemittanceSnapshot(waitstaffId, propertyId));
  }, [waitstaffId, propertyId]);

  // Catalog filtered categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    WAITSTAFF_CATALOG.forEach((p) => {
      if (selectedFamily === "ALL" || p.unit === selectedFamily) {
        set.add(p.category);
      }
    });
    return ["ALL", ...Array.from(set)];
  }, [selectedFamily]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return WAITSTAFF_CATALOG.filter((p) => {
      if (selectedFamily !== "ALL" && p.unit !== selectedFamily) return false;
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
      }
      return true;
    });
  }, [selectedFamily, selectedCategory, searchQuery]);

  // Cart total calculations
  const cartTotalXof = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.priceXof * item.quantity, 0);
  }, [cart]);

  const cartTotalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Add Product to Cart
  const handleAddProduct = (product: WaitstaffProduct) => {
    if (product.unit === "MEAL") {
      setPendingMealProduct(product);
      setChosenAccompaniment(BENIN_MEAL_ACCOMPANIMENTS[0]);
      setMealInstructions("");
      return;
    }

    // Beverage direct add
    setCart((prev) => {
      const existing = prev.find(
        (line) => line.product.id === product.id && line.fulfillmentUnit === "BEVERAGE"
      );
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id && line.fulfillmentUnit === "BEVERAGE"
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [...prev, { product, quantity: 1, fulfillmentUnit: "BEVERAGE" }];
    });
  };

  // Add Meal with Accompaniment
  const handleConfirmMealAccompaniment = () => {
    if (!pendingMealProduct) return;
    setCart((prev) => [
      ...prev,
      {
        product: pendingMealProduct,
        quantity: 1,
        fulfillmentUnit: "MEAL",
        accompaniment: chosenAccompaniment,
        specialInstructions: mealInstructions.trim() || undefined,
      },
    ]);
    setPendingMealProduct(null);
  };

  // Update Cart Quantity
  const handleUpdateCartQty = (index: number, delta: number) => {
    setCart((prev) => {
      const line = prev[index];
      if (!line) return prev;
      const newQty = line.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item));
    });
  };

  // Fast Bulk Add Shortcut (e.g. +3, +6, +12 Casier)
  const handleFastAddQty = (product: WaitstaffProduct, count: number) => {
    if (product.unit === "MEAL") {
      handleAddProduct(product);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + count } : line
        );
      }
      return [...prev, { product, quantity: count, fulfillmentUnit: "BEVERAGE" }];
    });
  };

  // Remove Line from Cart
  const handleRemoveCartLine = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Send Order to Stations (Kitchen KDS & Bar KDS)
  const handleSubmitOrder = () => {
    if (cart.length === 0) return;

    const newOrder = createWaitstaffOrder({
      propertyId,
      tableLabel: selectedTable,
      zone: selectedZone,
      waitstaffId,
      waitstaffName,
      clientName: clientName.trim() || `Client ${selectedTable}`,
      notes: orderNotes.trim() || undefined,
      items: cart.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        accompaniment: line.accompaniment,
        specialInstructions: line.specialInstructions,
      })),
    });

    // Refresh orders and tables
    setOrders(getWaitstaffOrders(waitstaffId, propertyId));
    setTables(getWaitstaffTables(propertyId));
    setCart([]);
    setClientName("");
    setOrderNotes("");

    setOrderSuccessBanner(
      `✓ Commande ${newOrder.orderNumber} pour ${newOrder.tableLabel} transmise avec succès ! Repas routés en Cuisine & Boissons au Bar.`
    );
    setTimeout(() => setOrderSuccessBanner(null), 6000);
    setActiveTab("encaissement");
  };

  // Advance Item Status (Waitstaff picks up from counter -> Delivers to table)
  const handleAdvanceStatus = (orderId: string, itemId: string, nextStatus: "RECEIVED" | "DELIVERED") => {
    const res = advanceOrderItemStatus(orderId, itemId, nextStatus);
    if (res.success) {
      setOrders(getWaitstaffOrders(waitstaffId, propertyId));
    }
  };

  // Open Payment Modal
  const handleOpenPayment = (order: WaitstaffActiveOrder) => {
    setSettlingOrder(order);
    setPaymentMethod("CASH");
    setCashTendered(order.totalAmountXof.toString());
    setSplitCashAmount((order.totalAmountXof / 2).toString());
    setSplitMomoAmount((order.totalAmountXof / 2).toString());
    setLastFiscalReceipt(null);
  };

  // Execute Settlement
  const handleConfirmSettlement = () => {
    if (!settlingOrder) return;

    let cashAmount = 0;
    let mobileAmount = 0;

    if (paymentMethod === "CASH") {
      cashAmount = settlingOrder.totalAmountXof;
    } else if (paymentMethod === "MOMO") {
      mobileAmount = settlingOrder.totalAmountXof;
    } else {
      cashAmount = parseInt(splitCashAmount, 10) || 0;
      mobileAmount = parseInt(splitMomoAmount, 10) || 0;
    }

    const res = settleWaitstaffOrder({
      orderId: settlingOrder.id,
      paymentMethod,
      cashAmountXof: cashAmount,
      mobileAmountXof: mobileAmount,
      mobileOperator: paymentMethod !== "CASH" ? momoOperator : undefined,
      mobileNumber: paymentMethod !== "CASH" ? momoNumber : undefined,
      waitstaffName,
    });

    if (res.success && res.payment) {
      setLastFiscalReceipt({
        payment: res.payment,
        order: res.order,
      });
      // Refresh local states
      setOrders(getWaitstaffOrders(waitstaffId, propertyId));
      setRemittanceSnapshot(getWaitstaffRemittanceSnapshot(waitstaffId, propertyId));
    }
  };

  // Submit Shift Remittance to Gérant
  const handleSubmitRemittance = (e: React.FormEvent) => {
    e.preventDefault();
    const declaredCash = parseInt(declaredCashInput, 10) || 0;
    const declaredMobile = parseInt(declaredMobileInput, 10) || 0;

    submitServerRemittance({
      propertyId,
      waitstaffId,
      waitstaffName,
      declaredCashXof: declaredCash,
      declaredMobileXof: declaredMobile,
      expectedCashXof: remittanceSnapshot.expectedCashInHandXof,
      note: remittanceNote.trim() || undefined,
    });

    setRemittanceSubmittedSuccess(true);
    setRemittanceSnapshot(getWaitstaffRemittanceSnapshot(waitstaffId, propertyId));
    setDeclaredCashInput("");
    setDeclaredMobileInput("");
    setRemittanceNote("");

    setTimeout(() => setRemittanceSubmittedSuccess(false), 5000);
  };

  // Calculation for change in Cash settlement
  const changeDueXof = useMemo(() => {
    if (paymentMethod !== "CASH" || !settlingOrder) return 0;
    const tendered = parseInt(cashTendered, 10) || 0;
    return Math.max(0, tendered - settlingOrder.totalAmountXof);
  }, [paymentMethod, settlingOrder, cashTendered]);

  // Ready orders count (items ready for pickup at Bar or Kitchen counter)
  const readyItemsCount = useMemo(() => {
    let count = 0;
    for (const o of orders) {
      for (const i of o.items) {
        if (i.preparationStatus === "READY") count++;
      }
    }
    return count;
  }, [orders]);

  return (
    <div className="space-y-4">
      {/* =========================================================================
          TOP COMMANDER HEADER: Waitstaff identity, shift clock & sacoche balance
      ========================================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-stone-900 via-[#184f28]/30 to-stone-900 border border-stone-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#184f28] border border-[#d4af37]/40 flex items-center justify-center text-white shadow-md">
            <Utensils className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Service Actif
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {shift.propertyName} • Shift {shift.serviceStartTime} - {shift.serviceEndTime}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
              {waitstaffName} (Serveuse / Serveur)
            </h1>
          </div>
        </div>

        {/* Quick KPI Pills in Sacoche */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-bold">En Sacoche (Espèces)</p>
              <p className="text-sm font-black font-mono text-emerald-400">
                {remittanceSnapshot.expectedCashInHandXof.toLocaleString("fr-FR")} XOF
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-bold">Commissions (2%)</p>
              <p className="text-sm font-black font-mono text-[#d4af37]">
                {remittanceSnapshot.commissionEarnedXof.toLocaleString("fr-FR")} XOF
              </p>
            </div>
          </div>

          {readyItemsCount > 0 && (
            <div className="px-3 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-2 animate-bounce">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold font-mono">{readyItemsCount} plat(s) prêt(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          TACTILE NAVIGATION TABS (Mobile Friendly Scrolling Bar)
      ========================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "dashboard"
              ? "bg-[#184f28] text-white shadow-md shadow-emerald-950/20"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Tableau de bord</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-[#184f28] text-white shadow-md shadow-emerald-950/20"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Prendre commande</span>
          {cart.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black font-mono">
              {cartTotalItemsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("encaissement")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "encaissement"
              ? "bg-[#184f28] text-white shadow-md shadow-emerald-950/20"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-amber-500" />
          <span>Encaissements & Livraisons</span>
          {readyItemsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono">
              {readyItemsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("remittance")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "remittance"
              ? "bg-[#184f28] text-white shadow-md shadow-emerald-950/20"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Mon Point Caisse</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("permanence")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "permanence"
              ? "bg-[#184f28] text-white shadow-md shadow-emerald-950/20"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Horaires & Permanence</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notations")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "notations"
              ? "bg-[#184f28] text-white shadow-md shadow-emerald-950/20"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Mes Notations Clients</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {orderSuccessBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{orderSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setOrderSuccessBanner(null)}
            className="text-stone-400 hover:text-stone-700"
          >
            ×
          </button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: TABLEAU DE BORD (SYNTHÈSE SHIFT & KPIS)
      ========================================================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Main KPI 4-Card Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <Card className="p-4 bg-white border border-stone-200/90 shadow-sm rounded-3xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Chiffre d&apos;affaires Shift
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-stone-900 mt-1">
                {remittanceSnapshot.totalSalesXof.toLocaleString("fr-FR")} XOF
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-2">
                <span>{remittanceSnapshot.activeOrdersCount} commandes traitées</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-stone-200/90 shadow-sm rounded-3xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Espèces à Remettre
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-emerald-600 mt-1">
                {remittanceSnapshot.expectedCashInHandXof.toLocaleString("fr-FR")} XOF
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-2 font-medium">
                <span>Direct dans la sacoche</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-stone-200/90 shadow-sm rounded-3xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Mobile Money Collecté
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-blue-600 mt-1">
                {remittanceSnapshot.mobileCollectedXof.toLocaleString("fr-FR")} XOF
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-blue-700 mt-2 font-medium">
                <span>MTN / Moov / Celtiis</span>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-stone-200/90 shadow-sm rounded-3xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Prime de Service Estimée
              </span>
              <p className="text-xl sm:text-2xl font-black font-mono text-[#d4af37] mt-1">
                {remittanceSnapshot.commissionEarnedXof.toLocaleString("fr-FR")} XOF
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 mt-2 font-medium">
                <span>2% sur ventes validées</span>
              </div>
            </Card>
          </div>

          {/* Tables Status Overview */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Mes Tables de Service — {shift.propertyName}
                </h3>
                <p className="text-xs text-stone-500">
                  Cliquez sur une table libre pour démarrer une commande instantanément.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("orders")}
                className="bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-bold gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle Commande</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {tables.map((tbl) => {
                const isOccupied = tbl.status === "OCCUPIED";
                const isMine = tbl.assignedWaitstaffId === waitstaffId;
                return (
                  <button
                    key={tbl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTable(tbl.label);
                      setSelectedZone(tbl.zone);
                      setActiveTab("orders");
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isOccupied
                        ? "bg-amber-50/70 border-amber-300 hover:border-amber-400"
                        : "bg-stone-50 border-stone-200 hover:border-[#184f28] hover:bg-emerald-50/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {tbl.label}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOccupied ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 truncate">{tbl.zone}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-stone-400">{tbl.capacity} places</span>
                      <span
                        className={`font-bold ${
                          isOccupied ? "text-amber-700" : "text-emerald-700"
                        }`}
                      >
                        {isOccupied ? "Occupée" : "Libre"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#184f28] to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              <div>
                <p className="text-sm font-bold">Routage Intelligent Bar & Cuisine</p>
                <p className="text-xs text-emerald-100">
                  Les boissons sont instantanément transmises au Barman et les plats au Chef Cuisine avec leurs accompagnements.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab("orders")}
              className="bg-white text-[#184f28] hover:bg-stone-100 font-bold text-xs gap-1.5 self-start sm:self-auto"
            >
              <span>Ouvrir l&apos;Écran Tactile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PRENDRE COMMANDE (INTERFACE TACTILE RAPIDE DÉBITMASTER)
      ========================================================================== */}
      {activeTab === "orders" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Table selection & Catalog */}
          <div className="lg:col-span-8 space-y-4">
            {/* Table & Customer Setup Strip */}
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Table :</span>
                  {tables.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTable(t.label);
                        setSelectedZone(t.zone);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs transition-all whitespace-nowrap ${
                        selectedTable === t.label
                          ? "bg-[#184f28] text-white shadow-sm"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 font-medium">Zone :</span>
                  <Badge variant="default" className="text-xs font-bold bg-stone-50">
                    {selectedZone}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Nom du Client (Optionnel)
                  </label>
                  <Input
                    type="text"
                    placeholder={`ex: Client ${selectedTable} ou M. SOGLO`}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Instructions Générales / Table
                  </label>
                  <Input
                    type="text"
                    placeholder="ex: Verres supplémentaires, glaçons à part"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Category and Family Filters */}
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Family Toggle: ALL / BEVERAGE / MEAL */}
                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFamily("ALL");
                      setSelectedCategory("ALL");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedFamily === "ALL" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
                    }`}
                  >
                    Tout ({WAITSTAFF_CATALOG.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFamily("BEVERAGE");
                      setSelectedCategory("ALL");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedFamily === "BEVERAGE"
                        ? "bg-[#184f28] text-white shadow-sm"
                        : "text-stone-500"
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5 text-amber-400" />
                    <span>Boissons & Bar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFamily("MEAL");
                      setSelectedCategory("ALL");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedFamily === "MEAL"
                        ? "bg-[#184f28] text-white shadow-sm"
                        : "text-stone-500"
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cuisine & Repas</span>
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Sub-category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {cat === "ALL" ? "Tous les rayons" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Tactile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((prod) => {
                const isBeverage = prod.unit === "BEVERAGE";
                const isMeal = prod.unit === "MEAL";

                return (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 shadow-sm flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            isMeal ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isMeal ? "Cuisine" : "Bar"}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          Stock : {prod.availableStock || 99}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-stone-900 line-clamp-2 mb-1">
                        {prod.name}
                      </h4>
                      <p className="text-xs font-black font-mono text-[#184f28]">
                        {prod.priceXof.toLocaleString("fr-FR")} XOF
                      </p>
                    </div>

                    {/* Touch Action Buttons */}
                    <div className="mt-3 pt-2 border-t border-stone-100 space-y-1.5">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddProduct(prod)}
                        className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs h-8 gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isMeal ? "Choisir Accompagnement" : "Ajouter (+1)"}</span>
                      </Button>

                      {/* Fast beverage multipliers (+3, +6, Casier +12) */}
                      {isBeverage && (
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => handleFastAddQty(prod, 3)}
                            className="py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-mono font-bold"
                          >
                            +3
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFastAddQty(prod, 6)}
                            className="py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-mono font-bold"
                          >
                            +6
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFastAddQty(prod, 12)}
                            className="py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-mono font-bold"
                            title="Casier de 12 bouteilles"
                          >
                            +12 📦
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Mobile Thumb Cart Drawer */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-[#184f28]/30 shadow-md flex flex-col justify-between sticky top-4 max-h-[85vh]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-serif">
                      Commande en cours
                    </h3>
                    <p className="text-xs text-stone-500">
                      Destination : <strong>{selectedTable}</strong> ({selectedZone})
                    </p>
                  </div>
                  <Badge variant="success" className="bg-[#184f28] text-white font-mono text-xs">
                    {cartTotalItemsCount} article(s)
                  </Badge>
                </div>

                {/* Cart Lines List */}
                <div className="space-y-2.5 overflow-y-auto max-h-[46vh] pr-1">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                      <p className="text-xs font-medium">Le panier est vide.</p>
                      <p className="text-[11px] text-stone-400">
                        Sélectionnez des articles à gauche pour composer la commande.
                      </p>
                    </div>
                  ) : (
                    cart.map((line, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-stone-900">{line.product.name}</span>
                            <span className="text-[10px] text-stone-400 block font-mono">
                              {line.product.priceXof.toLocaleString("fr-FR")} XOF / unité
                            </span>
                          </div>
                          <span className="font-black font-mono text-stone-900 whitespace-nowrap">
                            {(line.product.priceXof * line.quantity).toLocaleString("fr-FR")} XOF
                          </span>
                        </div>

                        {line.accompaniment && (
                          <div className="text-[11px] text-[#184f28] font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                            ★ {line.accompaniment}
                          </div>
                        )}

                        {line.specialInstructions && (
                          <div className="text-[10px] text-stone-500 italic">
                            &quot;{line.specialInstructions}&quot;
                          </div>
                        )}

                        {/* Stepper buttons (+ / - / delete) */}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/50">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(idx, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 flex items-center justify-center font-bold text-stone-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold text-xs min-w-5 text-center">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(idx, 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 flex items-center justify-center font-bold text-stone-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCartLine(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cart Footer Total and Action */}
              <div className="pt-3 border-t border-stone-200 space-y-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-stone-500">Total Commande :</span>
                  <span className="text-xl font-black font-mono text-[#184f28]">
                    {cartTotalXof.toLocaleString("fr-FR")} XOF
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={cart.length === 0}
                  onClick={handleSubmitOrder}
                  className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-sm h-12 rounded-2xl shadow-lg shadow-emerald-950/20 gap-2"
                >
                  <Send className="w-4 h-4 text-[#d4af37]" />
                  <span>Envoyer aux Stations (KDS)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ENCAISSEMENTS & LIVRAISONS (SUIVI EN TEMPS RÉEL + PAIEMENTS)
      ========================================================================== */}
      {activeTab === "encaissement" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                Suivi des commandes en cours : Dès qu&apos;un plat ou boisson est <strong>PRÊT</strong>,
                accusez réception au comptoir, livrez le client, puis encaissez en Espèces ou MoMo avec facture normalisée e-MECeF.
              </span>
            </div>
            <Badge variant="default" className="bg-white text-xs font-mono">
              {orders.filter((o) => o.status !== "PAID").length} en cours
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => {
              const isPaid = order.status === "PAID";
              const hasReadyItem = order.items.some((i) => i.preparationStatus === "READY");

              return (
                <Card
                  key={order.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isPaid
                      ? "bg-stone-50 border-stone-200 opacity-75"
                      : hasReadyItem
                      ? "bg-amber-50/40 border-amber-400 shadow-md"
                      : "bg-white border-stone-200"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-stone-900 text-white px-2 py-0.5 rounded-lg">
                            {order.orderNumber}
                          </span>
                          <span className="text-sm font-black text-stone-900 font-serif">
                            {order.tableLabel}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {order.clientName} • {order.zone}
                        </p>
                      </div>

                      <Badge
                        variant={
                          isPaid
                            ? "success"
                            : hasReadyItem
                            ? "warning"
                            : order.status === "DELIVERED"
                            ? "info"
                            : "default"
                        }
                        className="font-bold text-[11px]"
                      >
                        {isPaid
                          ? "PAYÉ ✓"
                          : hasReadyItem
                          ? "🔔 PRÊT AU COMPTOIR"
                          : order.status === "DELIVERED"
                          ? "LIVRÉ À TABLE"
                          : "EN PRÉPARATION"}
                      </Badge>
                    </div>

                    {/* Order Items Status Progression */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-stone-900">
                                {item.quantity}x {item.productName}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                ({item.targetStationCode})
                              </span>
                            </div>
                            {item.accompaniment && (
                              <span className="text-[11px] text-[#184f28] font-semibold block">
                                ★ {item.accompaniment}
                              </span>
                            )}
                          </div>

                          {/* Action Progression Buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            {item.preparationStatus === "PENDING" && (
                              <span className="text-[11px] text-stone-400 font-medium">
                                ⏳ En attente
                              </span>
                            )}
                            {item.preparationStatus === "IN_PREPARATION" && (
                              <span className="text-[11px] text-blue-600 font-medium">
                                🍳 En préparation
                              </span>
                            )}
                            {item.preparationStatus === "READY" && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAdvanceStatus(order.id, item.id, "RECEIVED")}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] h-7 px-2.5 gap-1 animate-pulse"
                              >
                                <Check className="w-3 h-3" />
                                <span>Accuser Réception</span>
                              </Button>
                            )}
                            {item.preparationStatus === "RECEIVED" && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAdvanceStatus(order.id, item.id, "DELIVERED")}
                                className="bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-[10px] h-7 px-2.5 gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Marquer Livré</span>
                              </Button>
                            )}
                            {item.preparationStatus === "DELIVERED" && (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Livré
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer & Payment Trigger */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        Montant Total
                      </span>
                      <span className="text-base font-black font-mono text-[#184f28]">
                        {order.totalAmountXof.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>

                    {!isPaid ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleOpenPayment(order)}
                        className="bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs gap-1.5 px-4 shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Encaisser Table</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Encaissé & Normalisé DGI</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MON POINT CAISSE (CLÔTURE SHIFT & REMISE AU GÉRANT)
      ========================================================================== */}
      {activeTab === "remittance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Summary and submission form */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    Clôture de Caisse & Remise au Gérant
                  </h3>
                  <p className="text-xs text-stone-500">
                    Déclarez les montants physiques encaissés en fin de service. Le Gérant validera votre remise dans son espace.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Ventes totales de votre service :</span>
                    <strong className="font-mono text-stone-900">
                      {remittanceSnapshot.totalSalesXof.toLocaleString("fr-FR")} XOF
                    </strong>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Total Mobile Money (MTN / Moov / Celtiis) :</span>
                    <strong className="font-mono text-blue-700">
                      {remittanceSnapshot.mobileCollectedXof.toLocaleString("fr-FR")} XOF
                    </strong>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Espèces théoriques à remettre :</span>
                    <strong className="font-mono text-emerald-700 font-bold">
                      {remittanceSnapshot.expectedCashInHandXof.toLocaleString("fr-FR")} XOF
                    </strong>
                  </div>
                </div>

                {remittanceSubmittedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Point de caisse transmis au Gérant avec succès ! En attente de validation.</span>
                  </div>
                )}

                <form onSubmit={handleSubmitRemittance} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Espèces Physiques Remises au Gérant (XOF) *
                    </label>
                    <Input
                      type="number"
                      required
                      placeholder={`ex: ${remittanceSnapshot.expectedCashInHandXof}`}
                      value={declaredCashInput}
                      onChange={(e) => setDeclaredCashInput(e.target.value)}
                      className="rounded-xl font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Montant Mobile Money Encaissé (XOF)
                    </label>
                    <Input
                      type="number"
                      placeholder={`ex: ${remittanceSnapshot.mobileCollectedXof}`}
                      value={declaredMobileInput}
                      onChange={(e) => setDeclaredMobileInput(e.target.value)}
                      className="rounded-xl font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Note ou Observation
                    </label>
                    <Input
                      type="text"
                      placeholder="ex: Fin de shift midi, sacoche complète remise en mains propres"
                      value={remittanceNote}
                      onChange={(e) => setRemittanceNote(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs h-11 rounded-2xl shadow-md gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Transmettre Point de Caisse au Gérant</span>
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right: History of Remittances */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-serif">
                      Historique des Remises de Caisse
                    </h3>
                    <p className="text-xs text-stone-500">
                      Suivi des validations et vérification des écarts éventuels.
                    </p>
                  </div>
                  <History className="w-4 h-4 text-stone-400" />
                </div>

                <div className="space-y-3">
                  {remittanceSnapshot.pastRemittances.map((remit) => {
                    const isAccepted = remit.status === "ACCEPTED";
                    const isPending = remit.status === "SUBMITTED";

                    return (
                      <div
                        key={remit.id}
                        className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                          <div>
                            <span className="font-bold text-stone-900 font-mono">{remit.shiftDate}</span>
                            <span className="text-[10px] text-stone-400 block">{remit.propertyName}</span>
                          </div>
                          <Badge
                            variant={isAccepted ? "success" : isPending ? "warning" : "danger"}
                            className="text-[10px] font-bold"
                          >
                            {isAccepted
                              ? "CONFIRMÉ PAR GÉRANT ✓"
                              : isPending
                              ? "EN ATTENTE GÉRANT"
                              : "REJETÉ"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-stone-600">
                          <div>
                            <span className="text-[10px] block text-stone-400">Espèces déclarées :</span>
                            <strong className="font-mono text-stone-900">
                              {remit.declaredCashXof.toLocaleString("fr-FR")} XOF
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] block text-stone-400">Espèces reçues :</span>
                            <strong className="font-mono text-emerald-700">
                              {(remit.receivedCashXof ?? remit.declaredCashXof).toLocaleString("fr-FR")} XOF
                            </strong>
                          </div>
                        </div>

                        {remit.discrepancyType && (
                          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
                            ⚠️ Écart constaté : {remit.discrepancyType} de{" "}
                            {remit.discrepancyAmountXof.toLocaleString("fr-FR")} XOF
                          </div>
                        )}

                        {remit.confirmedBy && (
                          <div className="text-[10px] text-stone-400 italic">
                            Validé par {remit.confirmedBy}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: HORAIRES & PERMANENCE (PLANNING DE SERVICE & REPOS)
      ========================================================================== */}
      {activeTab === "permanence" && (
        <div className="space-y-4">
          <Card className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Horaires de Service & Fiche de Permanence
                </h3>
                <p className="text-xs text-stone-500">
                  Planning officiel affecté par le Gérant du site et la Direction des Ressources Humaines.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                  Établissement d&apos;Affectation
                </span>
                <p className="text-sm font-bold text-stone-900">{shift.propertyName}</p>
                <p className="text-xs text-stone-500 mt-1">Poste : Serveuse en Salle & Buvette</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                  Horaires Quotidiens
                </span>
                <p className="text-sm font-bold text-stone-900 font-mono">
                  {shift.serviceStartTime} — {shift.serviceEndTime}
                </p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  ✓ Pointage en service actif
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                  Jour de Repos Hebdomadaire
                </span>
                <p className="text-sm font-bold text-stone-900">{shift.restDayName}</p>
                <p className="text-xs text-stone-500 mt-1">Permanence tournante planifiée</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 6: MES NOTATIONS CLIENTS (FEEDBACK CLIENTÈLE)
      ========================================================================== */}
      {activeTab === "notations" && (
        <div className="space-y-4">
          <Card className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Avis & Notations des Clients
                </h3>
                <p className="text-xs text-stone-500">
                  Notes attribuées par les clients via le QR Code de table ou à la caisse.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="text-sm font-black font-mono">4.9 / 5</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratings.map((rate) => (
                <div
                  key={rate.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{rate.clientName}</span>
                      <span className="text-[10px] text-stone-400 block">
                        {rate.tableLabel} • Commande {rate.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rate.ratingScore
                              ? "fill-amber-400 text-amber-500"
                              : "text-stone-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-stone-700 italic bg-white p-2.5 rounded-xl border border-stone-100">
                    &quot;{rate.comment}&quot;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>Qualité : <strong>{rate.serviceQuality}</strong></span>
                    <span>{new Date(rate.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHOIX DE L'ACCOMPAGNEMENT POUR UN PLAT CUISINE
      ========================================================================== */}
      {pendingMealProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Accompagnement Inclus (Cuisine Béninoise)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingMealProduct(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div>
              <p className="text-xs text-stone-600 mb-1">
                Plat sélectionné : <strong>{pendingMealProduct.name}</strong>
              </p>
              <p className="text-[11px] text-stone-400">
                Chaque plat traditionnel ou grillade inclut un accompagnement de choix sans supplément.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {BENIN_MEAL_ACCOMPANIMENTS.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setChosenAccompaniment(acc)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                    chosenAccompaniment === acc
                      ? "bg-emerald-50 border-[#184f28] text-[#184f28] font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  ★ {acc}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                Instructions particulières en Cuisine
              </label>
              <Input
                type="text"
                placeholder="ex: Piment vert à part, bien cuit, pas trop de sel"
                value={mealInstructions}
                onChange={(e) => setMealInstructions(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingMealProduct(null)}
                className="text-xs font-bold"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmMealAccompaniment}
                className="bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmer au Panier</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ENCAISSEMENT MULTI-MODES & FACTURE NORMALISÉE DGI e-MECeF
      ========================================================================== */}
      {settlingOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    Encaissement & Normalisation Fiscale
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {settlingOrder.orderNumber} • {settlingOrder.tableLabel} ({settlingOrder.clientName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettlingOrder(null)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* If receipt has already been generated */}
            {lastFiscalReceipt ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    Paiement Encaissé & Facture DGI e-MECeF Validée !
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Signature fiscale transmise et certifiée avec succès.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs font-mono space-y-1">
                  <p><strong>NIM DGI :</strong> {lastFiscalReceipt.payment.fiscalNim}</p>
                  <p><strong>UID e-MECeF :</strong> {lastFiscalReceipt.payment.fiscalUid}</p>
                  <p><strong>Montant :</strong> {lastFiscalReceipt.payment.totalAmountXof.toLocaleString("fr-FR")} XOF</p>
                  <p><strong>Mode :</strong> {lastFiscalReceipt.payment.paymentMethod}</p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer Ticket Fiscal</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setSettlingOrder(null);
                      setLastFiscalReceipt(null);
                    }}
                    className="text-xs font-bold"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            ) : (
              /* Payment form */
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 uppercase">Total à Payer :</span>
                  <span className="text-xl font-black font-mono text-[#184f28]">
                    {settlingOrder.totalAmountXof.toLocaleString("fr-FR")} XOF
                  </span>
                </div>

                {/* Payment Method Switcher */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === "CASH"
                        ? "bg-[#184f28] text-white border-[#184f28] shadow-sm font-bold"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <DollarSign className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs">Espèces</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MOMO")}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === "MOMO"
                        ? "bg-[#184f28] text-white border-[#184f28] shadow-sm font-bold"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs">Mobile Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MIXED")}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === "MIXED"
                        ? "bg-[#184f28] text-white border-[#184f28] shadow-sm font-bold"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs">Mixte</span>
                  </button>
                </div>

                {/* Sub-inputs based on method */}
                {paymentMethod === "CASH" && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Montant Reçu du Client (XOF)
                      </label>
                      <Input
                        type="number"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="font-mono text-sm rounded-xl"
                      />
                    </div>
                    {changeDueXof > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex justify-between">
                        <span>Monnaie à rendre :</span>
                        <span className="font-mono">{changeDueXof.toLocaleString("fr-FR")} XOF</span>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === "MOMO" && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Opérateur Mobile Bénin
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["MTN", "MOOV", "CELTIIS", "WAVE"] as MobileMoneyOperator[]).map((op) => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => setMomoOperator(op)}
                            className={`py-1.5 text-xs font-bold rounded-xl border ${
                              momoOperator === op
                                ? "bg-stone-900 text-white border-stone-900"
                                : "bg-white text-stone-700 border-stone-300"
                            }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Numéro Mobile Money du Client
                      </label>
                      <Input
                        type="text"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        className="font-mono text-sm rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "MIXED" && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Part Espèces (XOF)
                        </label>
                        <Input
                          type="number"
                          value={splitCashAmount}
                          onChange={(e) => setSplitCashAmount(e.target.value)}
                          className="font-mono text-sm rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Part MoMo (XOF)
                        </label>
                        <Input
                          type="number"
                          value={splitMomoAmount}
                          onChange={(e) => setSplitMomoAmount(e.target.value)}
                          className="font-mono text-sm rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConfirmSettlement}
                  className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs h-11 rounded-2xl shadow-md gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Valider Encaissement & Émettre Facture DGI</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
