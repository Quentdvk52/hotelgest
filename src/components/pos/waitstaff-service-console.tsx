"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Coins,
  Loader2,
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
  PaymentTenderBreakdown,
  WaitstaffPayment,
  ProductFulfillmentUnit,
} from "@/modules/pos/waitstaff-types";
import {
  WAITSTAFF_CATALOG,
  BENIN_MEAL_ACCOMPANIMENTS,
  WAITSTAFF_EXCHANGE_RATES,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as
    | "dashboard"
    | "orders"
    | "encaissement"
    | "remittance"
    | "permanence"
    | "notations"
    | null;

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

  // Navigation tab synchronized with left sidebar (?tab=...)
  const [activeTab, setActiveTabState] = useState<
    "dashboard" | "orders" | "encaissement" | "remittance" | "permanence" | "notations"
  >(tabFromUrl || "dashboard");

  const setActiveTab = (tab: "dashboard" | "orders" | "encaissement" | "remittance" | "permanence" | "notations") => {
    setActiveTabState(tab);
    router.push(`/pos/stations?tab=${tab}`);
  };

  useEffect(() => {
    if (tabFromUrl && ["dashboard", "orders", "encaissement", "remittance", "permanence", "notations"].includes(tabFromUrl)) {
      setActiveTabState(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Filter & Search states in Catalog: 3 Families (BEVERAGE / MEAL / WINE)
  const [selectedFamily, setSelectedFamily] = useState<"BEVERAGE" | "MEAL" | "WINE">("BEVERAGE");
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

  // Multi-tender Payment Modal State
  const [settlingOrder, setSettlingOrder] = useState<WaitstaffActiveOrder | null>(null);
  const [cashAmountInput, setCashAmountInput] = useState<string>("");
  const [momoAmountInput, setMomoAmountInput] = useState<string>("");
  const [momoPhoneInput, setMomoPhoneInput] = useState<string>("");
  const [momoOperator, setMomoOperator] = useState<MobileMoneyOperator>("MTN");
  const [tpeAmountInput, setTpeAmountInput] = useState<string>("");
  const [tpeReceiptRefInput, setTpeReceiptRefInput] = useState<string>("");
  const [deviseAmountInput, setDeviseAmountInput] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<"EUR" | "USD">("EUR");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentProgressStep, setPaymentProgressStep] = useState<string>("");
  const [kkiapayError, setKkiapayError] = useState<string | null>(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState<boolean>(false);
  const [lastFiscalReceipt, setLastFiscalReceipt] = useState<{ payment: WaitstaffPayment; order: WaitstaffActiveOrder } | null>(null);

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
      const isWine = p.unit === "WINE" || p.targetStationCode === "CAVE";
      const isMeal = p.unit === "MEAL" || p.targetStationCode === "CUISINE";
      const isBar = p.unit === "BEVERAGE" && p.targetStationCode === "BAR";

      if (
        (selectedFamily === "WINE" && isWine) ||
        (selectedFamily === "MEAL" && isMeal) ||
        (selectedFamily === "BEVERAGE" && isBar)
      ) {
        set.add(p.category);
      }
    });
    return ["ALL", ...Array.from(set)];
  }, [selectedFamily]);

  // Filtered products across 3 Families
  const filteredProducts = useMemo(() => {
    return WAITSTAFF_CATALOG.filter((p) => {
      const isWine = p.unit === "WINE" || p.targetStationCode === "CAVE";
      const isMeal = p.unit === "MEAL" || p.targetStationCode === "CUISINE";
      const isBar = p.unit === "BEVERAGE" && p.targetStationCode === "BAR";

      if (selectedFamily === "WINE" && !isWine) return false;
      if (selectedFamily === "MEAL" && !isMeal) return false;
      if (selectedFamily === "BEVERAGE" && !isBar) return false;

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

    const unit = product.unit;
    setCart((prev) => {
      const existing = prev.find(
        (line) => line.product.id === product.id && line.fulfillmentUnit === unit
      );
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id && line.fulfillmentUnit === unit
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [...prev, { product, quantity: 1, fulfillmentUnit: unit }];
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

  // Fast Bulk Add Shortcut (e.g. +3, +6, +12 Casier / +2, +6 Carton pour les vins)
  const handleFastAddQty = (product: WaitstaffProduct, count: number) => {
    if (product.unit === "MEAL") {
      handleAddProduct(product);
      return;
    }
    const unit = product.unit;
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + count } : line
        );
      }
      return [...prev, { product, quantity: count, fulfillmentUnit: unit }];
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

  // Reset payment inputs
  const resetPaymentForm = () => {
    setCashAmountInput("");
    setMomoAmountInput("");
    setMomoPhoneInput("");
    setMomoOperator("MTN");
    setTpeAmountInput("");
    setTpeReceiptRefInput("");
    setDeviseAmountInput("");
    setSelectedCurrency("EUR");
    setIsProcessingPayment(false);
    setPaymentProgressStep("");
    setKkiapayError(null);
    setShowCancelConfirmModal(false);
    setLastFiscalReceipt(null);
  };

  // Open Payment Modal
  const handleOpenPayment = (order: WaitstaffActiveOrder) => {
    resetPaymentForm();
    setSettlingOrder(order);
  };

  // Close payment modal attempt with dirty check
  const handleAttemptClosePayment = () => {
    const hasAnyAmount =
      (parseFloat(cashAmountInput) || 0) > 0 ||
      (parseFloat(momoAmountInput) || 0) > 0 ||
      (parseFloat(tpeAmountInput) || 0) > 0 ||
      (parseFloat(deviseAmountInput) || 0) > 0;

    if (hasAnyAmount && !lastFiscalReceipt) {
      setShowCancelConfirmModal(true);
    } else {
      resetPaymentForm();
      setSettlingOrder(null);
    }
  };

  const handleConfirmCancelPayment = () => {
    setShowCancelConfirmModal(false);
    resetPaymentForm();
    setSettlingOrder(null);
  };

  // Multi-tender dynamic calculations
  const parsedCash = parseFloat(cashAmountInput) || 0;
  const parsedMomo = parseFloat(momoAmountInput) || 0;
  const parsedTpe = parseFloat(tpeAmountInput) || 0;
  const parsedDevise = parseFloat(deviseAmountInput) || 0;

  const sumTenderedXof = parsedCash + parsedMomo + parsedTpe + parsedDevise;
  const orderTotalXof = settlingOrder ? settlingOrder.totalAmountXof : 0;
  const resteAPayerXof = orderTotalXof - sumTenderedXof;

  const currentRateObj = WAITSTAFF_EXCHANGE_RATES[selectedCurrency];
  const resteConverted = resteAPayerXof / currentRateObj.rate;
  const deviseInputConverted = parsedDevise / currentRateObj.rate;

  const hasEnteredAmounts = parsedCash > 0 || parsedMomo > 0 || parsedTpe > 0 || parsedDevise > 0;
  const isMomoPhoneValid = parsedMomo === 0 || momoPhoneInput.trim().replace(/\s/g, "").length >= 8;
  const isTpeRefValid = parsedTpe === 0 || tpeReceiptRefInput.trim().length >= 2;
  const canSubmitPayment =
    settlingOrder !== null &&
    resteAPayerXof === 0 &&
    hasEnteredAmounts &&
    isMomoPhoneValid &&
    isTpeRefValid &&
    !isProcessingPayment;

  // Execute Multi-tender Settlement
  const handleConfirmSettlement = async () => {
    if (!settlingOrder || !canSubmitPayment) return;

    setKkiapayError(null);
    setIsProcessingPayment(true);

    try {
      let kkiapayTxId: string | undefined = undefined;

      // If Mobile Money tender is selected (> 0), process KKiaPay request
      if (parsedMomo > 0) {
        setPaymentProgressStep(
          `Envoi de la demande de paiement KKiaPay au ${momoPhoneInput.trim()}...`
        );

        // Simulate USSD push prompt on customer handset
        await new Promise((resolve) => setTimeout(resolve, 1400));
        setPaymentProgressStep(
          `Notification USSD reçue par le client. En attente de validation du code PIN...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1600));

        const generatedTxId = `kkiapay_pos_${Date.now()}`;
        const verifyRes = await fetch("/api/payments/kkiapay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: generatedTxId,
            amountXof: parsedMomo,
            type: "WINE_STORE",
            referenceId: settlingOrder.orderNumber,
            clientName: settlingOrder.clientName,
            clientPhone: momoPhoneInput.trim(),
            paymentMethod:
              momoOperator === "MOOV"
                ? "MOOV_MONEY"
                : momoOperator === "CELTIIS"
                ? "CELTIIS"
                : "MTN_MOMO",
            propertyId: settlingOrder.propertyId,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(
            verifyData.error ||
              "La transaction Mobile Money a été refusée ou a expiré sur le téléphone du client."
          );
        }

        kkiapayTxId = generatedTxId;
        setPaymentProgressStep("Paiement Mobile Money confirmé ! Normalisation fiscale DGI en cours...");
        await new Promise((resolve) => setTimeout(resolve, 600));
      } else {
        setPaymentProgressStep("Normalisation fiscale e-MECeF (DGI Bénin) en cours...");
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      const tenders: PaymentTenderBreakdown = {
        cashAmountXof: parsedCash,
        momoAmountXof: parsedMomo,
        momoPhone: parsedMomo > 0 ? momoPhoneInput.trim() : undefined,
        momoOperator: parsedMomo > 0 ? momoOperator : undefined,
        tpeAmountXof: parsedTpe,
        tpeReceiptRef: parsedTpe > 0 ? tpeReceiptRefInput.trim() : undefined,
        deviseAmountXof: parsedDevise,
        deviseCurrency: selectedCurrency,
        deviseRate: currentRateObj.rate,
        deviseConvertedAmount: deviseInputConverted,
      };

      const res = settleWaitstaffOrder({
        orderId: settlingOrder.id,
        tenders,
        kkiapayTransactionId: kkiapayTxId,
        waitstaffName,
      });

      if (res.success && res.payment && res.order) {
        setLastFiscalReceipt({
          payment: res.payment,
          order: res.order,
        });
        setOrders(getWaitstaffOrders(waitstaffId, propertyId));
        setRemittanceSnapshot(getWaitstaffRemittanceSnapshot(waitstaffId, propertyId));
        setOrderSuccessBanner(
          `Commande ${settlingOrder.orderNumber} réglée avec succès (${settlingOrder.totalAmountXof.toLocaleString("fr-FR")} XOF) et facture normalisée émise !`
        );
      } else {
        throw new Error("Erreur interne lors de la validation fiscale de la commande.");
      }
    } catch (err: any) {
      setKkiapayError(
        err.message ||
          "Échec de l'encaissement Mobile Money KKiaPay. Veuillez vérifier le solde du client ou corriger les coordonnées."
      );
    } finally {
      setIsProcessingPayment(false);
      setPaymentProgressStep("");
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
          ACTIVE VIEW BREADCRUMB & SECTION TITLE (Classé dans le sidebar vertical gauche)
      ========================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Section active :
          </span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900 font-serif flex items-center gap-1.5 text-sm">
              {activeTab === "dashboard" && (
                <>
                  <Layers className="w-4 h-4 text-[#d4af37]" />
                  <span>Tableau de bord</span>
                </>
              )}
              {activeTab === "orders" && (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                  <span>Prendre commande</span>
                </>
              )}
              {activeTab === "encaissement" && (
                <>
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <span>Encaissements & Livraisons</span>
                </>
              )}
              {activeTab === "remittance" && (
                <>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Mon Point Caisse</span>
                </>
              )}
              {activeTab === "permanence" && (
                <>
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Horaires & Permanence</span>
                </>
              )}
              {activeTab === "notations" && (
                <>
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Mes Notations Clients</span>
                </>
              )}
            </span>
            <Badge variant="default" className="text-[10px] font-mono text-stone-500 bg-stone-50">
              Navigable via le menu latéral gauche
            </Badge>
          </div>
        </div>

        {/* Quick mobile jump buttons on small screens where sidebar is in drawer */}
        <div className="flex sm:hidden items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t sm:border-t-0 border-stone-100">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              activeTab === "dashboard" ? "bg-[#184f28] text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              activeTab === "orders" ? "bg-[#184f28] text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            Commande
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("encaissement")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              activeTab === "encaissement" ? "bg-[#184f28] text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            Caisse ({orders.filter((o) => o.status !== "PAID").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("remittance")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              activeTab === "remittance" ? "bg-[#184f28] text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            Point
          </button>
        </div>
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
                {/* 3 Family Buttons: Boissons & Bar / Cuisine & Repas / Cave à vin */}
                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFamily("BEVERAGE");
                      setSelectedCategory("ALL");
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedFamily === "BEVERAGE"
                        ? "bg-[#184f28] text-white shadow-sm"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedFamily === "MEAL"
                        ? "bg-[#184f28] text-white shadow-sm"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cuisine & Repas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFamily("WINE");
                      setSelectedCategory("ALL");
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedFamily === "WINE"
                        ? "bg-[#8c101c] text-white shadow-sm"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                    }`}
                  >
                    <Wine className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Cave à vin</span>
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
                const isBeverage = prod.unit === "BEVERAGE" && prod.targetStationCode === "BAR";
                const isWine = prod.unit === "WINE" || prod.targetStationCode === "CAVE";
                const isMeal = prod.unit === "MEAL" || prod.targetStationCode === "CUISINE";

                return (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 shadow-sm flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Product Photo Thumbnail */}
                      <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2.5 bg-stone-100 border border-stone-200/90 shadow-2xs">
                        <img
                          src={
                            prod.imageUrl ||
                            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"
                          }
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span
                          className={`absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs ${
                            isMeal
                              ? "bg-rose-900/90 text-white"
                              : isWine
                              ? "bg-[#8c101c] text-white font-black"
                              : "bg-amber-900/90 text-white"
                          }`}
                        >
                          {isMeal ? "Cuisine" : isWine ? "Cave à vin" : "Bar"}
                        </span>
                        <span className="absolute bottom-2 right-2 text-[10px] bg-black/75 text-white font-mono px-1.5 py-0.5 rounded shadow-xs">
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
                        className={`w-full text-white font-bold text-xs h-8 gap-1 ${
                          isWine
                            ? "bg-[#8c101c] hover:bg-[#6e0c15]"
                            : "bg-[#184f28] hover:bg-[#123c1f]"
                        }`}
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

                      {/* Fast wine multipliers (+2 bouteilles, +6 carton 📦) */}
                      {isWine && (
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => handleFastAddQty(prod, 2)}
                            className="py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-mono font-bold"
                          >
                            +2 Bout.
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFastAddQty(prod, 6)}
                            className="py-1 rounded-lg bg-[#8c101c]/10 hover:bg-[#8c101c]/20 text-[#8c101c] text-[10px] font-mono font-bold"
                            title="Carton de 6 bouteilles"
                          >
                            +6 📦 Carton
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
                        <div className="flex items-start gap-2.5">
                          {line.product.imageUrl && (
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-300/80">
                              <img
                                src={line.product.imageUrl}
                                alt={line.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-stone-900 truncate block">
                                {line.product.name}
                              </span>
                              <span className="font-black font-mono text-stone-900 whitespace-nowrap">
                                {(line.product.priceXof * line.quantity).toLocaleString("fr-FR")} XOF
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400 block font-mono">
                              {line.product.priceXof.toLocaleString("fr-FR")} XOF / unité
                            </span>
                          </div>
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

            {pendingMealProduct.imageUrl && (
              <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-2xs">
                <img
                  src={pendingMealProduct.imageUrl}
                  alt={pendingMealProduct.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-stone-950/80 text-white font-mono text-xs font-bold backdrop-blur-xs">
                  {pendingMealProduct.priceXof.toLocaleString("fr-FR")} XOF
                </span>
              </div>
            )}

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
          MODAL: ENCAISSEMENT MULTI-MOYENS & FACTURE NORMALISÉE DGI e-MECeF
      ========================================================================== */}
      {settlingOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                    Encaissement & Normalisation Fiscale
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-mono">
                    Commande <strong>{settlingOrder.orderNumber}</strong> • {settlingOrder.tableLabel} ({settlingOrder.clientName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAttemptClosePayment}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center text-lg font-bold transition-all"
                aria-label="Fermer la modal d'encaissement"
              >
                ×
              </button>
            </div>

            {/* If receipt has already been generated */}
            {lastFiscalReceipt ? (
              <div className="space-y-4 text-center py-2 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-stone-900 font-serif">
                    Paiement Encaissé & Facture DGI e-MECeF Certifiée !
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Signature fiscale transmise et horodatée sur la plateforme e-MECeF de la DGI Bénin.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs font-mono space-y-1.5 shadow-2xs">
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">NIM DGI :</span>
                    <strong className="text-stone-900">{lastFiscalReceipt.payment.fiscalNim}</strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">UID e-MECeF :</span>
                    <strong className="text-stone-900">{lastFiscalReceipt.payment.fiscalUid}</strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Total Encaissé :</span>
                    <strong className="text-emerald-700 font-bold">
                      {lastFiscalReceipt.payment.totalAmountXof.toLocaleString("fr-FR")} XOF
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/60 pb-1">
                    <span className="text-stone-500">Moyen Principal :</span>
                    <strong className="text-stone-900">{lastFiscalReceipt.payment.paymentMethod}</strong>
                  </div>

                  {/* Payment Breakdown detail */}
                  <div className="pt-2 text-[11px] space-y-1">
                    <p className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                      Ventilation des Règlements :
                    </p>
                    {lastFiscalReceipt.payment.cashAmountXof > 0 && (
                      <p className="flex justify-between text-stone-600">
                        <span>• Espèces :</span>
                        <span>{lastFiscalReceipt.payment.cashAmountXof.toLocaleString("fr-FR")} XOF</span>
                      </p>
                    )}
                    {lastFiscalReceipt.payment.mobileAmountXof > 0 && (
                      <p className="flex justify-between text-stone-600">
                        <span>• Mobile Money ({lastFiscalReceipt.payment.mobileOperator || "MoMo"}) :</span>
                        <span>
                          {lastFiscalReceipt.payment.mobileAmountXof.toLocaleString("fr-FR")} XOF
                          {lastFiscalReceipt.payment.mobileNumber ? ` (${lastFiscalReceipt.payment.mobileNumber})` : ""}
                        </span>
                      </p>
                    )}
                    {lastFiscalReceipt.payment.tpeAmountXof && lastFiscalReceipt.payment.tpeAmountXof > 0 ? (
                      <p className="flex justify-between text-stone-600">
                        <span>• TPE Carte Bancaire :</span>
                        <span>
                          {lastFiscalReceipt.payment.tpeAmountXof.toLocaleString("fr-FR")} XOF
                          {lastFiscalReceipt.payment.tpeReceiptRef ? ` (Ticket: ${lastFiscalReceipt.payment.tpeReceiptRef})` : ""}
                        </span>
                      </p>
                    ) : null}
                    {lastFiscalReceipt.payment.deviseAmountXof && lastFiscalReceipt.payment.deviseAmountXof > 0 ? (
                      <p className="flex justify-between text-stone-600">
                        <span>• Devise ({lastFiscalReceipt.payment.deviseCurrency || "EUR"}) :</span>
                        <span>
                          {lastFiscalReceipt.payment.deviseAmountXof.toLocaleString("fr-FR")} XOF
                          {lastFiscalReceipt.payment.deviseConvertedAmount
                            ? ` (${lastFiscalReceipt.payment.deviseConvertedAmount.toFixed(2)} ${lastFiscalReceipt.payment.deviseCurrency || "EUR"})`
                            : ""}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full sm:w-auto bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs gap-1.5 h-10 px-5 rounded-2xl shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer Ticket Fiscal</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      resetPaymentForm();
                      setSettlingOrder(null);
                    }}
                    className="w-full sm:w-auto text-xs font-bold h-10 px-5 rounded-2xl"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            ) : (
              /* Multi-tender Payment Form */
              <div className="space-y-4">
                {/* Total à Payer Header Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/60 border border-emerald-200/90 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest block">
                      Total de l&apos;Addition à Régler
                    </span>
                    <span className="text-xs text-emerald-700">
                      Règlement possible par un ou plusieurs moyens combinés
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono text-[#184f28]">
                    {settlingOrder.totalAmountXof.toLocaleString("fr-FR")} XOF
                  </span>
                </div>

                {/* 4 Stacked Payment Methods with individual inputs */}
                <div className="space-y-3">
                  {/* 1. ESPÈCES */}
                  <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-300 transition-all shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-900 block">
                            Espèces
                          </label>
                          <span className="text-[10px] text-stone-400">
                            Paiement direct en billets et pièces CFA
                          </span>
                        </div>
                      </div>
                      {/* Fast-fill full cash button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCashAmountInput(settlingOrder.totalAmountXof.toString());
                          setMomoAmountInput("");
                          setTpeAmountInput("");
                          setDeviseAmountInput("");
                        }}
                        className="text-[10px] font-bold text-[#184f28] hover:text-[#123c1f] underline"
                      >
                        Tout en espèces
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="500"
                        placeholder="Montant en XOF"
                        value={cashAmountInput}
                        onChange={(e) => setCashAmountInput(e.target.value)}
                        className="font-mono text-sm rounded-xl pl-3 pr-14 h-9"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-stone-400 font-mono">
                        XOF
                      </span>
                    </div>
                  </div>

                  {/* 2. MOBILE MONEY */}
                  <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-300 transition-all shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-900 block">
                            Mobile Money (KKiaPay Bénin)
                          </label>
                          <span className="text-[10px] text-stone-400">
                            MTN MoMo, Moov Money, Celtiis Cash, Wave
                          </span>
                        </div>
                      </div>
                      {/* Operator Badges */}
                      <div className="flex items-center gap-1">
                        {(["MTN", "MOOV", "CELTIIS", "WAVE"] as MobileMoneyOperator[]).map((op) => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => setMomoOperator(op)}
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md border transition-all ${
                              momoOperator === op
                                ? "bg-stone-900 text-white border-stone-900"
                                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="500"
                          placeholder="Montant en XOF"
                          value={momoAmountInput}
                          onChange={(e) => setMomoAmountInput(e.target.value)}
                          className="font-mono text-sm rounded-xl pl-3 pr-14 h-9"
                        />
                        <span className="absolute right-3 top-2 text-xs font-bold text-stone-400 font-mono">
                          XOF
                        </span>
                      </div>

                      <div>
                        <Input
                          type="tel"
                          placeholder="Numéro téléphone client (+229...)"
                          value={momoPhoneInput}
                          onChange={(e) => setMomoPhoneInput(e.target.value)}
                          className={`font-mono text-sm rounded-xl h-9 ${
                            parsedMomo > 0 && !isMomoPhoneValid
                              ? "border-rose-400 ring-1 ring-rose-200"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                    {parsedMomo > 0 && !isMomoPhoneValid && (
                      <p className="text-[11px] text-rose-600 font-medium">
                        * Le numéro de téléphone du client est requis pour déclencher la demande KKiaPay.
                      </p>
                    )}
                  </div>

                  {/* 3. TPE (Terminal Carte Bancaire) */}
                  <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-300 transition-all shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-900 block">
                          TPE (Terminal de Paiement Électronique / Carte)
                        </label>
                        <span className="text-[10px] text-stone-400">
                          Visa, Mastercard, cartes bancaires locales et internationales
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="500"
                          placeholder="Montant en XOF"
                          value={tpeAmountInput}
                          onChange={(e) => setTpeAmountInput(e.target.value)}
                          className="font-mono text-sm rounded-xl pl-3 pr-14 h-9"
                        />
                        <span className="absolute right-3 top-2 text-xs font-bold text-stone-400 font-mono">
                          XOF
                        </span>
                      </div>

                      <div>
                        <Input
                          type="text"
                          placeholder="Référence ticket TPE (ex: TPE-BOA-8921)"
                          value={tpeReceiptRefInput}
                          onChange={(e) => setTpeReceiptRefInput(e.target.value)}
                          className={`font-mono text-sm rounded-xl h-9 ${
                            parsedTpe > 0 && !isTpeRefValid
                              ? "border-rose-400 ring-1 ring-rose-200"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                    {parsedTpe > 0 && !isTpeRefValid && (
                      <p className="text-[11px] text-rose-600 font-medium">
                        * La référence du ticket de paiement TPE est requise pour la traçabilité comptable.
                      </p>
                    )}
                  </div>

                  {/* 4. DEVISE (Euros / Dollars) */}
                  <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-300 transition-all shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-stone-900 block">
                            Devise Étrangère
                          </label>
                          <span className="text-[10px] text-stone-400">
                            Règlement en billets devises étrangères acceptés à la caisse
                          </span>
                        </div>
                      </div>

                      {/* Currency Selector (EUR / USD) */}
                      <div className="inline-flex rounded-xl bg-stone-100 p-0.5 border border-stone-200">
                        <button
                          type="button"
                          onClick={() => setSelectedCurrency("EUR")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            selectedCurrency === "EUR"
                              ? "bg-white text-stone-900 shadow-2xs"
                              : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          EUR (€)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCurrency("USD")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            selectedCurrency === "USD"
                              ? "bg-white text-stone-900 shadow-2xs"
                              : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          USD ($)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="500"
                          placeholder="Montant en XOF"
                          value={deviseAmountInput}
                          onChange={(e) => setDeviseAmountInput(e.target.value)}
                          className="font-mono text-sm rounded-xl pl-3 pr-14 h-9"
                        />
                        <span className="absolute right-3 top-2 text-xs font-bold text-stone-400 font-mono">
                          XOF
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                        <span className="text-[11px] text-stone-500">Équivalent reçu :</span>
                        <span className="font-mono font-bold text-xs text-amber-900">
                          {parsedDevise > 0
                            ? `${deviseInputConverted.toFixed(2)} ${selectedCurrency === "EUR" ? "€" : "$"}`
                            : `0.00 ${selectedCurrency === "EUR" ? "€" : "$"}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 font-mono flex items-center justify-between pt-0.5">
                      <span>Taux officiel appliqué :</span>
                      <strong className="text-stone-800">{currentRateObj.label}</strong>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    RESTE À PAYER & DYNAMIC CONVERSION BANNER
                ========================================================================== */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    resteAPayerXof === 0 && hasEnteredAmounts
                      ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                      : resteAPayerXof < 0
                      ? "bg-rose-50 border-rose-300 text-rose-950"
                      : "bg-amber-50/90 border-amber-300 text-amber-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {resteAPayerXof === 0 && hasEnteredAmounts ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : resteAPayerXof < 0 ? (
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block">
                          {resteAPayerXof === 0 && hasEnteredAmounts
                            ? "Montant exact atteint — Prêt à encaisser"
                            : resteAPayerXof < 0
                            ? "Trop-perçu détecté"
                            : "Reste à payer"}
                        </span>
                        <span className="text-[11px] opacity-80">
                          {resteAPayerXof === 0 && hasEnteredAmounts
                            ? "Tous les moyens saisis couvrent l'intégralité de la commande."
                            : resteAPayerXof < 0
                            ? "Les montants saisis dépassent le total de l'addition."
                            : `Équivalent dans la devise sélectionnée : ${Math.max(0, resteConverted).toFixed(2)} ${selectedCurrency}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xl font-black block">
                        {Math.abs(resteAPayerXof).toLocaleString("fr-FR")} XOF
                      </span>
                      <span className="text-[10px] opacity-75">
                        Taux : {currentRateObj.rate.toLocaleString("fr-FR")} XOF / {selectedCurrency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Banner for KKiaPay or Process */}
                {kkiapayError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">Échec du paiement Mobile Money KKiaPay</p>
                      <p className="text-[11px] mt-0.5">{kkiapayError}</p>
                      <button
                        type="button"
                        onClick={() => setKkiapayError(null)}
                        className="mt-1 text-[10px] font-bold text-rose-800 underline"
                      >
                        Fermer cette alerte et corriger les informations
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress Notification when Submitting */}
                {isProcessingPayment && (
                  <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-300 text-sky-950 text-xs flex items-center gap-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                    <span className="font-medium">{paymentProgressStep}</span>
                  </div>
                )}

                {/* Single Primary Action: « Payer » & Secondary « Fermer » */}
                <div className="flex items-center gap-2.5 pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    type="button"
                    onClick={handleAttemptClosePayment}
                    disabled={isProcessingPayment}
                    className="w-1/3 text-xs font-bold h-12 rounded-2xl border-stone-300 hover:bg-stone-100"
                  >
                    Fermer
                  </Button>

                  <Button
                    variant="primary"
                    size="lg"
                    type="button"
                    onClick={handleConfirmSettlement}
                    disabled={!canSubmitPayment || isProcessingPayment}
                    className="w-2/3 bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs h-12 rounded-2xl shadow-md gap-2 transition-all disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Traitement en cours...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                        <span>Payer ({orderTotalXof.toLocaleString("fr-FR")} XOF)</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal to Prevent Accidental Loss of Entered Payment Data */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900 font-serif">
                Abandonner le règlement ?
              </h4>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Des montants ont déjà été saisis (
                <strong>{sumTenderedXof.toLocaleString("fr-FR")} XOF</strong>). Si vous fermez maintenant, la saisie sera effacée.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirmModal(false)}
                className="text-xs font-bold rounded-xl h-9"
              >
                Continuer la saisie
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancelPayment}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl h-9"
              >
                Oui, abandonner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
