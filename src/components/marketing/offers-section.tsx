"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, Heart, Award, Briefcase, PartyPopper, Check, ArrowRight } from "lucide-react";

interface OfferCard {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  priceText: string;
  priceNote: string;
  imageUrl: string;
  perks: string[];
  ctaText: string;
  ctaHref: string;
}

const OFFERS: OfferCard[] = [
  {
    id: "offer-romance",
    badge: "Séjour Signature Romantique",
    title: "Escapade Royale en Duo",
    subtitle: "Suite Royale • Champagne & Vin de Réserve • Dîner aux Chandelles",
    description:
      "Une immersion féerique pour célébrer votre amour. Nuitée en Suite Royale somptueusement préparée, pétales de roses, bouteille Château Vignoble Réserve Prestige offerte et petit-déjeuner gourmand servi au lit.",
    priceText: "79 000 XOF",
    priceNote: "par nuit pour 2 personnes",
    imageUrl:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    perks: [
      "Nuit en Suite Royale avec lit King size",
      "Bouteille Château Vignoble Réserve offerte",
      "Dîner dégustation 3 services aux chandelles",
      "Départ tardif garanti jusqu'à 15h00",
    ],
    ctaText: "Réserver cette escapade",
    ctaHref: "#reserver",
  },
  {
    id: "offer-culture",
    badge: "Patrimoine & Histoire",
    title: "Séjour Impérial d'Abomey",
    subtitle: "2 Nuits • Palais Royaux UNESCO • Dîner du Terroir",
    description:
      "Découvrez les trésors historiques de la capitale des rois du Danxômè. Hébergement de charme à l'Hôtel Le Vignoble Abomey, visite guidée privée des palais et découverte de la gastronomie locale authentique.",
    priceText: "95 000 XOF",
    priceNote: "forfait complet 2 nuits",
    imageUrl:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    perks: [
      "2 nuits en Chambre Supérieure avec balcon",
      "Visite guidée privée des Palais Royaux d'Abomey",
      "Dîner traditionnel Amiwo au Poulet Bicyclette",
      "Cocktails de bienvenue du verger Vignoble",
    ],
    ctaText: "Découvrir le forfait",
    ctaHref: "#reserver",
  },
  {
    id: "offer-business",
    badge: "Exécutif & Séminaire",
    title: "Forfait Affaires & Élite",
    subtitle: "Chambre Supérieure • Salons VIP • Transfert Aéroport",
    description:
      "L'adresse de prédilection des délégations, cadres et consultants internationaux. Espace de travail ergonomique, fibre optique dédiée, salon exécutif pour réunions et navette aéroport ponctuelle.",
    priceText: "45 000 XOF",
    priceNote: "par jour et par collaborateur",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    perks: [
      "Chambre Supérieure avec bureau exécutif",
      "Fibre optique très haut débit dédiée",
      "Accès aux salles de réunion et salons VIP",
      "Service pressing express et navette aéroport",
    ],
    ctaText: "Contacter le service Affaires",
    ctaHref: "#reserver",
  },
  {
    id: "offer-events",
    badge: "Événements & Banquets",
    title: "Pack Célébration & Réception Privée",
    subtitle: "Salle Climatisée • Mobilier Napoléon • Buffet Gastronomique",
    description:
      "Pour vos mariages, anniversaires et banquets officiels de 50 à 400 convives. Formule tout-en-un comprenant la mise à disposition de la salle, le mobilier VIP, la régie technique et notre service traiteur renommé.",
    priceText: "Sur Devis",
    priceNote: "personnalisé selon vos effectifs",
    imageUrl:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    perks: [
      "Salle climatisée modulable jusqu'à 400 personnes",
      "Chaises Napoléon blanches et tables rondes 180cm",
      "Buffet prestige béninois ou cocktail dînatoire",
      "Équipe de maîtres d'hôtel dédiée",
    ],
    ctaText: "Composer mon devis événement",
    ctaHref: "/catering-equipment",
  },
];

export function OffersSection() {
  return (
    <section id="offres" className="py-24 sm:py-32 bg-[#faf7f5] text-stone-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7f2] border border-[#bcdec6] text-[#184f28] text-xs font-semibold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5 text-[#184f28]" />
            <span>Offres & Expériences Exclusives</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-stone-900">
            Des Séjours d&apos;Exception Conçus Pour Vous
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed font-light">
            Profitez de nos formules signatures réunissant le meilleur de l&apos;hospitalité,
            de la gastronomie béninoise et du patrimoine culturel du Groupe Le Vignoble.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Image banner */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <Image
                  src={offer.imageUrl}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-[#184f28] text-white text-xs font-bold tracking-wide shadow-md">
                    {offer.badge}
                  </span>
                </div>

                {/* Price Pill */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-serif text-[#d9a844]">
                      {offer.priceText}
                    </span>
                    <span className="text-xs text-stone-300 block font-light">
                      {offer.priceNote}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-stone-900 mb-1 group-hover:text-[#7c3c46] transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#7c3c46] uppercase tracking-wider mb-3">
                    {offer.subtitle}
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6 font-light">
                    {offer.description}
                  </p>

                  {/* Included Perks */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-stone-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                      Inclus dans cette offre :
                    </span>
                    {offer.perks.map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <a
                    href={offer.ctaHref}
                    className="w-full py-3 px-5 rounded-xl bg-stone-900 hover:bg-[#184f28] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
                  >
                    <span>{offer.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
