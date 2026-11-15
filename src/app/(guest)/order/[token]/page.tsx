"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Utensils,
  Wine,
  Coffee,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  priceXof: number;
  allergens?: string;
  targetStationCode: "CUISINE" | "BAR" | "CAVE";
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export default function GuestQrOrderPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<any>(null);
  const [resource, setResource] = useState<any>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "CUISINE" | "BAR" | "CAVE">("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/pos/qr/${token}`);
        const json = await res.json();
        if (json.success) {
          setProperty(json.data.property);
          setResource(json.data.resource);
          setMenu(json.data.menu);
        } else {
          setError(json.error || "QR Code introuvable");
        }
      } catch (err: any) {
        setError(err.message || "Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci
        );
      }
      return prev.filter((ci) => ci.item.id !== itemId);
    });
  };

  const cartTotal = cart.reduce((sum, ci) => sum + ci.item.priceXof * ci.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        propertyId: resource.propertyId,
        source: "QR_CLIENT",
        tableId: resource.tableId,
        unitId: resource.unitId,
        customerNotes,
        items: cart.map((ci) => ({
          menuItemId: ci.item.id,
          quantity: ci.quantity,
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
      } else {
        alert(json.error || "Erreur lors de l'envoi de la commande");
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf5f5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7c3c46] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-stone-600">Chargement du menu digital...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf5f5] p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">QR Code non valide</h2>
          <p className="text-sm text-stone-600 mb-6">{error || "Ce code est expiré ou n'est plus actif."}</p>
          <Link href="/">
            <Button variant="primary" className="w-full">Retour au portail</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#faf5f5] p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center bg-white shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <Badge variant="gold" className="mb-2">Commande Enregistrée</Badge>
          <h2 className="text-2xl font-black text-stone-900">{confirmedOrder.orderNumber}</h2>
          <p className="text-xs text-stone-500 mt-1 mb-6">
            Votre commande a été immédiatement transmise aux équipes en station (Cuisine / Bar / Cave).
          </p>

          <div className="bg-stone-50 p-4 rounded-xl text-left text-xs space-y-2 mb-6 border border-stone-200">
            <div className="flex justify-between font-semibold">
              <span>Emplacement :</span>
              <span className="text-stone-900">{resource.tableNumber || `Chambre ${resource.unitNumber}`}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Établissement :</span>
              <span className="text-stone-900">{property?.name}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-stone-200">
              <span>Total :</span>
              <span className="text-[#7c3c46]">{confirmedOrder.totalAmountXof.toLocaleString("fr-FR")} XOF</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setConfirmedOrder(null)}
          >
            Passer une nouvelle commande
          </Button>
        </Card>
      </div>
    );
  }

  const filteredMenu = menu.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.targetStationCode === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#faf5f5] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-stone-900 leading-tight">{property?.name}</h1>
            <p className="text-xs font-semibold text-[#7c3c46]">
              {resource.resourceType === "TABLE" ? `Table : ${resource.tableNumber}` : `Chambre : ${resource.unitNumber}`}
            </p>
          </div>
          <Badge variant="gold" className="text-xs">
            Menu Digital Direct
          </Badge>
        </div>
      </header>

      {/* Categories Filter */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button
            variant={activeTab === "ALL" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("ALL")}
          >
            Tous les mets
          </Button>
          <Button
            variant={activeTab === "CUISINE" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("CUISINE")}
            className="gap-1.5"
          >
            <Utensils className="w-3.5 h-3.5" /> Cuisine
          </Button>
          <Button
            variant={activeTab === "BAR" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("BAR")}
            className="gap-1.5"
          >
            <Coffee className="w-3.5 h-3.5" /> Bar & Cocktails
          </Button>
          <Button
            variant={activeTab === "CAVE" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("CAVE")}
            className="gap-1.5"
          >
            <Wine className="w-3.5 h-3.5" /> Cave à Vin
          </Button>
        </div>
      </div>

      {/* Menu List */}
      <main className="max-w-3xl mx-auto px-4 space-y-4">
        {filteredMenu.map((item) => {
          const cartItem = cart.find((ci) => ci.item.id === item.id);
          return (
            <Card key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-stone-900 text-base">{item.name}</h3>
                  <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider">
                    {item.targetStationCode}
                  </Badge>
                </div>
                {item.description && (
                  <p className="text-xs text-stone-500 mb-2 leading-relaxed">{item.description}</p>
                )}
                {item.allergens && item.allergens !== "aucun" && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                    ⚠️ Allergènes : {item.allergens}
                  </span>
                )}
                <div className="mt-2 text-base font-extrabold text-[#7c3c46]">
                  {item.priceXof.toLocaleString("fr-FR")} XOF
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {cartItem ? (
                  <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-700 active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{cartItem.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-lg bg-[#7c3c46] text-white shadow-sm flex items-center justify-center active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => addToCart(item)} className="gap-1.5">
                    <Plus className="w-4 h-4" /> Ajouter
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 p-4 shadow-xl">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-stone-600">
                Panier ({cart.reduce((sum, ci) => sum + ci.quantity, 0)} articles)
              </span>
              <span className="text-lg font-black text-[#7c3c46]">
                {cartTotal.toLocaleString("fr-FR")} XOF
              </span>
            </div>

            <input
              type="text"
              placeholder="Instructions particulières (ex: cuisson, sans oignon...)"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#7c3c46]"
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold text-base shadow-md"
              disabled={submitting}
              onClick={handleSubmitOrder}
            >
              {submitting ? "Transmission en cours..." : `Confirmer la commande (${cartTotal.toLocaleString("fr-FR")} XOF)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
