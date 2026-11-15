"use client";

import React from "react";
import { ShieldCheck, Sparkles, RefreshCw, Headphones, Wine, Award } from "lucide-react";

export function DirectBookingPerks() {
  const perks = [
    {
      icon: <Award className="w-6 h-6 text-[#d9a844]" />,
      title: "Meilleur Tarif Garanti",
      description:
        "En réservant directement sur notre site officiel ou auprès de notre conciergerie, vous bénéficiez du tarif le plus avantageux sans frais d'intermédiaires.",
    },
    {
      icon: <Wine className="w-6 h-6 text-[#8c101c]" />,
      title: "Accueil VIP & Cocktail Offert",
      description:
        "Un cocktail signature de bienvenue vous est servi à votre arrivée, accompagné d'une corbeille de fruits frais du verger déposée dans votre chambre.",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-600" />,
      title: "Flexibilité & Annulation Sans Frais",
      description:
        "Modifiez ou annulez votre réservation sans pénalité jusqu'à 24h avant votre arrivée. Votre acompte est reportable en toute sérénité.",
    },
    {
      icon: <Headphones className="w-6 h-6 text-[#d9a844]" />,
      title: "Conciergerie Privée 24h/24",
      description:
        "Un interlocuteur dédié veille sur chaque détail de votre séjour : transferts aéroport, réservations de table, visites guidées privées et room service.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#fdfcfb] text-stone-900 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7f2] border border-[#bcdec6] text-[#184f28] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#184f28]" />
            <span>Privilèges Réservation Directe</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-stone-900">
            Pourquoi Réserver Directement chez Nous ?
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base font-light">
            Votre confiance mérite une attention exclusive dès le premier instant de votre séjour.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-center mb-4">
                  {perk.icon}
                </div>
                <h3 className="text-lg font-bold font-serif text-stone-900 mb-2">
                  {perk.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
