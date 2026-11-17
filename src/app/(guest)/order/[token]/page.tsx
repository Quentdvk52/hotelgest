"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Coffee,
  Utensils,
  Wine,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  X,
  CreditCard,
  Smartphone,
  Banknote,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  MapPin,
  Flame,
  ChefHat,
  Search,
  Filter,
} from "lucide-react";
import { LuxuryCloche3d } from "@/components/3d/luxury-cloche-3d";

interface MenuItem {
  id: string;
  name: string;
  priceXof: number;
  unit: "BEVERAGE" | "MEAL" | "WINE";
  category: string;
  targetStationCode: "BAR" | "CUISINE" | "CAVE";
  availableStock: number;
  imageUrl?: string;
  description?: string;
}

interface CartItem {
  id: string; // unique line id
  product: MenuItem;
  quantity: number;
  accompaniment?: string;
  specialInstructions?: string;
}

export default function GuestQrOrderPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<any>(null);
  const [resource, setResource] = useState<any>(null);
  const [catalog, setCatalog] = useState<{
    beverages: MenuItem[];
    meals: MenuItem[];
    wines: MenuItem[];
  }>({
    beverages: [],
    meals: [],
    wines: [],
  });
  const [accompaniments, setAccompaniments] = useState<string[]>([]);

  // Active Menu Tab: Exactly the 3 requested tabs
  // "BOISSONS" | "REPAS" | "CAVE"
  const [activeTab, setActiveTab] = useState<"BOISSONS" | "REPAS" | "CAVE">("BOISSONS");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart & Accompaniment Modal
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Meal Customization Modal (when clicking on a meal)
  const [selectedMealForCustomization, setSelectedMealForCustomization] = useState<MenuItem | null>(null);
  const [chosenAccompaniment, setChosenAccompaniment] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  // Checkout Modal & Payment Options
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<"ONLINE_KKIAPAY" | "PAY_ON_DELIVERY">("ONLINE_KKIAPAY");
  const [momoOperator, setMomoOperator] = useState<"MTN" | "MOOV" | "CELTIIS">("MTN");
  const [momoPhone, setMomoPhone] = useState<string>("");
  const [clientFullName, setClientFullName] = useState<string>("");
  const [generalNotes, setGeneralNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmed Order Feedback
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const menuListRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch QR metadata & catalog
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/pos/qr/${token}`);
        const json = await res.json();
        if (json.success) {
          setProperty(json.data.property);
          setResource(json.data.resource);
          setCatalog(json.data.catalog);
          setAccompaniments(json.data.accompaniments || []);
          if (json.data.accompaniments && json.data.accompaniments.length > 0) {
            setChosenAccompaniment(json.data.accompaniments[0]);
          }
        } else {
          setError(json.error || "QR Code non reconnu");
        }
      } catch (err: any) {
        setError(err.message || "Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  // Current items filtered by active tab & search
  const currentItems = useMemo(() => {
    let items: MenuItem[] = [];
    if (activeTab === "BOISSONS") items = catalog.beverages;
    else if (activeTab === "REPAS") items = catalog.meals;
    else if (activeTab === "CAVE") items = catalog.wines;

    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q)
    );
  }, [activeTab, catalog, searchQuery]);

  // Cart calculations
  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotalAmountXof = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.priceXof * item.quantity, 0);
  }, [cart]);

  // Adding Item
  const handleItemClick = (item: MenuItem) => {
    if (item.unit === "MEAL") {
      // Must prompt for accompaniment
      setSelectedMealForCustomization(item);
      setChosenAccompaniment(accompaniments[0] || "Alloco fondant (Plantains frits)");
      setSpecialInstructions("");
    } else {
      // Direct add for drinks and wines
      addItemToCart(item, 1);
    }
  };

  const addItemToCart = (
    product: MenuItem,
    quantity: number,
    accompaniment?: string,
    instructions?: string
  ) => {
    setCart((prev) => {
      // For meals with specific accompaniments, check match
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.product.id === product.id &&
          ci.accompaniment === accompaniment &&
          ci.specialInstructions === instructions
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }

      return [
        ...prev,
        {
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          product,
          quantity,
          accompaniment,
          specialInstructions: instructions,
        },
      ];
    });
  };

  const updateCartLineQty = (lineId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.id === lineId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Submit Order
  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    if (paymentChoice === "ONLINE_KKIAPAY" && !momoPhone.trim()) {
      alert("Veuillez saisir votre numéro Mobile Money pour le paiement.");
      return;
    }

    setIsSubmitting(true);
    try {
      const destinationLabel =
        resource.resourceType === "TABLE"
          ? resource.tableNumber || "Table 1"
          : `Chambre ${resource.unitNumber || "101"}`;

      const payload = {
        propertyId: resource.propertyId,
        source: "QR_CLIENT",
        tableLabel: destinationLabel,
        zone: resource.spaceName || (resource.resourceType === "ROOM" ? "Service en Chambre" : "Salle Restaurant"),
        clientName: clientFullName.trim() || undefined,
        customerNotes: generalNotes.trim() || undefined,
        paymentMethod: paymentChoice,
        kkiapayPhone: paymentChoice === "ONLINE_KKIAPAY" ? momoPhone.trim() : undefined,
        kkiapayTransactionId: paymentChoice === "ONLINE_KKIAPAY" ? `KKIA-QR-${Date.now()}` : undefined,
        items: cart.map((ci) => ({
          productId: ci.product.id,
          quantity: ci.quantity,
          accompaniment: ci.accompaniment,
          specialInstructions: ci.specialInstructions,
        })),
      };

      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setConfirmedOrder(json.data);
        setCart([]);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
      } else {
        alert(json.error || "Une erreur est survenue lors de la validation.");
      }
    } catch (err: any) {
      alert("Erreur de connexion : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0d0c] text-white flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mb-4" />
        <h2 className="text-base font-serif tracking-widest text-[#d4af37] uppercase">Hôtel Le Vignoble</h2>
        <p className="text-xs text-stone-400 mt-1">Connexion à votre table & menu digital...</p>
      </div>
    );
  }

  // Error State
  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#0e0d0c] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-100 mb-2">QR Code Non Reconnu</h2>
        <p className="text-sm text-stone-400 max-w-sm mb-6 leading-relaxed">
          {error || "Ce code QR de table ou chambre est invalide ou a été désactivé par l'établissement."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-[#d4af37] text-black font-semibold text-xs tracking-wider uppercase hover:bg-amber-400 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Destination title
  const destinationText =
    resource.resourceType === "TABLE"
      ? resource.tableNumber || "Table 1"
      : `Chambre ${resource.unitNumber || "101"} (${resource.roomName || "Suite"})`;

  // 4. ORDER CONFIRMED SCREEN (GRAND LUXE)
  if (confirmedOrder) {
    const hasBeverages = confirmedOrder.items?.some(
      (it: any) => it.targetStationCode === "BAR" || it.fulfillmentUnit === "BEVERAGE"
    );
    const hasMeals = confirmedOrder.items?.some(
      (it: any) => it.targetStationCode === "CUISINE" || it.fulfillmentUnit === "MEAL"
    );
    const hasWines = confirmedOrder.items?.some(
      (it: any) => it.targetStationCode === "CAVE" || it.fulfillmentUnit === "WINE"
    );

    return (
      <div className="min-h-screen bg-[#0e0d0c] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-b from-[#181512] to-[#0f0e0c] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="text-center mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] bg-amber-400/10 px-3 py-1 rounded-full border border-[#d4af37]/30 inline-block mb-2">
              Commande Confirmée
            </span>
            <h2 className="text-2xl font-black font-serif text-white tracking-wide">
              {confirmedOrder.orderNumber}
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              {property?.name} • <span className="text-amber-300 font-semibold">{destinationText}</span>
            </p>
          </div>

          {/* Real-time Dispatch Badge Matrix */}
          <div className="space-y-2 mb-6">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Routage en direct vers vos serveurs & stations :
            </p>

            {hasBeverages && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-blue-500/30 text-xs">
                <div className="flex items-center gap-2.5">
                  <Coffee className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="font-bold text-stone-100">Barman du site</span>
                    <p className="text-[10px] text-stone-400">Boissons fraîches en préparation au comptoir</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold animate-pulse">
                  Reçu KDS
                </span>
              </div>
            )}

            {hasMeals && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-amber-500/30 text-xs">
                <div className="flex items-center gap-2.5">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-stone-100">Chef Cuisine</span>
                    <p className="text-[10px] text-stone-400">Plats chauds & accompagnements en fourneau</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold animate-pulse">
                  Reçu KDS
                </span>
              </div>
            )}

            {hasWines && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-purple-500/30 text-xs">
                <div className="flex items-center gap-2.5">
                  <Wine className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="font-bold text-stone-100">Gérant Bohicon & Cave</span>
                    <p className="text-[10px] text-stone-400">Grands crus débouchés à bonne température</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold animate-pulse">
                  Reçu Cave
                </span>
              </div>
            )}
          </div>

          {/* Payment Status Box */}
          <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs space-y-1.5 mb-6">
            <div className="flex justify-between items-center text-stone-400">
              <span>Montant Total :</span>
              <span className="text-base font-extrabold text-[#d4af37]">
                {confirmedOrder.totalAmountXof.toLocaleString("fr-FR")} XOF
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-400 pt-1 border-t border-stone-800">
              <span>Mode de Règlement :</span>
              <span className="font-semibold text-stone-200">
                {confirmedOrder.paidAmountXof > 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Payé en ligne (KKiaPay)
                  </span>
                ) : (
                  <span className="text-amber-400">À régler à la livraison</span>
                )}
              </span>
            </div>
            {confirmedOrder.payments?.[0]?.fiscalUid && (
              <div className="text-[10px] text-stone-500 font-mono pt-1">
                UID Fiscale DGI: {confirmedOrder.payments[0].fiscalUid}
              </div>
            )}
          </div>

          <button
            onClick={() => setConfirmedOrder(null)}
            className="w-full py-3 rounded-xl bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg active:scale-98"
          >
            Commander un autre article
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0d0c] text-stone-100 pb-36 font-sans antialiased selection:bg-[#d4af37] selection:text-black">
      {/* Top Fixed Brand Bar */}
      <header className="sticky top-0 z-40 bg-[#0e0d0c]/90 backdrop-blur-md border-b border-[#d4af37]/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c3c46] to-[#d4af37] flex items-center justify-center text-white font-serif font-black text-xs shadow-md">
              V
            </div>
            <div>
              <h1 className="text-sm font-bold font-serif tracking-wide text-white leading-none">
                Hôtel Le Vignoble
              </h1>
              <p className="text-[10px] text-[#d4af37] font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {property?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-[11px] font-bold">
              {destinationText}
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* 1. Interactive 3D Luxury Cloche Showcase */}
        <LuxuryCloche3d
          propertyName={property?.name || "Hôtel Le Vignoble"}
          tableOrRoom={destinationText}
          onExploreMenu={() => {
            menuListRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* 2. Three Main Tabs: Exactly « Boissons », « Repas », « Cave » */}
        <div ref={menuListRef} className="pt-2">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-stone-900/90 border border-[#d4af37]/25 shadow-lg">
            <button
              onClick={() => setActiveTab("BOISSONS")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "BOISSONS"
                  ? "bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-md"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Boissons</span>
            </button>

            <button
              onClick={() => setActiveTab("REPAS")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "REPAS"
                  ? "bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-md"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Repas</span>
            </button>

            <button
              onClick={() => setActiveTab("CAVE")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "CAVE"
                  ? "bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-md"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
              }`}
            >
              <Wine className="w-3.5 h-3.5" />
              <span>Cave</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            placeholder={`Rechercher dans ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-900/60 border border-stone-800 focus:border-[#d4af37]/60 text-xs text-white placeholder-stone-500 focus:outline-none transition-colors"
          />
        </div>

        {/* 3. Catalog Items List */}
        <div className="space-y-3">
          {currentItems.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs rounded-2xl bg-stone-950/40 border border-stone-900">
              Aucun produit disponible dans cette catégorie pour le moment.
            </div>
          ) : (
            currentItems.map((item) => {
              // Count in cart
              const inCartCount = cart
                .filter((ci) => ci.product.id === item.id)
                .reduce((s, ci) => s + ci.quantity, 0);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#181512] to-[#12100e] border border-stone-800/80 hover:border-[#d4af37]/50 transition-all p-3.5 flex gap-3.5 cursor-pointer active:scale-[0.99] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.12)]"
                >
                  {/* Photo with fallback */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-900 flex-shrink-0 border border-stone-800">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600">
                        {item.unit === "MEAL" ? (
                          <Utensils className="w-7 h-7" />
                        ) : item.unit === "WINE" ? (
                          <Wine className="w-7 h-7" />
                        ) : (
                          <Coffee className="w-7 h-7" />
                        )}
                      </div>
                    )}
                    {inCartCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#d4af37] text-black font-black text-[10px] flex items-center justify-center shadow">
                        {inCartCount}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-stone-100 group-hover:text-amber-200 transition-colors leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      <span className="inline-block text-[10px] text-stone-400 mt-0.5 font-medium">
                        {item.category}
                      </span>
                      {item.unit === "MEAL" && (
                        <p className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1 font-medium">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          Accompagnement gratuit inclus au choix
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-800/60">
                      <span className="font-extrabold text-sm text-[#d4af37] tracking-tight">
                        {item.priceXof.toLocaleString("fr-FR")} XOF
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37] border border-[#d4af37]/40 text-[#d4af37] hover:text-black font-bold text-xs transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{item.unit === "MEAL" ? "Choisir" : "Ajouter"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* 4. MODAL: Meal Customization & Accompaniment Choice */}
      {selectedMealForCustomization && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#1c1815] to-[#100e0c] border-t sm:border border-[#d4af37]/40 rounded-t-3xl sm:rounded-3xl p-5 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                  Sélection Gastronomique
                </span>
                <h3 className="font-bold text-base text-stone-100">
                  {selectedMealForCustomization.name}
                </h3>
                <p className="text-xs font-extrabold text-[#d4af37] mt-0.5">
                  {selectedMealForCustomization.priceXof.toLocaleString("fr-FR")} XOF
                </p>
              </div>
              <button
                onClick={() => setSelectedMealForCustomization(null)}
                className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Accompaniment selection */}
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-amber-200 tracking-wide uppercase">
                1. Choisissez votre accompagnement (inclus) :
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accompaniments.map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => setChosenAccompaniment(acc)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                      chosenAccompaniment === acc
                        ? "bg-[#d4af37]/20 border-[#d4af37] text-amber-200 font-bold"
                        : "bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700"
                    }`}
                  >
                    <span>{acc}</span>
                    {chosenAccompaniment === acc && (
                      <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold text-stone-300">
                2. Instructions particulières pour le Chef Cuisine :
              </label>
              <input
                type="text"
                placeholder="Ex : Bien cuit, sans piment, piment vert à part..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 focus:border-[#d4af37] text-xs text-white placeholder-stone-500 focus:outline-none"
              />
            </div>

            {/* Validate */}
            <button
              onClick={() => {
                addItemToCart(
                  selectedMealForCustomization,
                  1,
                  chosenAccompaniment,
                  specialInstructions
                );
                setSelectedMealForCustomization(null);
                setIsCartOpen(true);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-lg"
            >
              Ajouter au panier • {selectedMealForCustomization.priceXof.toLocaleString("fr-FR")} XOF
            </button>
          </div>
        </div>
      )}

      {/* 5. FLOATING CART BAR (STICKY BOTTOM) */}
      {cartItemCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed bottom-4 left-0 right-0 z-30 px-4 max-w-2xl mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#1c1815] via-[#241e19] to-[#1c1815] border border-[#d4af37]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-between text-white active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-[#d4af37] text-black flex items-center justify-center font-black">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-stone-200">Voir mon panier</p>
                <p className="text-[11px] text-stone-400">
                  {cartItemCount} article{cartItemCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#d4af37]">
                {cartTotalAmountXof.toLocaleString("fr-FR")} XOF
              </span>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </div>
          </button>
        </div>
      )}

      {/* 6. BOTTOM SHEET / CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#1a1714] to-[#0e0d0c] border-t border-[#d4af37]/40 rounded-t-3xl p-5 text-white max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-bold text-base text-stone-100">Votre Sélection</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold">
                  {cartItemCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items scroll */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.map((ci) => (
                <div
                  key={ci.id}
                  className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-stone-100">{ci.product.name}</h4>
                    {ci.accompaniment && (
                      <p className="text-[11px] text-amber-300 font-medium">
                        + {ci.accompaniment}
                      </p>
                    )}
                    {ci.specialInstructions && (
                      <p className="text-[10px] text-stone-400 italic">
                        Note: {ci.specialInstructions}
                      </p>
                    )}
                    <span className="text-xs font-bold text-[#d4af37] mt-1 inline-block">
                      {(ci.product.priceXof * ci.quantity).toLocaleString("fr-FR")} XOF
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 bg-stone-800 p-1 rounded-lg">
                    <button
                      onClick={() => updateCartLineQty(ci.id, -1)}
                      className="w-7 h-7 rounded bg-stone-700 text-stone-200 flex items-center justify-center active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{ci.quantity}</span>
                    <button
                      onClick={() => updateCartLineQty(ci.id, 1)}
                      className="w-7 h-7 rounded bg-[#d4af37] text-black flex items-center justify-center active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Checkout Button */}
            <div className="pt-3 border-t border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-400">Total à régler :</span>
                <span className="text-xl font-extrabold text-[#d4af37]">
                  {cartTotalAmountXof.toLocaleString("fr-FR")} XOF
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Passer la commande & Payer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CHECKOUT MODAL: Payment Choice (Online KKiaPay vs Pay on Delivery) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#1b1714] to-[#0e0d0c] border-t sm:border border-[#d4af37]/40 rounded-t-3xl sm:rounded-3xl p-5 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                  Finalisation & Règlement
                </span>
                <h3 className="font-bold text-base text-stone-100">
                  Valider votre commande
                </h3>
                <p className="text-xs text-stone-400">
                  Destination : <span className="text-amber-300 font-semibold">{destinationText}</span>
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-amber-200 tracking-wide uppercase">
                Choisissez votre mode de règlement :
              </label>

              {/* Option 1: Payer en ligne directement */}
              <div
                onClick={() => setPaymentChoice("ONLINE_KKIAPAY")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  paymentChoice === "ONLINE_KKIAPAY"
                    ? "bg-[#d4af37]/15 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    : "bg-stone-900/60 border-stone-800 hover:border-stone-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#d4af37] flex items-center justify-center font-bold">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-100">
                        Payer directement en ligne (KKiaPay)
                      </h4>
                      <p className="text-[10px] text-stone-400">
                        Mobile Money MTN, Moov, Celtiis ou Carte Bancaire
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={paymentChoice === "ONLINE_KKIAPAY"}
                    onChange={() => setPaymentChoice("ONLINE_KKIAPAY")}
                    className="accent-[#d4af37] w-4 h-4"
                  />
                </div>

                {/* KKiaPay phone input */}
                {paymentChoice === "ONLINE_KKIAPAY" && (
                  <div className="mt-3 pt-3 border-t border-amber-400/20 space-y-2">
                    <div className="flex gap-2">
                      {(["MTN", "MOOV", "CELTIIS"] as const).map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setMomoOperator(op)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            momoOperator === op
                              ? "bg-[#d4af37] text-black"
                              : "bg-stone-800 text-stone-300"
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>

                    <input
                      type="tel"
                      placeholder="Numéro Mobile Money (ex: 97 00 11 22)"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#d4af37]/40 focus:border-[#d4af37] text-xs text-white placeholder-stone-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-stone-400">
                      Un prompt de confirmation sera instantanément envoyé sur votre mobile.
                    </p>
                  </div>
                )}
              </div>

              {/* Option 2: Payer à la livraison */}
              <div
                onClick={() => setPaymentChoice("PAY_ON_DELIVERY")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  paymentChoice === "PAY_ON_DELIVERY"
                    ? "bg-[#d4af37]/15 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    : "bg-stone-900/60 border-stone-800 hover:border-stone-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-100">
                        Payer à la livraison
                      </h4>
                      <p className="text-[10px] text-stone-400">
                        Espèces, TPE ou MoMo auprès du serveur ou valet
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={paymentChoice === "PAY_ON_DELIVERY"}
                    onChange={() => setPaymentChoice("PAY_ON_DELIVERY")}
                    className="accent-[#d4af37] w-4 h-4"
                  />
                </div>
              </div>
            </div>

            {/* Optional Customer Name & Notes */}
            <div className="space-y-2 mb-5">
              <input
                type="text"
                placeholder="Votre nom ou référence client (facultatif)"
                value={clientFullName}
                onChange={(e) => setClientFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
              />
              <input
                type="text"
                placeholder="Remarques pour la livraison (facultatif)"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Price Recap */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-stone-800 mb-4 flex items-center justify-between">
              <span className="text-xs text-stone-400">Total à payer :</span>
              <span className="text-lg font-black text-[#d4af37]">
                {cartTotalAmountXof.toLocaleString("fr-FR")} XOF
              </span>
            </div>

            {/* Final Action Button */}
            <button
              disabled={isSubmitting}
              onClick={handleConfirmOrder}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Transmission en cours...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {paymentChoice === "ONLINE_KKIAPAY"
                      ? "Payer & Envoyer en cuisine / bar"
                      : "Confirmer & Commander"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
