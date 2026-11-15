"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { SEED_ROOM_TYPES } from "@/lib/db/seed";
import {
  ChevronLeft,
  ChevronRight,
  Bed,
  Users,
  Maximize2,
  Tv,
  Wifi,
  Sparkles,
  Bath,
  Coffee,
  Check,
  ArrowRight,
} from "lucide-react";

interface ExtendedRoomType {
  id: string;
  name: string;
  code: string;
  capacity: number;
  basePriceXof: number;
  description: string;
  area: string;
  bedType: string;
  view: string;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
}

const EXTENDED_ROOMS: ExtendedRoomType[] = [
  {
    id: "rt-std-boh",
    name: "Chambre Standard Confort",
    code: "STD",
    capacity: 2,
    basePriceXof: 25000,
    description:
      "Chambre climatisée lumineuse, décorée avec raffinement alliant mobilier en bois noble d'Afrique et confort moderne. Idéale pour les voyageurs individuels ou les couples en court séjour.",
    area: "24 m²",
    bedType: "Lit Queen Size (160x200)",
    view: "Vue Cour Intérieure Paisible",
    imageUrl:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
    ],
    amenities: [
      "Climatisation individuelle silencieuse",
      "Salle de bain privative avec douche à l'italienne",
      "Wi-Fi très haut débit gratuit",
      "Bureau de travail ergonomique",
      "Télévision écran plat avec chaînes satellite",
      "Articles de toilette raffinés",
    ],
  },
  {
    id: "rt-dlx-boh",
    name: "Chambre Supérieure Vignoble",
    code: "SUP",
    capacity: 2,
    basePriceXof: 38000,
    description:
      "Chambre spacieuse avec balcon privatif offrant une vue dégagée sur les jardins arborés ou la piscine. Literie d'exception, espace détente et équipements haut de gamme.",
    area: "34 m²",
    bedType: "Lit Queen Size Prestige (160x200)",
    view: "Balcon Privatif Vue Piscine & Verger",
    imageUrl:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    ],
    amenities: [
      "Balcon aménagé privatif",
      "Mini-bar réassorti de boissons fraîches locales",
      "Smart TV 55 pouces (Canal+, Netflix)",
      "Machine à café expresso & sélection de thés",
      "Peignoirs douillets et chaussons brodés",
      "Coffre-fort individuel électronique",
    ],
  },
  {
    id: "rt-ste-boh",
    name: "Suite Royale Le Vignoble",
    code: "STE",
    capacity: 3,
    basePriceXof: 65000,
    description:
      "L'expérience suprême du Groupe Le Vignoble. Une suite majestueuse de 60 m² comprenant un grand salon de réception indépendant, un lit King size digne des cours royales d'Abomey et une baignoire balnéo d'angle.",
    area: "60 m²",
    bedType: "Lit King Size Impérial (200x200)",
    view: "Vue Panoramique & Jardin Privatif",
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    ],
    amenities: [
      "Grand salon de réception séparé",
      "Baignoire balnéo d'angle & douche séparée",
      "Bouteille Château Vignoble offerte à l'arrivée",
      "Service de majordome dédié sur demande",
      "Enceinte acoustique Bluetooth haut de gamme",
      "Accès VIP prioritaire au restaurant et salons",
    ],
  },
];

export function RoomsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? EXTENDED_ROOMS.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === EXTENDED_ROOMS.length - 1 ? 0 : prev + 1));
  }, []);

  // Keyboard Navigation: ArrowLeft / ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && carouselRef.current?.contains(document.activeElement)) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevSlide();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          nextSlide();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const currentRoom = EXTENDED_ROOMS[currentIndex];

  return (
    <section
      id="hebergements"
      className="py-24 sm:py-32 bg-stone-950 text-white relative overflow-hidden"
      aria-label="Hébergements et Suites"
    >
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#184f28]/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d9a844]/20 border border-[#d9a844]/40 text-[#d9a844] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Confort & Raffinement</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white">
              Hébergements & Suites de Prestige
            </h2>
            <p className="mt-3 text-stone-300 text-sm sm:text-base font-light max-w-2xl">
              Chaque chambre a été pensée comme un sanctuaire de quiétude, doté de literie haut de gamme
              et de matériaux authentiques pour sublimer votre séjour au Bénin.
            </p>
          </div>

          {/* Visible Carousel Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Chambre précédente"
              className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 hover:text-white hover:border-[#d9a844] flex items-center justify-center transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#d9a844]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-xs font-mono text-stone-400">
              <strong className="text-white text-sm">0{currentIndex + 1}</strong> / 0{EXTENDED_ROOMS.length}
            </span>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Chambre suivante"
              className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 hover:text-white hover:border-[#d9a844] flex items-center justify-center transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#d9a844]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Carousel Region */}
        <div
          ref={carouselRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Carrousel des chambres et suites"
          aria-live="polite"
          tabIndex={0}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="focus:outline-none focus:ring-2 focus:ring-[#d9a844]/50 rounded-3xl"
        >
          {/* Main Active Room Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Image Preview with Sub-Gallery */}
              <div className="lg:col-span-7 relative h-80 sm:h-96 lg:h-[500px]">
                <Image
                  src={currentRoom.imageUrl}
                  alt={currentRoom.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />

                {/* Floating Specs */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-[#d9a844]/60 text-[#d9a844] text-xs font-bold">
                    Code {currentRoom.code}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700 text-white text-xs">
                    {currentRoom.area}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <span className="text-xs text-stone-200 bg-stone-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800">
                    {currentRoom.view}
                  </span>
                </div>
              </div>

              {/* Room Detailed Information */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold">
                      Hébergement d&apos;Élite
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#d9a844]" />
                      Jusqu&apos;à {currentRoom.capacity} personnes
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white mb-2">
                    {currentRoom.name}
                  </h3>
                  <p className="text-xs text-[#deb5b8] font-medium mb-4">
                    {currentRoom.bedType}
                  </p>

                  <p className="text-stone-300 text-sm leading-relaxed mb-6 font-light">
                    {currentRoom.description}
                  </p>

                  {/* Amenities List */}
                  <div className="space-y-2 mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                      Confort & Commodités Inclus :
                    </span>
                    <div className="grid grid-cols-1 gap-2 text-xs text-stone-300">
                      {currentRoom.amenities.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#d9a844] flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price and Action Bar */}
                <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-stone-400 block">Tarif direct garanti</span>
                    <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#d9a844]">
                      {currentRoom.basePriceXof.toLocaleString("fr-FR")}{" "}
                      <span className="text-xs font-sans text-stone-300 font-normal">XOF / nuit</span>
                    </div>
                  </div>

                  <a
                    href="#reserver"
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#d9a844] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Réserver cette chambre</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Indicators (Dots) */}
          <div className="flex justify-center items-center gap-2.5 mt-8">
            {EXTENDED_ROOMS.map((room, idx) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Afficher la chambre ${idx + 1} : ${room.name}`}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? "w-8 h-2.5 bg-[#d9a844]"
                    : "w-2.5 h-2.5 bg-stone-700 hover:bg-stone-500"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
