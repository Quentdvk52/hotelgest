"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SEED_MENU_ITEMS } from "@/lib/db/seed";
import { Utensils, Wine, GlassWater, QrCode, Sparkles, ArrowRight, Flame, Clock } from "lucide-react";

export function DiningSection() {
  const diningCategories = [
    {
      title: "Haute Gastronomie Béninoise",
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      description:
        "Une interprétation contemporaine des recettes séculaires du terroir d'Abomey et du Bénin, préparées avec des volailles fermières et ingrédients frais du marché.",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Bar Lounge & Mixologie",
      icon: <GlassWater className="w-5 h-5 text-rose-400" />,
      description:
        "Cocktails signatures créés à base de fruits tropicaux pressés minute, rhums arrangés et spiritueux de prestige servis dans une ambiance feutrée et musicale.",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Cave de Garde Climatisée",
      icon: <Wine className="w-5 h-5 text-red-500" />,
      description:
        "Une sélection exclusive de grands crus conservés sous hygrométrie et température maîtrisées pour accompagner vos déjeuners et dîners d'exception.",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section id="restaurant" className="py-24 sm:py-32 bg-stone-900 text-white relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#184f28]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#184f28]/40 border border-[#184f28]/70 text-[#e4c26e] text-xs font-semibold uppercase tracking-wider mb-4">
            <Utensils className="w-3.5 h-3.5" />
            <span>Table Gourmande & Sommelerie</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white">
            Le Restaurant, le Bar Lounge & la Cave
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed font-light">
            Une symphonie de saveurs où se rencontrent l&apos;authenticité des traditions culinaires
            du Danxômè et l&apos;art de vivre des grands hôtels de luxe.
          </p>
        </div>

        {/* 3 Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {diningCategories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-stone-950/80 border border-stone-800 rounded-3xl overflow-hidden hover:border-[#d9a844]/50 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-stone-950/80 backdrop-blur-md border border-stone-700">
                  {cat.icon}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light mb-4">
                    {cat.description}
                  </p>
                </div>
                {idx === 2 && (
                  <Link
                    href="/cave-a-vin"
                    className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-[#e4c26e] font-semibold pt-2 border-t border-stone-800"
                  >
                    <Wine className="w-3.5 h-3.5" />
                    <span>Visiter la Boutique Cave à vin →</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Authentic Signature Dishes Showcase */}
        <div className="bg-stone-950/90 border border-stone-800 rounded-3xl p-6 sm:p-10 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-800">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold block mb-1">
                La Carte Signature du Vignoble
              </span>
              <h3 className="text-2xl font-bold font-serif text-white">
                Quelques Créations Emblématiques
              </h3>
            </div>
            <Link
              href="/order/hg_table_bohicon_tbl01"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d9a844] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start sm:self-auto"
            >
              <QrCode className="w-4 h-4 text-stone-950" />
              <span>Consulter la carte & commander</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEED_MENU_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-stone-900/80 border border-stone-800/90 rounded-2xl p-5 flex flex-col justify-between hover:border-[#7c3c46]/80 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                      Station {item.targetStationCode}
                    </span>
                    {item.allergens && item.allergens !== "aucun" && (
                      <span className="text-amber-400">Allergène: {item.allergens}</span>
                    )}
                  </div>
                  <h4 className="text-base font-bold font-serif text-white mb-2 leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-light mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#d9a844]">
                    {item.priceXof.toLocaleString("fr-FR")} XOF
                  </span>
                  <Link
                    href="/order/hg_table_bohicon_tbl01"
                    className="text-xs text-stone-300 hover:text-white flex items-center gap-1 font-medium"
                  >
                    <span>Commander</span>
                    <ArrowRight className="w-3 h-3 text-[#d9a844]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR In-House Experience Banner */}
        <div className="bg-gradient-to-r from-[#184f28]/40 via-stone-950 to-stone-950 border border-[#184f28]/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#184f28] border border-[#d4af37]/50 flex items-center justify-center text-white shadow-xl flex-shrink-0">
              <QrCode className="w-7 h-7 text-[#d4af37]" />
            </div>
            <div>
              <h4 className="text-lg font-bold font-serif text-white">
                Commande Digitale Instantanée à Votre Table ou en Chambre
              </h4>
              <p className="text-xs text-stone-300 font-light mt-1 max-w-xl">
                Chaque table et chambre dispose de son QR code sécurisé. Parcourez la carte en temps réel,
                commandez sans attendre et vos mets sont acheminés directement depuis la Cuisine, le Bar ou la Cave.
              </p>
            </div>
          </div>
          <Link
            href="/order/hg_table_bohicon_tbl01"
            className="px-6 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 flex-shrink-0 shadow-lg"
          >
            <span>Tester la commande QR</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
