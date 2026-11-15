"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SEED_PROPERTIES } from "@/lib/db/seed";
import {
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Wifi,
  Waves,
  Utensils,
  Car,
  Wine,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface PropertyMeta {
  tagline: string;
  description: string;
  imageUrl: string;
  features: string[];
}

const PROPERTY_DETAILS: Record<string, PropertyMeta> = {
  "prop-bohicon-001": {
    tagline: "Carrefour Stratégique & Oasis de Sérénité",
    description:
      "Au cœur économique du département du Zou, l'Hôtel Le Vignoble Bohicon offre un cadre d'affaires et de détente incomparable. Chambres spacieuses climatisées, grande piscine extérieure, salles de conférence et restaurant panoramique.",
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Grande Piscine extérieure",
      "Salles de conférence 200 places",
      "Cave à vins climatisée",
      "Parking sécurisé 24/7",
    ],
  },
  "prop-abomey-002": {
    tagline: "Héritage Royal & Atmosphère Feutrée",
    description:
      "Face aux illustres Palais Royaux de Goho classés au patrimoine mondial de l'UNESCO, cet établissement vous plonge dans l'histoire prestigieuse du royaume de Danxômè. Havre de paix arboré, suites royales et haute gastronomie du terroir.",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Face aux Palais Royaux de Goho",
      "Jardins botaniques privatifs",
      "Suites impériales d'apparat",
      "Excursions culturelles guidées",
    ],
  },
  "prop-calavi-003": {
    tagline: "Élégance Contemporaine aux Portes de Cotonou",
    description:
      "Idéalement implanté dans la zone résidentielle d'Arconville à proximité de l'Université, Le Vignoble Abomey-Calavi allie raffinement moderne et calme absolu. Idéal pour séjours d'affaires, consultants et escales VIP.",
    imageUrl:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Fibre optique très haut débit",
      "Salons VIP & Business lounge",
      "Navette aéroport Cotonou",
      "Room service 24h/24",
    ],
  },
  "prop-zogbo-004": {
    tagline: "Étape Verdoyante & Saveurs Authentiques",
    description:
      "En bordure de la route inter-états, notre adresse de Zogbodomey constitue l'escale gourmande par excellence. Spécialités culinaires béninoises réputées, terrasses ombragées, bungalows confortables et repos réparateur en pleine nature.",
    imageUrl:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Grillades & rôtisserie réputée",
      "Espaces verts & détente",
      "Bungalows calmes et ventilés",
      "Accès direct RNIE",
    ],
  },
};

export function PropertiesSection() {
  const [activeTab, setActiveTab] = useState(SEED_PROPERTIES[0].id);

  return (
    <section id="hotels" className="py-24 sm:py-32 bg-stone-900 text-white relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#184f28]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#184f28]/40 border border-[#184f28]/70 text-[#e4c26e] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Groupe Hôtelier Le Vignoble</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white">
            Quatre Adresses de Prestige au Bénin
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed font-light">
            Chaque hôtel du groupe cultive une identité singulière, unie par l&apos;exigence
            de notre service, le confort de nos hébergements et la richesse de notre table.
          </p>
        </div>

        {/* Property Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {SEED_PROPERTIES.map((prop) => {
            const isActive = activeTab === prop.id;
            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => setActiveTab(prop.id)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 border flex items-center gap-2 ${
                  isActive
                    ? "bg-[#184f28] border-[#d4af37]/70 text-white shadow-xl shadow-[#184f28]/30 scale-105"
                    : "bg-stone-950/60 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700"
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isActive ? "text-[#d9a844]" : "text-stone-500"}`} />
                <span>{prop.city}</span>
                <span className="text-[10px] opacity-75 font-normal">({prop.code})</span>
              </button>
            );
          })}
        </div>

        {/* Selected Property Spotlight Card */}
        {(() => {
          const prop = SEED_PROPERTIES.find((p) => p.id === activeTab) || SEED_PROPERTIES[0];
          const details = PROPERTY_DETAILS[prop.id];

          return (
            <div className="bg-stone-950/80 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Photo Gallery Column */}
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[380px]">
                  <Image
                    src={details.imageUrl}
                    alt={prop.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-stone-950/80" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-[#d9a844]/50 text-[#d9a844] text-xs font-bold tracking-wide">
                      Site Officiel Le Vignoble
                    </span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold block mb-2">
                      {details.tagline}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white mb-3">
                      {prop.name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-stone-400 mb-6">
                      <MapPin className="w-4 h-4 text-[#d9a844] flex-shrink-0" />
                      <span>{prop.address}, {prop.city}, Bénin</span>
                    </div>

                    <p className="text-stone-300 text-sm leading-relaxed mb-6 font-light">
                      {details.description}
                    </p>

                    {/* Key Amenities */}
                    <div className="space-y-2 mb-8">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                        Prestations & Équipements Clés :
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-200">
                        {details.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#d9a844] flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact & Action */}
                  <div className="pt-6 border-t border-stone-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
                      <a
                        href={`tel:${prop.phone.replace(/\s+/g, "")}`}
                        className="flex items-center gap-1.5 hover:text-[#d9a844] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#d9a844]" />
                        <span>{prop.phone}</span>
                      </a>
                      <a
                        href={`mailto:${prop.email}`}
                        className="flex items-center gap-1.5 hover:text-[#d9a844] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#d9a844]" />
                        <span>{prop.email}</span>
                      </a>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <a
                        href="#reserver"
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#d9a844] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg"
                      >
                        <span>Réserver à {prop.city}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                      <Link
                        href={`/order/hg_table_${prop.code.toLowerCase()}_tbl01`}
                        className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-semibold text-xs text-center border border-stone-700 flex items-center justify-center gap-2"
                      >
                        <Utensils className="w-3.5 h-3.5 text-[#d9a844]" />
                        <span>Menu Resto {prop.code}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
