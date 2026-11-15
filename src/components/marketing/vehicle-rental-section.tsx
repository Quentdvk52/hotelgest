"use client";

import React from "react";
import Image from "next/image";
import { Car, ShieldCheck, Clock, MapPin, Sparkles, Check, Phone, ArrowRight } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  category: string;
  capacity: string;
  features: string[];
  priceText: string;
  priceNote: string;
  imageUrl: string;
}

const FLEET: Vehicle[] = [
  {
    id: "veh-sedan",
    name: "Berline Exécutive Prestige",
    category: "Berline VIP avec Chauffeur",
    capacity: "3 Passagers • 2 Bagages Grands Formats",
    features: [
      "Chauffeur professionnel en livrée bilingue",
      "Climatisation bi-zone & sièges en cuir",
      "Wi-Fi très haut débit & chargeurs mobiles à bord",
      "Bouteilles d'eau minérale & lingettes fraîches offertes",
    ],
    priceText: "45 000 XOF",
    priceNote: "forfait transfert aéroport ou demi-journée",
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "veh-suv",
    name: "SUV Tout-Terrain 4x4 Impérial",
    category: "SUV Grand Confort avec Chauffeur",
    capacity: "4 Passagers • 4 Bagages Grands Formats",
    features: [
      "Idéal pour circuits touristiques (Abomey, Ouidah, Ganvié)",
      "Franchissement tout confort et sécurité renforcée",
      "Chauffeur guide maîtrisant l'histoire royale et les axes régionaux",
      "Rafraîchissements et encas du verger Vignoble",
    ],
    priceText: "70 000 XOF",
    priceNote: "mise à disposition journée complète (carburant inclus)",
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "veh-van",
    name: "Minivan Exécutif & Délégation VIP",
    category: "Transport Collectif Haut de Gamme",
    capacity: "8 à 14 Passagers • Nombreux Bagages",
    features: [
      "Parfait pour cortèges de mariage, délégations d'affaires et séminaires",
      "Espace spacieux, vitres teintées et climatisation renforcée",
      "Accueil personnalisé avec pancarte à l'Aéroport Cadjehoun",
      "Coordination logistique avec les réceptions de nos 4 hôtels",
    ],
    priceText: "90 000 XOF",
    priceNote: "forfait transfert groupe ou journée complète",
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
  },
];

export function VehicleRentalSection() {
  return (
    <section id="location" className="py-24 sm:py-32 bg-[#faf7f5] text-stone-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7f2] border border-[#bcdec6] text-[#184f28] text-xs font-semibold uppercase tracking-wider mb-4">
            <Car className="w-3.5 h-3.5" />
            <span>Mobilité & Flotte Privée</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-stone-900">
            Location de Véhicules & Chauffeurs Privés
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed font-light">
            Voyagez en toute quiétude à travers le Bénin. Notre flotte de véhicules de prestige
            assure vos transferts depuis l&apos;Aéroport International de Cotonou-Cadjehoun vers tous nos sites
            avec ponctualité et discrétion.
          </p>
        </div>

        {/* Fleet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {FLEET.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-3xl border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-stone-900/90 text-white text-xs font-bold">
                    {vehicle.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xl sm:text-2xl font-bold font-serif text-[#d9a844]">
                    {vehicle.priceText}
                  </span>
                  <span className="text-[11px] text-stone-300 block font-light">
                    {vehicle.priceNote}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold font-serif text-stone-900 mb-1">
                    {vehicle.name}
                  </h3>
                  <p className="text-xs text-[#7c3c46] font-semibold mb-4">
                    {vehicle.capacity}
                  </p>

                  <div className="space-y-2 mb-6 pt-3 border-t border-stone-100">
                    {vehicle.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <a
                    href="https://wa.me/22997001122?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20un%20v%C3%A9hicule%20avec%20chauffeur%20au%20Vignoble"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-[#184f28] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#d9a844]" />
                    <span>Réserver ce véhicule</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Airport Transfer Guarantee */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900">
                Service Navette Aéroport Cotonou 24h/24 & 7j/7
              </h4>
              <p className="text-xs text-stone-600 mt-0.5 max-w-xl">
                Votre chauffeur vous attend dès la sortie de la zone sous douane de l&apos;Aéroport Cadjehoun
                avec pancarte nominative, prise en charge de vos bagages et acheminement serein vers Bohicon, Abomey, Calavi ou Zogbodomey.
              </p>
            </div>
          </div>
          <a
            href="tel:+22997001122"
            className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold uppercase tracking-wider flex items-center gap-2 flex-shrink-0"
          >
            <span>Ligne Transfert VIP</span>
            <ArrowRight className="w-4 h-4 text-[#7c3c46]" />
          </a>
        </div>
      </div>
    </section>
  );
}
