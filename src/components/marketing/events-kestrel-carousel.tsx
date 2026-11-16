"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Ticket,
} from "lucide-react";

export interface HotelEvent {
  id: string;
  title: string;
  category: "BRUNCH" | "SOIREE_PRESTIGE" | "SEMINAIRE" | "GALA" | "OENOLOGIE";
  roleWord: string;
  tag: string;
  dateText: string;
  timeText: string;
  propertyName: string;
  city: string;
  pricePerPersonXof: number;
  expectedGuests: number;
  remainingSeats: number;
  description: string;
  highlights: string[];
  imageUrl: string;
}

export const HOTEL_EVENTS: HotelEvent[] = [
  {
    id: "evt-01",
    title: "Le Grand Brunch Dominical du Terroir",
    category: "BRUNCH",
    roleWord: "Brunches Dominicaux",
    tag: "#BrunchVignoble",
    dateText: "Tous les Dimanches",
    timeText: "11h30 - 16h00",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    city: "Bohicon (Jardins & Piscine)",
    pricePerPersonXof: 18500,
    expectedGuests: 120,
    remainingSeats: 24,
    description:
      "Buffet gastronomique à volonté célébrant les saveurs béninoises et continentales : grillades au feu de bois, agouti braisé, amiwo royal, carpes fraîches, et fontaine de jus naturels de nos vergers.",
    highlights: ["Orchestre acoustique live", "Espace enfants & animations", "Cocktail de bienvenue offert"],
    imageUrl:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "evt-02",
    title: "Soirée Prestige Oenologie & Dégustation Grands Crus",
    category: "OENOLOGIE",
    roleWord: "Soirées Gastronomiques",
    tag: "#OenologieVignoble",
    dateText: "Vendredi 28 Novembre 2026",
    timeText: "19h30 - 23h30",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    city: "Bohicon (Espace Cave à Vin)",
    pricePerPersonXof: 35000,
    expectedGuests: 40,
    remainingSeats: 8,
    description:
      "Une immersion oenologique exceptionnelle animée par notre maître sommelier. Dégustation de 5 millésimes d'exception accompagnés de mets royaux préparés sur mesure par notre chef exécutif.",
    highlights: ["Accords mets & vins en 5 services", "Sélection de champagnes millésimés", "Guide de dégustation personnalisé"],
    imageUrl:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "evt-03",
    title: "Gala Royal & Nuit Historique d'Abomey",
    category: "GALA",
    roleWord: "Galas Royaux",
    tag: "#GalaRoyal",
    dateText: "Samedi 12 Décembre 2026",
    timeText: "20h00 - 02h00",
    propertyName: "Hôtel Le Vignoble - Abomey",
    city: "Abomey (Cité Historique)",
    pricePerPersonXof: 45000,
    expectedGuests: 250,
    remainingSeats: 35,
    description:
      "Une soirée de prestige sous les étoiles de la cité des Rois. Dîner de gala impérial sous cloche dorée, danses traditionnelles de cour, récital de kora et défilé des arts de la table royaux.",
    highlights: ["Tenue de soirée ou traditionnelle royale", "Dîner gastronomique 4 services", "Accueil VIP par nos hôtesses"],
    imageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "evt-04",
    title: "Séminaire Exécutif & Sommet des Décideurs",
    category: "SEMINAIRE",
    roleWord: "Séminaires Exécutifs",
    tag: "#SeminaireVIP",
    dateText: "18 - 19 Décembre 2026",
    timeText: "08h30 - 18h00",
    propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
    city: "Abomey-Calavi (Salons d'Honneur)",
    pricePerPersonXof: 28000,
    expectedGuests: 80,
    remainingSeats: 15,
    description:
      "Cadre de travail ultra-connecté et paisible aux portes de Cotonou pour vos colloques, ateliers stratégiques et conseils d'administration. Équipements audiovisuels 4K et pauses café gourmandes.",
    highlights: ["Salles modulables insonorisées", "Déjeuner buffet d'affaires inclus", "Navettes aéroport Cotonou dédiées"],
    imageUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "evt-05",
    title: "Soirée Romantique Féerique sous les Étoiles",
    category: "SOIREE_PRESTIGE",
    roleWord: "Célébrations Privées",
    tag: "#PrestigeRomance",
    dateText: "Chaque Samedi Soir",
    timeText: "19h00 - 23h00",
    propertyName: "Hôtel Le Vignoble - Zogbodomey",
    city: "Zogbodomey (Pavillons du Verger)",
    pricePerPersonXof: 22000,
    expectedGuests: 50,
    remainingSeats: 12,
    description:
      "Dîner intime aux chandelles au bord des bassins d'eau claire. Ambiance feutrée, violoniste en direct et menu à la carte sublimé par nos bouteilles de vin rouge de garde.",
    highlights: ["Table décorée de pétales frais", "Coupe de champagne Vignoble offerte", "Intimité garantie"],
    imageUrl:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
  },
];

