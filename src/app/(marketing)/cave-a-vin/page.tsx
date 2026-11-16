"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuxuryNavbar } from "@/components/marketing/luxury-navbar";
import { LuxuryFooter } from "@/components/marketing/luxury-footer";
import { SEED_PROPERTIES } from "@/lib/db/seed";
import {
  Wine,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Award,
  Filter,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Check,
} from "lucide-react";
import { KkiapayButton } from "@/components/payments/kkiapay-button";

export interface WineItem {
  id: string;
  name: string;
  category: "ROUGE" | "CHAMPAGNE" | "BLANC_ROSE" | "SPIRITUEUX" | "BOISSON_TERROIR";
  categoryLabel: string;
  origin: string;
  vintage: string;
  alcoholVolume: string;
  temperature: string;
  pairings: string;
  description: string;
  priceXof: number;
  imageUrl: string;
  badge?: string;
}

export interface CartItem {
  wine: WineItem;
  quantity: number;
}

const WINE_CATALOG: WineItem[] = [
  {
    id: "wine-01",
    name: "Château Vignoble Réserve Prestige",
    category: "ROUGE",
    categoryLabel: "Vin Rouge de Garde",
    origin: "Cuvée Exclusive Domaine Le Vignoble",
    vintage: "Millésime 2020",
    alcoholVolume: "13.5% vol",
    temperature: "16°C - 18°C",
    pairings: "Idéal avec l'Amiwo au Poulet Bicyclette Braisé & Grillades du Terroir",
    description:
      "Notre flacon emblématique élevé 14 mois en fûts de chêne. Robe pourpre profonde, nez expressif de fruits noirs mûrs, tanins soyeux et finale persistante toastée.",
    priceXof: 25000,
    imageUrl:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    badge: "Sélection Signature",
  },
  {
    id: "wine-02",
    name: "Champagne Moët & Chandon Brut Impérial",
    category: "CHAMPAGNE",
    categoryLabel: "Champagne de Prestige",
    origin: "Épernay, France",
    vintage: "Brut Tradition",
    alcoholVolume: "12% vol",
    temperature: "8°C - 10°C",
    pairings: "Parfait pour les apéritifs royaux, mariages et cocktails dînatoires",
    description:
      "L'expression la plus accomplie du style Moët & Chandon. Bulles fines et abondantes, bouquet radieux de pomme verte, agrumes et brioche fraîche.",
    priceXof: 65000,
    imageUrl:
      "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80",
    badge: "Grand Classique",
  },
  {
    id: "wine-03",
    name: "Champagne Veuve Clicquot Carte Jaune",
    category: "CHAMPAGNE",
    categoryLabel: "Champagne Brut",
    origin: "Reims, France",
    vintage: "Brut Réserve",
    alcoholVolume: "12% vol",
    temperature: "8°C - 10°C",
    pairings: "Accompagne sublimement nos buffets prestigieux et poissons braisés",
    description:
      "Puissance aromatique dominée par le Pinot Noir. Attaque franche et dynamique, texture crémeuse, notes de vanille et de fruits secs.",
    priceXof: 75000,
    imageUrl:
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wine-04",
    name: "Châteauneuf-du-Pape Domaine Impérial",
    category: "ROUGE",
    categoryLabel: "Grand Vin Rouge",
    origin: "Vallée du Rhône, France",
    vintage: "Millésime 2019",
    alcoholVolume: "14.5% vol",
    temperature: "16°C - 17°C",
    pairings: "Sublime notre Sauce Crincrin au Mouton Fondant et Akassa",
    description:
      "Assemblage noble de Syrah et Grenache. Corps généreux, notes d'épices douces, garrigue et cerises noires confites d'une richesse incomparable.",
    priceXof: 48000,
    imageUrl:
      "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wine-05",
    name: "Saint-Émilion Grand Cru Château Bel-Air",
    category: "ROUGE",
    categoryLabel: "Grand Cru Bordelais",
    origin: "Bordeaux, France",
    vintage: "Millésime 2018",
    alcoholVolume: "14% vol",
    temperature: "16°C - 18°C",
    pairings: "Viandes braisées, ragoûts épicés et plateaux de fromages fins",
    description:
      "Majorité Merlot offrant velouté et gourmandise. Arômes de griotte, mûre sauvage, cacao et touches de sous-bois noble.",
    priceXof: 39000,
    imageUrl:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wine-06",
    name: "Chablis Premier Cru Domaine des Vignes",
    category: "BLANC_ROSE",
    categoryLabel: "Vin Blanc Minéral",
    origin: "Bourgogne, France",
    vintage: "Millésime 2021",
    alcoholVolume: "12.5% vol",
    temperature: "10°C - 12°C",
    pairings: "Gambas grillées, carpaccio et poissons nobles du Golfe de Guinée",
    description:
      "Chardonnay pur sur sol kimméridgien. Fraîcheur éclatante, minéralité saline, notes de pierre à fusil, citron confit et fleurs blanches.",
    priceXof: 34000,
    imageUrl:
      "https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wine-07",
    name: "Minuty Prestige Rosé Côtes de Provence",
    category: "BLANC_ROSE",
    categoryLabel: "Rosé Gastronomique",
    origin: "Provence, France",
    vintage: "Millésime 2022",
    alcoholVolume: "12.5% vol",
    temperature: "9°C - 11°C",
    pairings: "Déjeuners au bord de la piscine de Bohicon et grillades estivales",
    description:
      "Robe rose pâle limpide. Nez intense d'agrumes et de petits fruits rouges, bouche minérale, vive et désaltérante.",
    priceXof: 22000,
    imageUrl:
      "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wine-08",
    name: "Champagne Dom Pérignon Vintage",
    category: "CHAMPAGNE",
    categoryLabel: "Cuvée Mythique",
    origin: "Champagne, France",
    vintage: "Millésime 2013",
    alcoholVolume: "12.5% vol",
    temperature: "10°C - 12°C",
    pairings: "Moments d'exception suprême, célébrations royales et suites VIP",
    description:
      "L'aboutissement du grand art champenois. Matière ample, tension minérale magistrale, arômes de mirabelle, eucalyptus et torréfaction subtile.",
    priceXof: 195000,
    imageUrl:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    badge: "Prestige Rare",
  },
  {
    id: "wine-09",
    name: "Cognac Hennessy VSOP Privilège",
    category: "SPIRITUEUX",
    categoryLabel: "Cognac d'Exception",
    origin: "Cognac, France",
    vintage: "Assemblage VSOP",
    alcoholVolume: "40% vol",
    temperature: "Température ambiante",
    pairings: "Dégustation feutrée au Bar Lounge en fin de soirée",
    description:
      "Équilibre parfait entre puissance et élégance. Arômes de vanille, clou de girofle, cannelle et notes boisées délicates.",
    priceXof: 55000,
    imageUrl:
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wine-10",
    name: "Rhum Vieux Agricole Pur Terroir",
    category: "SPIRITUEUX",
    categoryLabel: "Rhum Ambré de Dégustation",
    origin: "Réserve Privée des Caraïbes & Terroirs",
    vintage: "Vieilli 8 ans en fût",
    alcoholVolume: "42% vol",
    temperature: "Température ambiante ou sur glace",
    pairings: "Digestif exquis et cigares de prestige",
    description:
      "Robe cuivrée lumineuse. Arômes de fruits confits, tabac blond, caramel au beurre salé et poivre doux.",
    priceXof: 28000,
    imageUrl:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wine-11",
    name: "Cocktail Signature Le Vignoble Tropical (75 cl)",
    category: "BOISSON_TERROIR",
    categoryLabel: "Cocktail Maison Mis en Bouteille",
    origin: "Création Brigade Hôtel Le Vignoble",
    vintage: "Fraîcheur du Jour",
    alcoholVolume: "8.5% vol",
    temperature: "Servir très frais (4°C - 6°C)",
    pairings: "Accueil festif, bords de piscine et terrasses ensoleillées",
    description:
      "Le cocktail emblématique de nos 4 hôtels préparé chaque matin : fruits de la passion, ananas du plateau d'Allada, mangue et pointe de rhum ambré.",
    priceXof: 12000,
    imageUrl:
      "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80",
    badge: "Fait Maison",
  },
  {
    id: "wine-12",
    name: "Nectar de Bissap & Gingembre Frais Réserve",
    category: "BOISSON_TERROIR",
    categoryLabel: "Infusion Sans Alcool",
    origin: "Terroirs du Bénin (Zou)",
    vintage: "Élaboration Artisanale",
    alcoholVolume: "Sans alcool (0%)",
    temperature: "Glace pilée (4°C)",
    pairings: "Désaltérant pour tous les repas et pauses rafraîchissantes",
    description:
      "Fleurs d'hibiscus sélectionnées, macération lente de gingembre frais et feuilles de menthe poivrée. Un délice antioxydant naturel.",
    priceXof: 3500,
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },
];

