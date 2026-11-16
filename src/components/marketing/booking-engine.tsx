"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SEED_PROPERTIES } from "@/lib/db/seed";
import {
  Calendar,
  Users,
  MapPin,
  Search,
  CheckCircle2,
  Sparkles,
  Phone,
  Bed,
  Utensils,
  Layers,
  PartyPopper,
  X,
  ArrowRight,
  ShieldCheck,
  Clock,
  Wifi,
  Tv,
  Coffee,
  Check,
} from "lucide-react";
import { KkiapayButton } from "@/components/payments/kkiapay-button";

type BookingCategory = "CHAMBRE" | "RESTAURANT" | "SALLE_CONF" | "SALLE_FETE";

interface AvailableItem {
  id: string;
  category: BookingCategory;
  name: string;
  code: string;
  capacity: number;
  capacityLabel: string;
  bedPlaces?: number;
  bedConfiguration?: string;
  basePriceXof: number;
  pricePeriodLabel: string;
  description: string;
  imageUrl: string;
  badge: string;
  amenities: string[];
}

const EXTENDED_ITEMS: Record<BookingCategory, AvailableItem[]> = {
  CHAMBRE: [
    {
      id: "rm-std",
      category: "CHAMBRE",
      name: "Chambre Standard Confort",
      code: "STD",
      capacity: 2,
      capacityLabel: "2 personnes (1 Lit Queen Size)",
      bedPlaces: 2,
      bedConfiguration: "1 Lit Queen Size (2 places)",
      basePriceXof: 25000,
      pricePeriodLabel: "par nuitée",
      description:
        "Chambre raffinée et insonorisée avec lit Queen Size douillet, salle de bain privée avec douche à l'italienne, espace bureau et climatisation silencieuse.",
      imageUrl:
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      badge: "Gamme Confort",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Eau chaude solaire",
      ],
    },
    {
      id: "rm-sup",
      category: "CHAMBRE",
      name: "Chambre Supérieure Vignoble",
      code: "SUP",
      capacity: 2,
      capacityLabel: "2 personnes (Balcon Privatif)",
      bedPlaces: 2,
      bedConfiguration: "1 Lit King Size (2 places)",
      basePriceXof: 38000,
      pricePeriodLabel: "par nuitée",
      description:
        "Chambre spacieuse avec balcon privatif meublé donnant sur le jardin paysager, mini-bar réfrigéré, smart TV 55 pouces avec bouquets Canal+ et peignoirs doux.",
      imageUrl:
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      badge: "Vue Jardin & Balcon",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Balcon privatif vue jardin",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Mini-bar réfrigéré",
        "Room-service 24h/24",
      ],
    },
    {
      id: "rm-ste",
      category: "CHAMBRE",
      name: "Suite Royale Le Vignoble",
      code: "STE",
      capacity: 3,
      capacityLabel: "3 personnes (Salon VIP & Baignoire Balnéo)",
      bedPlaces: 3,
      bedConfiguration: "1 Lit King Size + 1 Lit d'appoint (3 places)",
      basePriceXof: 65000,
      pricePeriodLabel: "par nuitée",
      description:
        "Le summum de l'art hôtelier : suite royale avec grand salon séparé de réception, lit King Size 200x200, baignoire balnéo d'angle, champagne de bienvenue et service majordome.",
      imageUrl:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
      badge: "Prestige Impérial",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Mini-bar réfrigéré",
        "Coffre-fort électronique",
        "Petit-déjeuner inclus",
        "Room-service 24h/24",
      ],
    },
    {
      id: "rm-pav",
      category: "CHAMBRE",
      name: "Pavillon VIP & Jardin Privé",
      code: "PAV",
      capacity: 4,
      capacityLabel: "4 personnes (2 Chambres & Terrasse)",
      bedPlaces: 4,
      bedConfiguration: "Pavillon 2 Chambres - 4 places",
      basePriceXof: 95000,
      pricePeriodLabel: "par nuitée",
      description:
        "Pavillon indépendant d'exception au cœur du domaine arboré. Deux chambres indépendantes, grande terrasse couverte privative et salon familial pour un séjour en toute discrétion.",
      imageUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      badge: "Exclusivité Domaine",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Salle de bain privative",
        "Balcon privatif vue jardin",
        "Mini-bar réfrigéré",
        "Petit-déjeuner inclus",
        "Room-service 24h/24",
      ],
    },
  ],
  RESTAURANT: [
    {
      id: "tbl-jardin",
      category: "RESTAURANT",
      name: "Table Panoramique sous les Tonnelles",
      code: "REST-JARDIN",
      capacity: 4,
      capacityLabel: "2 à 6 convives",
      basePriceXof: 15000,
      pricePeriodLabel: "garantie réservation (déductible des consommations)",
      description:
        "Emplacement de choix en plein air sous les tonnelles végétales, face aux jardins et à la piscine. Ambiance tamisée en soirée, idéale pour dîners romantiques ou déjeuners détendus.",
      imageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      badge: "Plein Air & Piscine",
      amenities: ["Vue Panoramique", "Carte Terroir & Grillades", "Carte des Vins Dédiée", "Service Sommelier"],
    },
    {
      id: "tbl-salon-vip",
      category: "RESTAURANT",
      name: "Salon Privé Ambassadeur (Climatisé)",
      code: "REST-VIP",
      capacity: 12,
      capacityLabel: "4 à 12 convives",
      basePriceXof: 35000,
      pricePeriodLabel: "forfait salon privé (déductible du menu)",
      description:
        "Salon intimiste luxueusement décoré, entièrement climatisé, réservé aux repas d'affaires confidentiels, déjeuners officiels ou réunions de famille haut de gamme.",
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
      badge: "Discrétion & Affaires",
      amenities: ["Intimité Absolue", "Climatisation Silencieuse", "Maître d'Hôtel Dédié", "Écran de Présentation"],
    },
    {
      id: "tbl-lounge-bar",
      category: "RESTAURANT",
      name: "Table Haute Bar Lounge & Dégustation Vins",
      code: "REST-LOUNGE",
      capacity: 6,
      capacityLabel: "2 à 6 personnes",
      basePriceXof: 10000,
      pricePeriodLabel: "déductible au bar",
      description:
        "Ambiance feutrée au cœur de notre Bar Lounge et de la Cave de garde. Dégustation au verre de nos cuvées signatures et planches de tapas béninois et fromages affinés.",
      imageUrl:
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
      badge: "Cave & Spiritueux",
      amenities: ["Cocktails Signatures", "Planches Gourmandes", "Musique d'Ambiance", "Conseil Sommelier"],
    },
  ],
  SALLE_CONF: [
    {
      id: "sal-sem-exec",
      category: "SALLE_CONF",
      name: "Salle de Séminaire Exécutive Agbangnizoun",
      code: "CONF-EXEC",
      capacity: 50,
      capacityLabel: "Jusqu'à 50 participants (Disposition Théâtre ou U)",
      basePriceXof: 85000,
      pricePeriodLabel: "par journée",
      description:
        "Espace de travail professionnel ultra-moderne avec vidéoprojecteur laser 4K, micros sans fil, climatisation performante, paperboard numérique et Wi-Fi fibre optique sécurisé.",
      imageUrl:
        "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
      badge: "Séminaires & Formations",
      amenities: ["Projecteur Laser 4K", "Micro HF & Sono Pro", "Wi-Fi Fibre Dédié", "Service Pause Café"],
    },
    {
      id: "sal-congres-vignoble",
      category: "SALLE_CONF",
      name: "Grand Palais des Congrès Le Vignoble",
      code: "CONF-PALAIS",
      capacity: 250,
      capacityLabel: "Jusqu'à 250 congressistes",
      basePriceXof: 220000,
      pricePeriodLabel: "par journée",
      description:
        "Salle plénière d'envergure avec scène surélevée, pupitre orateur officiel, cabines de traduction, régie technique son/lumière et climatisation centrale pour colloques et symposiums.",
      imageUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      badge: "Colloques & Assemblées",
      amenities: ["Scène & Pupitre Officiel", "Régie Technique Complète", "Climatisation Centrale", "Accueil & Vestiaires"],
    },
  ],
  SALLE_FETE: [
    {
      id: "sal-fete-royale",
      category: "SALLE_FETE",
      name: "Salle de Réception & Galas Les Rois d'Abomey",
      code: "FETE-ROYALE",
      capacity: 400,
      capacityLabel: "Jusqu'à 400 convives assis",
      basePriceXof: 280000,
      pricePeriodLabel: "par jour d'événement",
      description:
        "Majestueuse salle de réception climatisée aux plafonds hauts avec lustres en cristal, piste de danse centrale en marbre poli, éclairage d'ambiance architectural et office traiteur intégré.",
      imageUrl:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      badge: "Mariages & Grands Galas",
      amenities: ["Lustres & Piste de Danse", "Éclairage RGB Architectural", "Office Traiteur Équipé", "Parking Gardé 80 Places"],
    },
    {
      id: "sal-plein-air-vip",
      category: "SALLE_FETE",
      name: "Espace Jardins & Chapiteaux Cristal Plein Air",
      code: "FETE-JARDIN",
      capacity: 500,
      capacityLabel: "De 100 à 500 invités en extérieur",
      basePriceXof: 180000,
      pricePeriodLabel: "par jour d'événement",
      description:
        "Vaste pelouse verdoyante et ombragée avec possibilité de dressage de bâches 100m² ou chapiteaux cristal VIP, guirlandes guinguettes féeriques et espace cocktail sous les étoiles.",
      imageUrl:
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
      badge: "Fêtes sous les Étoiles",
      amenities: ["Pelouse Illuminée", "Bâches & Tentes Disponibles", "Bar Cocktail Extérieur", "Sonorisation Événementielle"],
    },
  ],
};