export function EventsKestrelCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [isPaused, setIsPaused] = useState(false);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HotelEvent>(HOTEL_EVENTS[0]);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    guestsCount: 2,
    notes: "",
  });

  // Filter events by hashtag chip
  const displayedEvents =
    selectedTag === "ALL"
      ? HOTEL_EVENTS
      : HOTEL_EVENTS.filter((e) => e.tag === selectedTag);

  const currentEvent = displayedEvents[currentIndex % displayedEvents.length] || HOTEL_EVENTS[0];

  // Autoplay timer
  useEffect(() => {
    if (isPaused || displayedEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayedEvents.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, displayedEvents.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayedEvents.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayedEvents.length) % displayedEvents.length);
  };

  const openRsvp = (event: HotelEvent) => {
    setSelectedEvent(event);
    setRsvpSuccess(false);
    setRsvpModalOpen(true);
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpSuccess(true);
    setTimeout(() => {
      setRsvpModalOpen(false);
      setRsvpSuccess(false);
      setRsvpForm({ fullName: "", phone: "", email: "", guestsCount: 2, notes: "" });
    }, 2000);
  };

  return (
    <section
      id="evenements"
      className="relative py-24 sm:py-32 bg-[#061317] text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Glows (Kestrel style: deep teal canvas, aqua and mint accents) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#10b981]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#2dd4bf]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#d4af37]/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header Section with Rotating Dynamic Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#2dd4bf] text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" />
            Agenda & Vie de l&apos;Hôtel
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            Vivez l&apos;Excellence de nos{" "}
            <span className="bg-gradient-to-r from-[#2dd4bf] via-[#10b981] to-[#d4af37] bg-clip-text text-transparent inline-block transition-all duration-500">
              {currentEvent.roleWord}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-stone-300 font-sans leading-relaxed">
            Brunchs dominicaux, galas royaux sous les étoiles, soirées oenologiques et séminaires VIP.
            Découvrez nos rendez-vous exclusifs et réservez votre table d&apos;honneur.
          </p>

          {/* Hashtag Filter Chips (Kestrel style) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: "ALL", label: "#TousLesRendezVous" },
              { id: "#BrunchVignoble", label: "#BrunchDominical" },
              { id: "#OenologieVignoble", label: "#SoiréeOenologie" },
              { id: "#GalaRoyal", label: "#GalaRoyalAbomey" },
              { id: "#SeminaireVIP", label: "#SéminairesVIP" },
              { id: "#PrestigeRomance", label: "#SoiréeRomance" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  setSelectedTag(chip.id);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTag === chip.id
                    ? "bg-[#10b981] text-stone-950 font-bold shadow-lg shadow-[#10b981]/20 scale-105"
                    : "bg-[#0b2126] text-stone-300 hover:text-white border border-[#16383e] hover:border-[#10b981]/50"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Swappable Card Preview Stage */}
        <div className="relative bg-[#091f24]/90 border border-[#16383e] rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Image Tile (Left - 7 cols) */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden group shadow-xl">
              <Image
                src={currentEvent.imageUrl}
                alt={currentEvent.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061317] via-black/30 to-transparent" />

              {/* Event Badge Top Left */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-stone-900/85 backdrop-blur-md text-[#2dd4bf] text-xs font-bold border border-[#2dd4bf]/40">
                  {currentEvent.tag}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold shadow-sm">
                  {currentEvent.remainingSeats} places restantes
                </span>
              </div>

              {/* Event Location Bottom Left */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-stone-200">
                <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                  {currentEvent.propertyName}
                </span>
                <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  {currentEvent.timeText}
                </span>
              </div>
            </div>

            {/* Event Content & RSVP Actions (Right - 5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>{currentEvent.dateText}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                  {currentEvent.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {currentEvent.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-1.5 pt-2">
                  {currentEvent.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-stone-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and RSVP Button */}
              <div className="pt-4 border-t border-[#16383e] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-stone-400">Tarif par convive :</span>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-[#d4af37]">
                      {currentEvent.pricePerPersonXof.toLocaleString("fr-FR")}
                    </span>{" "}
                    <span className="text-xs text-stone-400 font-sans">XOF</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => openRsvp(currentEvent)}
                    className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#2dd4bf] hover:from-[#059669] hover:to-[#14b8a6] text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#10b981]/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Réserver ma place</span>
                  </button>

                  <a
                    href="tel:+22997000000"
                    className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-[#0e2a31] hover:bg-[#143b44] border border-[#1e4a54] text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Conciergerie</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls Bar (Arrows, Dots, Progress) */}
          <div className="mt-8 pt-6 border-t border-[#16383e] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {displayedEvents.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex % displayedEvents.length
                      ? "w-8 bg-[#10b981]"
                      : "w-2 bg-stone-700 hover:bg-stone-500"
                  }`}
                  aria-label={`Aller à l'évènement ${idx + 1}`}
                />
              ))}
            </div>

            {/* Event Counter & Progress hint */}
            <div className="text-xs text-stone-400 font-mono">
              Évènement {(currentIndex % displayedEvents.length) + 1} sur {displayedEvents.length}
              {isPaused && <span className="ml-2 text-[#2dd4bf]">(En pause)</span>}
            </div>

            {/* Navigation Chevrons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-[#0e2a31] hover:bg-[#143b44] border border-[#1e4a54] text-white transition-all active:scale-95"
                aria-label="Évènement précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-[#0e2a31] hover:bg-[#143b44] border border-[#1e4a54] text-white transition-all active:scale-95"
                aria-label="Évènement suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP / Booking Modal */}
      {rsvpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#091f24] border border-[#16383e] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative">
            <button
              onClick={() => setRsvpModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {rsvpSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center mx-auto mb-2 border border-[#10b981]/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white">Réservation Confirmée !</h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto">
                  Votre demande pour <strong>{selectedEvent.title}</strong> a été enregistrée avec succès.
                  Notre conciergerie vous contactera sous peu.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] block">
                    Réservation Évènement
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {selectedEvent.propertyName} • {selectedEvent.dateText}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">Votre Nom complet</label>
                    <input
                      type="text"
                      required
                      value={rsvpForm.fullName}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, fullName: e.target.value })}
                      placeholder="M. Gaston Dossou"
                      className="w-full px-3 py-2 bg-[#061317] border border-[#16383e] rounded-xl text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">Téléphone (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      value={rsvpForm.phone}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                      placeholder="+229 97 00 00 00"
                      className="w-full px-3 py-2 bg-[#061317] border border-[#16383e] rounded-xl text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={rsvpForm.email}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                      placeholder="nom@exemple.com"
                      className="w-full px-3 py-2 bg-[#061317] border border-[#16383e] rounded-xl text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">Nombre de convives</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={rsvpForm.guestsCount}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, guestsCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#061317] border border-[#16383e] rounded-xl text-xs text-white focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">Demandes particulières / Allergies</label>
                  <textarea
                    rows={2}
                    value={rsvpForm.notes}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, notes: e.target.value })}
                    placeholder="Table près de la scène, préférences alimentaires..."
                    className="w-full px-3 py-2 bg-[#061317] border border-[#16383e] rounded-xl text-xs text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#061317] border border-[#16383e] flex items-center justify-between text-xs">
                  <span className="text-stone-400">Total estimé ({rsvpForm.guestsCount} pers.) :</span>
                  <span className="font-bold text-[#d4af37] font-mono text-sm">
                    {(selectedEvent.pricePerPersonXof * rsvpForm.guestsCount).toLocaleString("fr-FR")} XOF
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRsvpModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#0e2a31] hover:bg-[#143b44] text-stone-300 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#2dd4bf] text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md"
                  >
                    Confirmer ma Réservation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