export default function CaveAVinPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Checkout form states
  const [selectedSite, setSelectedSite] = useState<string>(SEED_PROPERTIES[0].name);
  const [serviceOption, setServiceOption] = useState<string>("RESTAURANT");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [roomOrTableNumber, setRoomOrTableNumber] = useState<string>("");
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [lastOrderRef, setLastOrderRef] = useState<string>("");

  const filteredWines =
    selectedCategory === "ALL"
      ? WINE_CATALOG
      : WINE_CATALOG.filter((w) => w.category === selectedCategory);

  const totalBottles = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPriceXof = cart.reduce((sum, item) => sum + item.wine.priceXof * item.quantity, 0);

  const getQuantity = (id: string) => quantities[id] || 1;

  const handleSetQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const addToCart = (wine: WineItem, qty: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.wine.id === wine.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      } else {
        return [...prev, { wine, quantity: qty }];
      }
    });
    showToast(`✓ ${qty}x ${wine.name} ajouté au panier !`);
  };

  const updateCartItemQty = (wineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.wine.id === wineId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (wineId: string) => {
    setCart((prev) => prev.filter((item) => item.wine.id !== wineId));
  };

  const handleDirectBuy = (wine: WineItem) => {
    addToCart(wine, getQuantity(wine.id));
    setCartOpen(true);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `CMD-CAVE-${Date.now().toString().slice(-6)}`;
    setLastOrderRef(ref);
    setOrderSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-stone-900 flex flex-col relative">
      <LuxuryNavbar />

      {/* Quick feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-[#184f28] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#d4af37]/60 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Shopping Cart Button (Always Visible) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setCartOpen(true)}
          className="relative px-5 py-3.5 rounded-2xl bg-stone-950 text-white font-bold text-xs uppercase tracking-wider shadow-2xl shadow-black/60 border border-[#d4af37]/70 hover:border-[#d4af37] flex items-center gap-3 transition-transform active:scale-95 group"
          aria-label="Voir mon panier de vins"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
            {totalBottles > 0 && (
              <span className="absolute -top-2 -right-2.5 w-5 h-5 rounded-full bg-[#184f28] text-[#d4af37] text-[10px] font-black border border-stone-900 flex items-center justify-center">
                {totalBottles}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="text-[10px] text-stone-400 font-medium">Panier Sommelier</div>
            <div className="text-sm font-black text-[#d4af37]">
              {totalPriceXof.toLocaleString("fr-FR")} XOF
            </div>
          </div>
          <span className="ml-1 px-2.5 py-1 rounded-xl bg-[#d4af37] text-stone-950 text-[10px] font-extrabold group-hover:bg-[#e4c26e] transition-colors">
            Voir & Payer →
          </span>
        </button>
      </div>

      <main className="flex-1 pt-28 pb-24">
        {/* Boutique Hero Banner */}
        <section className="relative bg-stone-950 text-white py-20 lg:py-28 overflow-hidden mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=2000&q=85"
              alt="Cave à Vins Hôtel Le Vignoble"
              fill
              priority
              className="object-cover object-center filter brightness-[0.35] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#184f28]/60 border border-[#d4af37]/50 text-[#d4af37] text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
              <Wine className="w-4 h-4" />
              <span>Boutique Officielle • Sommelerie & Grands Crus</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-white tracking-tight mb-4">
              La Cave à Vins & Champagnes
            </h1>

            <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base font-light leading-relaxed mb-8">
              Boutique officielle des 4 hôtels du Groupe Le Vignoble. Choisissez vos grands crus, champagnes, spiritueux ou boissons du terroir, ajoutez-les à votre panier et réglez en ligne ou à la livraison en chambre / table.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Conservation hygrométrique 12°C - 14°C</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Service au restaurant, en suite ou à emporter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Paiement MoMo / Carte ou à la livraison</span>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar with Category Filter Tabs & Cart Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-4 border-b border-stone-200">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: "Tous les flacons" },
                { id: "ROUGE", label: "Vins Rouges" },
                { id: "CHAMPAGNE", label: "Champagnes" },
                { id: "BLANC_ROSE", label: "Blancs & Rosés" },
                { id: "SPIRITUEUX", label: "Spiritueux" },
                { id: "BOISSON_TERROIR", label: "Boissons Terroir" },
              ].map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold tracking-wide transition-all ${
                      active
                        ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/30 border border-[#d4af37]/60"
                        : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Cart Action in Catalog Bar */}
            <button
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-[#184f28] transition-colors shadow-sm self-start md:self-auto"
            >
              <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
              <span>Panier ({totalBottles} bouteilles)</span>
              <span className="text-[#d4af37] ml-1">
                {totalPriceXof.toLocaleString("fr-FR")} XOF
              </span>
            </button>
          </div>

          {/* Grid of Wine Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWines.map((wine) => {
              const qty = getQuantity(wine.id);
              return (
                <div
                  key={wine.id}
                  className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Bottle Photography */}
                    <div className="relative h-64 w-full overflow-hidden bg-stone-900">
                      <Image
                        src={wine.imageUrl}
                        alt={wine.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                        <span className="px-3 py-1 rounded-full bg-stone-900/90 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-stone-700">
                          {wine.categoryLabel}
                        </span>
                        {wine.badge && (
                          <span className="px-3 py-1 rounded-full bg-[#184f28] text-white text-[10px] font-bold tracking-wide shadow-md">
                            {wine.badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                        <div>
                          <div className="text-2xl font-extrabold font-serif text-[#d4af37]">
                            {wine.priceXof.toLocaleString("fr-FR")} XOF
                          </div>
                          <div className="text-[11px] text-stone-300 font-light">
                            Bouteille 75 cl • TVA incluse
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="text-[11px] text-[#184f28] font-semibold uppercase tracking-wider mb-1">
                        {wine.origin} • {wine.vintage}
                      </div>
                      <h3 className="text-xl font-bold font-serif text-stone-900 mb-2 group-hover:text-[#184f28] transition-colors">
                        {wine.name}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed font-light mb-4">
                        {wine.description}
                      </p>

                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-[11px] text-stone-700 mb-4">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Degré & Service :</span>
                          <span className="font-semibold">
                            {wine.alcoholVolume} ({wine.temperature})
                          </span>
                        </div>
                        <div className="pt-1 border-t border-stone-200">
                          <span className="text-stone-500 block mb-0.5">Accord Conseillé :</span>
                          <span className="font-medium text-[#184f28]">{wine.pairings}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Cart Controls */}
                  <div className="p-6 pt-0 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                        <button
                          type="button"
                          onClick={() => handleSetQuantity(wine.id, -1)}
                          className="px-2.5 py-2 text-stone-600 hover:bg-stone-200 transition-colors"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-900 w-8 text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSetQuantity(wine.id, 1)}
                          className="px-2.5 py-2 text-stone-600 hover:bg-stone-200 transition-colors"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Add To Cart Button */}
                      <button
                        onClick={() => addToCart(wine, qty)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-[#184f28] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Ajouter au Panier</span>
                      </button>
                    </div>

                    {/* Direct Buy Button */}
                    <button
                      onClick={() => handleDirectBuy(wine)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e4c26e] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Commander & Payer Directement</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SLIDE-OVER SHOPPING CART DRAWER & CHECKOUT
           ========================================================================= */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-stone-950 border-l border-stone-800 w-full max-w-xl h-full flex flex-col justify-between text-white shadow-2xl animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-6 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#184f28]/30 border border-[#184f28]/60 text-[#d4af37] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-white">Mon Panier Sommelier</h3>
                    <p className="text-xs text-stone-400">
                      {totalBottles} bouteille{totalBottles > 1 ? "s" : ""} sélectionnée{totalBottles > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
                  aria-label="Fermer le panier"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {!orderSuccess ? (
                  cart.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 text-stone-500 flex items-center justify-center mx-auto">
                        <Wine className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-stone-300">Votre panier est vide</h4>
                      <p className="text-xs text-stone-500 max-w-xs mx-auto">
                        Parcourez notre collection de vins, champagnes et spiritueux et ajoutez vos flacons préférés.
                      </p>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="px-5 py-2.5 rounded-xl bg-[#184f28] text-white text-xs font-semibold"
                      >
                        Explorer la cave
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Items List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-stone-800">
                          <span>Articles Sélectionnés</span>
                          <button
                            onClick={() => setCart([])}
                            className="text-stone-500 hover:text-red-400 transition-colors text-[11px]"
                          >
                            Vider le panier
                          </button>
                        </div>

                        {cart.map((cartItem) => (
                          <div
                            key={cartItem.wine.id}
                            className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-3"
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                              <Image
                                src={cartItem.wine.imageUrl}
                                alt={cartItem.wine.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-white truncate font-serif">
                                {cartItem.wine.name}
                              </h5>
                              <div className="text-[10px] text-stone-400">
                                {cartItem.wine.priceXof.toLocaleString("fr-FR")} XOF / unité
                              </div>
                              <div className="text-xs font-bold text-[#d4af37] mt-0.5">
                                {(cartItem.wine.priceXof * cartItem.quantity).toLocaleString("fr-FR")} XOF
                              </div>
                            </div>

                            {/* Stepper & Trash */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQty(cartItem.wine.id, -1)}
                                  className="px-2 py-1 text-stone-400 hover:text-white"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-bold text-white">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQty(cartItem.wine.id, 1)}
                                  className="px-2 py-1 text-stone-400 hover:text-white"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(cartItem.wine.id)}
                                className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                                aria-label="Supprimer l'article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Checkout Information Form */}
                      <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4 border-t border-stone-800 text-xs">
                        <div>
                          <label className="block text-stone-300 font-semibold mb-1">
                            Établissement de retrait ou de service :
                          </label>
                          <select
                            value={selectedSite}
                            onChange={(e) => setSelectedSite(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                          >
                            {SEED_PROPERTIES.map((p) => (
                              <option key={p.id} value={p.name} className="bg-stone-900 text-white">
                                {p.name} ({p.city})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-stone-300 font-semibold mb-1">
                            Mode de consommation / livraison :
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "RESTAURANT", label: "À Table Restaurant" },
                              { id: "ROOM", label: "En Chambre (Room)" },
                              { id: "TAKEAWAY", label: "Coffret à Emporter" },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setServiceOption(opt.id)}
                                className={`py-2 px-2 rounded-xl text-[10px] font-semibold border text-center ${
                                  serviceOption === opt.id
                                    ? "bg-[#184f28] border-[#d4af37] text-white"
                                    : "bg-stone-900 border-stone-800 text-stone-400"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-300 font-semibold mb-1">
                              Nom complet du client
                            </label>
                            <input
                              type="text"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Mme / M. Bio KANHO"
                              className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-300 font-semibold mb-1">
                              Téléphone / WhatsApp
                            </label>
                            <input
                              type="tel"
                              required
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="+229 97 00 00 00"
                              className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-stone-300 font-semibold mb-1">
                            Précision Chambre / Table (Optionnel) :
                          </label>
                          <input
                            type="text"
                            value={roomOrTableNumber}
                            onChange={(e) => setRoomOrTableNumber(e.target.value)}
                            placeholder="Ex: Suite Royale 101, Table 4 Terrasse..."
                            className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                          />
                        </div>

                        {/* Order Summary Box */}
                        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-1.5">
                          <div className="flex justify-between text-stone-400">
                            <span>Total Bouteilles :</span>
                            <span className="font-bold text-white">{totalBottles}</span>
                          </div>
                          <div className="flex justify-between text-stone-400">
                            <span>Service sommellerie & TVA :</span>
                            <span className="text-emerald-400 font-bold">Inclus (0 XOF)</span>
                          </div>
                          <div className="pt-2 border-t border-stone-800 flex justify-between text-base font-bold text-[#d4af37]">
                            <span>Total à Régler :</span>
                            <span>{totalPriceXof.toLocaleString("fr-FR")} XOF</span>
                          </div>
                        </div>

                        {/* Payment CTAs */}
                        <div className="space-y-3 pt-2">
                          <KkiapayButton
                            amount={totalPriceXof}
                            type="WINE_STORE"
                            referenceId={`CAVE-${Date.now().toString().slice(-6)}`}
                            customerName={customerName || "Client Cave Le Vignoble"}
                            customerPhone={customerPhone}
                            label={`Payer en Ligne via KkiaPay (${totalPriceXof.toLocaleString("fr-FR")} XOF)`}
                            onSuccess={() => {
                              const ref = `CMD-CAVE-${Date.now().toString().slice(-6)}`;
                              setLastOrderRef(ref);
                              setOrderSuccess(true);
                              setCart([]);
                            }}
                            className="w-full py-3.5"
                          />

                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                          >
                            <Wine className="w-4 h-4 text-[#d4af37]" />
                            <span>Commander avec Règlement à la Livraison</span>
                          </button>
                        </div>
                      </form>
                    </>
                  )
                ) : (
                  /* Order Confirmation Screen */
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-bold font-serif text-white">Commande Validée avec Succès !</h4>
                    <p className="text-xs text-stone-300 leading-relaxed max-w-sm mx-auto">
                      Merci <span className="font-semibold text-white">{customerName}</span>. Votre commande de cave N°{" "}
                      <span className="font-mono text-[#d4af37] font-bold">{lastOrderRef}</span> a été transmise au sommelier de{" "}
                      <span className="text-[#d4af37] font-semibold">{selectedSite}</span>. Nos équipes vous contactent au{" "}
                      <span className="font-semibold text-white">{customerPhone}</span>.
                    </p>

                    <div className="pt-4 flex flex-col gap-2.5">
                      <a
                        href={`https://wa.me/22997001122?text=Bonjour%2C%20je%20confirme%20ma%20commande%20cave%20${lastOrderRef}%20au%20Vignoble`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Suivre ma commande sur WhatsApp (+229 97 00 11 22)</span>
                      </a>
                      <button
                        onClick={() => {
                          setOrderSuccess(false);
                          setCartOpen(false);
                          setCart([]);
                        }}
                        className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold"
                      >
                        Continuer mes achats
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-stone-950 border-t border-stone-800/80 text-[11px] text-stone-500 text-center">
                Paiements sécurisés par Mobile Money (MTN MoMo, Moov Flooz, Celtiis) et Cartes bancaires Visa / Mastercard.
              </div>
            </div>
          </div>
        )}
      </main>

      <LuxuryFooter />
    </div>
  );
}