export function BookingEngine() {
  const [bookingType, setBookingType] = useState<BookingCategory>("CHAMBRE");
  const [selectedPropertyId, setSelectedPropertyId] = useState(SEED_PROPERTIES[0].id);
  const [checkIn, setCheckIn] = useState("2026-11-20");
  const [checkOut, setCheckOut] = useState("2026-11-22");
  const [adults, setAdults] = useState("2");
  const [rooms, setRooms] = useState("1");
  const [diningService, setDiningService] = useState("DINER");
  const [eventDuration, setEventDuration] = useState("1");
  const [showResults, setShowResults] = useState(false);
  const [bookingModalItem, setBookingModalItem] = useState<AvailableItem | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const selectedProperty =
    SEED_PROPERTIES.find((p) => p.id === selectedPropertyId) || SEED_PROPERTIES[0];

  // Calculate nights for hotel stays
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    setTimeout(() => {
      document.getElementById("disponibilites")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleOpenBooking = (item: AvailableItem) => {
    setBookingModalItem(item);
    setBookingSuccess(false);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  const currentAvailableList = EXTENDED_ITEMS[bookingType];

  return (
    <div id="reserver" className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Luxury Search Engine Container */}
      <div className="bg-stone-950/95 backdrop-blur-2xl border border-[#d9a844]/50 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80">
        {/* Type Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2 text-[#d9a844] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Moteur de Réservation Officiel • Meilleur Tarif Garanti</span>
          </div>

          {/* Type Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-stone-900 border border-stone-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setBookingType("CHAMBRE");
                setShowResults(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                bookingType === "CHAMBRE"
                  ? "bg-[#184f28] text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Chambres & Suites</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBookingType("RESTAURANT");
                setShowResults(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                bookingType === "RESTAURANT"
                  ? "bg-[#184f28] text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Table de Restaurant</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBookingType("SALLE_CONF");
                setShowResults(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                bookingType === "SALLE_CONF"
                  ? "bg-[#184f28] text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Salles de Réunion</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBookingType("SALLE_FETE");
                setShowResults(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                bookingType === "SALLE_FETE"
                  ? "bg-[#184f28] text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span>Salles de Fête & Mariage</span>
            </button>
          </div>
        </div>

        {/* Dynamic Search Form Based on Booking Type */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Column 1: Property / Destination */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 hover:border-[#d9a844]/60 transition-colors">
            <label className="block text-[11px] font-medium text-stone-400 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#d9a844]" /> Établissement Hôte
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
            >
              {SEED_PROPERTIES.map((prop) => (
                <option key={prop.id} value={prop.id} className="bg-stone-900 text-white">
                  {prop.name.replace("Hôtel Le Vignoble - ", "")} ({prop.city})
                </option>
              ))}
            </select>
          </div>

          {/* Column 2: Date Selector (Adapted by Type) */}
          {bookingType === "CHAMBRE" ? (
            <div className="grid grid-cols-2 gap-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-3 hover:border-[#d9a844]/60 transition-colors">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#d9a844]" /> Arrivée
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Départ
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          ) : bookingType === "RESTAURANT" ? (
            <div className="grid grid-cols-2 gap-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-3 hover:border-[#d9a844]/60 transition-colors">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#d9a844]" /> Date du Repas
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Service
                </label>
                <select
                  value={diningService}
                  onChange={(e) => setDiningService(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="DEJEUNER" className="bg-stone-900 text-white">Déjeuner (12h-15h)</option>
                  <option value="DINER" className="bg-stone-900 text-white">Dîner (19h-23h)</option>
                  <option value="BRUNCH" className="bg-stone-900 text-white">Brunch (Dimanche 11h-17h)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-3 hover:border-[#d9a844]/60 transition-colors">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#d9a844]" /> Date Événement
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Durée
                </label>
                <select
                  value={eventDuration}
                  onChange={(e) => setEventDuration(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="1" className="bg-stone-900 text-white">1 Journée</option>
                  <option value="2" className="bg-stone-900 text-white">2 Journées</option>
                  <option value="3" className="bg-stone-900 text-white">3+ Journées</option>
                  <option value="DEMI" className="bg-stone-900 text-white">Demi-journée</option>
                </select>
              </div>
            </div>
          )}

          {/* Column 3: Capacity / Number of Guests */}
          <div className="grid grid-cols-2 gap-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-3 hover:border-[#d9a844]/60 transition-colors">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#d9a844]" />
                {bookingType === "CHAMBRE"
                  ? "Voyageurs"
                  : bookingType === "RESTAURANT"
                  ? "Couverts"
                  : "Invités"}
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
              >
                {bookingType === "CHAMBRE" ? (
                  <>
                    <option value="1" className="bg-stone-900 text-white">1 Adulte</option>
                    <option value="2" className="bg-stone-900 text-white">2 Adultes</option>
                    <option value="3" className="bg-stone-900 text-white">3 Adultes</option>
                    <option value="4" className="bg-stone-900 text-white">4 Adultes</option>
                  </>
                ) : bookingType === "RESTAURANT" ? (
                  <>
                    <option value="2" className="bg-stone-900 text-white">2 Couverts</option>
                    <option value="4" className="bg-stone-900 text-white">4 Couverts</option>
                    <option value="6" className="bg-stone-900 text-white">6 Couverts</option>
                    <option value="8" className="bg-stone-900 text-white">8 Couverts</option>
                    <option value="12" className="bg-stone-900 text-white">12+ Salon VIP</option>
                  </>
                ) : (
                  <>
                    <option value="30" className="bg-stone-900 text-white">30 personnes</option>
                    <option value="50" className="bg-stone-900 text-white">50 personnes</option>
                    <option value="100" className="bg-stone-900 text-white">100 personnes</option>
                    <option value="200" className="bg-stone-900 text-white">200 personnes</option>
                    <option value="400" className="bg-stone-900 text-white">400+ personnes</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">
                {bookingType === "CHAMBRE" ? "Chambres" : "Configuration"}
              </label>
              <select
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="w-full bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
              >
                {bookingType === "CHAMBRE" ? (
                  <>
                    <option value="1" className="bg-stone-900 text-white">1 Chambre</option>
                    <option value="2" className="bg-stone-900 text-white">2 Chambres</option>
                    <option value="3" className="bg-stone-900 text-white">3 Chambres</option>
                  </>
                ) : (
                  <>
                    <option value="STD" className="bg-stone-900 text-white">Standard VIP</option>
                    <option value="BANQUET" className="bg-stone-900 text-white">Banquet & Dîner</option>
                    <option value="THEATRE" className="bg-stone-900 text-white">Conférence / U</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Column 4: Submit Button */}
          <div className="flex items-center">
            <button
              type="submit"
              className="w-full h-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#d9a844] via-[#e4c26e] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-sm tracking-wide uppercase shadow-xl shadow-[#d9a844]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Search className="w-4 h-4 text-stone-950" />
              <span>Vérifier les disponibilités</span>
            </button>
          </div>
        </form>

        {/* Assurance Sub-Bar */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between text-xs text-stone-400 px-1 pt-2 border-t border-stone-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d9a844]" />
            <span>Tarifs directs sans intermédiaire • Annulation flexible</span>
          </div>
          <div className="text-[#d9a844] font-medium hidden sm:block">
            Conciergerie 24/7 : {selectedProperty.phone}
          </div>
        </div>
      </div>

      {/* =========================================================================
          LIVE RESULTS SHOWCASE WITH LARGE, HIGH-QUALITY PHOTOS AND DETAILS
         ========================================================================= */}
      {showResults && (
        <div
          id="disponibilites"
          className="mt-8 bg-stone-900/98 border border-stone-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-white shadow-2xl animate-in fade-in-50 duration-300"
        >
          {/* Header of results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold">
                  Disponibilités Confirmées en Temps Réel
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                  {bookingType === "CHAMBRE"
                    ? "Hébergements Libres"
                    : bookingType === "RESTAURANT"
                    ? "Tables Disponibles"
                    : "Salles Réservables"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {selectedProperty.name} ({selectedProperty.city})
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {bookingType === "CHAMBRE" ? (
                  <>
                    Séjour de {nights} nuit{nights > 1 ? "s" : ""} du{" "}
                    <span className="text-stone-200 font-semibold">{checkIn}</span> au{" "}
                    <span className="text-stone-200 font-semibold">{checkOut}</span> • {adults} voyageur{Number(adults) > 1 ? "s" : ""} • {rooms} chambre{Number(rooms) > 1 ? "s" : ""}
                  </>
                ) : bookingType === "RESTAURANT" ? (
                  <>
                    Service {diningService} du <span className="text-stone-200 font-semibold">{checkIn}</span> • Pour {adults} convives
                  </>
                ) : (
                  <>
                    Événement prévu le <span className="text-stone-200 font-semibold">{checkIn}</span> • Capacité environ {adults} personnes
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`tel:${selectedProperty.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700"
              >
                <Phone className="w-3.5 h-3.5 text-[#d9a844]" />
                <span>{selectedProperty.phone}</span>
              </a>
              <button
                onClick={() => setShowResults(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cards List: Large, wide luxury presentations with genuine photography */}
          <div className="space-y-6 mt-6">
            {currentAvailableList.map((item) => {
              const totalPrice =
                bookingType === "CHAMBRE"
                  ? item.basePriceXof * nights * Number(rooms)
                  : item.basePriceXof;

              return (
                <div
                  key={item.id}
                  className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden hover:border-[#d9a844]/60 transition-all shadow-xl grid grid-cols-1 lg:grid-cols-12 group"
                >
                  {/* Photo Column: Generous, clear, visible */}
                  <div className="relative h-64 lg:h-auto lg:col-span-5 overflow-hidden bg-stone-900">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent lg:hidden" />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-stone-950/90 text-[10px] font-bold uppercase tracking-wider text-[#d9a844] border border-[#d9a844]/40 backdrop-blur-md">
                        {item.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 lg:hidden">
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
                      </span>
                    </div>
                  </div>

                  {/* Details Column: Wide, complete typography and pricing */}
                  <div className="p-6 sm:p-7 lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          {selectedProperty.name}
                        </span>
                        <span className="hidden lg:flex text-xs text-emerald-400 font-semibold items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmé disponible
                        </span>
                      </div>

                      <h4 className="text-xl sm:text-2xl font-bold font-serif text-white group-hover:text-[#d9a844] transition-colors">
                        {item.name}
                      </h4>

                      <p className="text-xs sm:text-sm text-stone-300 font-light mt-2 leading-relaxed">
                        {item.description}
                      </p>

                      {bookingType === "CHAMBRE" ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#d9a844] font-medium">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800">
                            <Bed className="w-3.5 h-3.5 text-[#d9a844]" />
                            <span>{item.bedConfiguration || item.capacityLabel}</span>
                          </span>
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800">
                            <Users className="w-3.5 h-3.5 text-[#d9a844]" />
                            <span>Capacité max : {item.capacity} pers.</span>
                          </span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 text-xs text-[#d9a844] font-medium">
                          <Users className="w-3.5 h-3.5" />
                          <span>Capacité : {item.capacityLabel}</span>
                        </div>
                      )}

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-stone-800/80">
                        {item.amenities.map((am, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-200 font-medium"
                          >
                            <Check className="w-3 h-3 text-[#d9a844]" />
                            <span>{am}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Pricing & Action Section */}
                    <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <div className="text-2xl sm:text-3xl font-black text-[#d9a844] font-serif">
                          {totalPrice.toLocaleString("fr-FR")} XOF
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {bookingType === "CHAMBRE" ? (
                            <>
                              ({item.basePriceXof.toLocaleString("fr-FR")} XOF / nuitée • Total pour {nights} nuit{nights > 1 ? "s" : ""})
                            </>
                          ) : (
                            <>({item.pricePeriodLabel})</>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenBooking(item)}
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d9a844] via-[#e4c26e] to-[#c59b27] hover:opacity-95 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#d9a844]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span>
                          {bookingType === "CHAMBRE"
                            ? "Sélectionner cette Chambre"
                            : bookingType === "RESTAURANT"
                            ? "Réserver cette Table"
                            : "Réserver cette Salle"}
                        </span>
                        <ArrowRight className="w-4 h-4 text-stone-950" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation & Payment Modal */}
      {bookingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setBookingModalItem(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg"
              aria-label="Fermer la modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccess ? (
              <div>
                <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold block mb-1">
                  Finaliser votre réservation officielle
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif mb-2">
                  {bookingModalItem.name}
                </h3>
                <p className="text-xs text-stone-400 mb-6">
                  {selectedProperty.name} • {selectedProperty.city}
                </p>

                {/* Booking summary box */}
                <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 mb-6 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-300">
                    <span>Prestation :</span>
                    <span className="font-semibold text-white">
                      {bookingType === "CHAMBRE"
                        ? "Hébergement Hôtelier"
                        : bookingType === "RESTAURANT"
                        ? "Table Restaurant"
                        : "Salle d'Événement"}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Date & Période :</span>
                    <span>
                      {bookingType === "CHAMBRE"
                        ? `${checkIn} au ${checkOut} (${nights} nuits)`
                        : `${checkIn} (${diningService})`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-bold text-[#d9a844]">
                    <span>Montant total estimé :</span>
                    <span>
                      {(bookingType === "CHAMBRE"
                        ? bookingModalItem.basePriceXof * nights * Number(rooms)
                        : bookingModalItem.basePriceXof
                      ).toLocaleString("fr-FR")}{" "}
                      XOF
                    </span>
                  </div>
                </div>

                <form onSubmit={handleConfirmReservation} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">
                      Nom complet du client principal
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Mme / M. Bio KANHO..."
                      className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#d9a844]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Téléphone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+229 97 00 00 00"
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#d9a844]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="client@domaine.bj"
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#d9a844]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Option 1: Immediate KkiaPay Online Payment */}
                    <KkiapayButton
                      amount={
                        bookingType === "CHAMBRE"
                          ? bookingModalItem.basePriceXof * nights * Number(rooms)
                          : bookingModalItem.basePriceXof
                      }
                      type="ROOM_BOOKING"
                      referenceId={`RES-${selectedProperty.code}-${Date.now().toString().slice(-6)}`}
                      customerName={guestName || "Client Hôtel Le Vignoble"}
                      customerPhone={guestPhone}
                      customerEmail={guestEmail}
                      label={`Payer en Ligne avec KkiaPay (${(bookingType === "CHAMBRE"
                        ? bookingModalItem.basePriceXof * nights * Number(rooms)
                        : bookingModalItem.basePriceXof
                      ).toLocaleString("fr-FR")} XOF)`}
                      onSuccess={() => {
                        setBookingSuccess(true);
                      }}
                      className="w-full py-3.5"
                    />

                    {/* Option 2: Pay on arrival */}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Ou Réserver sans paiement immédiat (Règlement sur place)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-stone-500 text-center">
                    Paiements en ligne sécurisés par KkiaPay (MTN MoMo, Moov Flooz, Celtiis, Visa, Mastercard).
                  </p>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif mb-2">Réservation Enregistrée !</h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed mb-6">
                  Merci <span className="font-semibold text-white">{guestName}</span>. Notre conciergerie à{" "}
                  <span className="text-[#d9a844] font-semibold">{selectedProperty.name}</span> a bien enregistré votre demande pour{" "}
                  <span className="font-semibold text-white">{bookingModalItem.name}</span>. Un agent vous contacte au{" "}
                  <span className="font-semibold text-white">{guestPhone}</span> pour finaliser tous les détails.
                </p>

                <button
                  onClick={() => setBookingModalItem(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
