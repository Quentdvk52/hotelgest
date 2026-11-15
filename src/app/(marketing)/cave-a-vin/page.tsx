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
} from "lucide-react";
import { KkiapayButton } from "@/components/payments/kkiapay-button";

interface WineItem {
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
  const [selectedWineForOrder, setSelectedWineForOrder] = useState<WineItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [selectedSite, setSelectedSite] = useState<string>(SEED_PROPERTIES[0].name);
  const [serviceOption, setServiceOption] = useState<string>("RESTAURANT");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  const filteredWines =
    selectedCategory === "ALL"
      ? WINE_CATALOG
      : WINE_CATALOG.filter((w) => w.category === selectedCategory);

  const handleOpenOrder = (wine: WineItem) => {
    setSelectedWineForOrder(wine);
    setOrderQuantity(1);
    setOrderSuccess(false);
  };

  const handleSubmitWineOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-stone-900 flex flex-col">
      <LuxuryNavbar />

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
              Découvrez notre collection exclusive de vins de garde, champagnes de prestige, spiritueux fins
              et créations maison, conservés dans les caves climatisées des 4 établissements du Groupe Hôtel Le Vignoble.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Conservation hygrométrique 12°C - 14°C</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Service au restaurant, en chambre ou coffret à emporter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Conseils sommellerie personnalisés</span>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
            {[
              { id: "ALL", label: "Tous les flacons" },
              { id: "ROUGE", label: "Vins Rouges de Garde" },
              { id: "CHAMPAGNE", label: "Champagnes de Prestige" },
              { id: "BLANC_ROSE", label: "Vins Blancs & Rosés" },
              { id: "SPIRITUEUX", label: "Spiritueux Fins" },
              { id: "BOISSON_TERROIR", label: "Boissons du Terroir" },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wide transition-all ${
                    active
                      ? "bg-[#184f28] text-white shadow-lg shadow-[#184f28]/30 border border-[#d4af37]/60"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Grid of Wine Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWines.map((wine) => (
              <div
                key={wine.id}
                className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
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
                        <span className="font-semibold">{wine.alcoholVolume} ({wine.temperature})</span>
                      </div>
                      <div className="pt-1 border-t border-stone-200">
                        <span className="text-stone-500 block mb-0.5">Accord Conseillé :</span>
                        <span className="font-medium text-[#184f28]">{wine.pairings}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleOpenOrder(wine)}
                    className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-[#184f28] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                    <span>Commander ce flacon</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal De Commande Bouteille */}
        {selectedWineForOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white relative shadow-2xl">
              <button
                onClick={() => setSelectedWineForOrder(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              {!orderSuccess ? (
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold block mb-1">
                    Commander depuis la Cave du Vignoble
                  </span>
                  <h3 className="text-2xl font-bold font-serif mb-2">
                    {selectedWineForOrder.name}
                  </h3>
                  <p className="text-xs text-stone-400 mb-6">
                    {selectedWineForOrder.origin} • {selectedWineForOrder.vintage}
                  </p>

                  <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 mb-6 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-300">
                      <span>Prix unitaire :</span>
                      <span className="font-semibold">{selectedWineForOrder.priceXof.toLocaleString("fr-FR")} XOF</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-300">
                      <span>Nombre de bouteilles :</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                          className="w-7 h-7 rounded-lg bg-stone-800 text-white font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-white">{orderQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setOrderQuantity(orderQuantity + 1)}
                          className="w-7 h-7 rounded-lg bg-stone-800 text-white font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-bold text-[#d4af37]">
                      <span>Montant Total :</span>
                      <span>{(selectedWineForOrder.priceXof * orderQuantity).toLocaleString("fr-FR")} XOF</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitWineOrder} className="space-y-4 text-xs">
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
                        Mode de service souhaité :
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "RESTAURANT", label: "À Table" },
                          { id: "ROOM", label: "En Chambre" },
                          { id: "TAKEAWAY", label: "À Emporter" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setServiceOption(opt.id)}
                            className={`py-2 px-2 rounded-xl text-[11px] font-semibold border ${
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
                          Nom & Prénom
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Mme / M. Dossou"
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

                    <div className="space-y-3 pt-2">
                      {/* Option 1: Online direct payment via KkiaPay */}
                      <KkiapayButton
                        amount={selectedWineForOrder.priceXof * orderQuantity}
                        type="WINE_STORE"
                        referenceId={`CAVE-${Date.now().toString().slice(-6)}`}
                        customerName={customerName || "Client Cave Le Vignoble"}
                        customerPhone={customerPhone}
                        label={`Payer en Ligne via KkiaPay (${(selectedWineForOrder.priceXof * orderQuantity).toLocaleString("fr-FR")} XOF)`}
                        onSuccess={() => {
                          setOrderSuccess(true);
                        }}
                        className="w-full py-3.5"
                      />

                      {/* Option 2: Pay on delivery / service */}
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                      >
                        <Wine className="w-4 h-4 text-[#d4af37]" />
                        <span>Commander avec Règlement à la Livraison</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-stone-500 text-center font-light">
                      Paiements directs sécurisés KkiaPay par Mobile Money (MTN MoMo, Moov Flooz, Celtiis) ou Carte Bancaire.
                    </p>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2">Commande Enregistrée !</h3>
                  <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed mb-6">
                    Merci <span className="font-semibold text-white">{customerName}</span>. Le sommelier de{" "}
                    <span className="text-[#d4af37] font-semibold">{selectedSite}</span> prépare vos{" "}
                    <span className="font-semibold text-white">{orderQuantity} bouteille(s) de {selectedWineForOrder.name}</span>.
                    Vous serez contacté au <span className="font-semibold text-white">{customerPhone}</span>.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={`https://wa.me/22997001122?text=Bonjour%2C%20je%20souhaite%20confirmer%20ma%20commande%20cave%20de%20${orderQuantity}%20bouteille(s)%20de%20${encodeURIComponent(
                        selectedWineForOrder.name
                      )}%20au%20Vignoble`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Confirmer par WhatsApp (+229 97 00 11 22)</span>
                    </a>
                    <button
                      onClick={() => setSelectedWineForOrder(null)}
                      className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <LuxuryFooter />
    </div>
  );
}
