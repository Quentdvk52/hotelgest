"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SEED_EQUIPMENT_ITEMS, SEED_CATERING_MENUS } from "@/lib/db/seed";
import {
  PartyPopper,
  Sparkles,
  Layers,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  Calculator,
} from "lucide-react";

export function EventsEquipmentSection() {
  return (
    <section id="evenements" className="py-24 sm:py-32 bg-stone-900 text-white relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#d9a844]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#184f28]/40 border border-[#184f28]/70 text-[#e4c26e] text-xs font-semibold uppercase tracking-wider mb-4">
            <PartyPopper className="w-3.5 h-3.5" />
            <span>Événements, Réceptions & Matériel</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-white">
            Salles de Réception & Location de Matériel
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed font-light">
            Donnez une envergure inoubliable à vos célébrations, mariages, conférences d&apos;affaires
            et banquets officiels grâce à notre service traiteur intégré et notre catalogue complet de matériel disponible immédiatement.
          </p>
        </div>

        {/* 2-Columns Highlight: Salles & Traiteur */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Salles de banquet */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="relative h-60 rounded-2xl overflow-hidden mb-6">
                <Image
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
                  alt="Salles de réception Le Vignoble"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-[#7c3c46] text-white text-xs font-bold">
                  Capacité 50 à 400 Personnes
                </span>
              </div>

              <h3 className="text-2xl font-bold font-serif text-white mb-2">
                Salles Climatisées Modulables
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light mb-6">
                Nos 4 établissements disposent d&apos;espaces événementiels polyvalents équipés de sonorisation
                professionnelle, vidéoprojecteurs HD, micros HF et éclairage tamisé.
              </p>

              <div className="space-y-2 text-xs text-stone-300 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#d9a844]" />
                  <span>Sonorisation & régie audiovisuelle intégrée</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#d9a844]" />
                  <span>Climatisation silencieuse grande puissance & groupe électrogène relais</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#d9a844]" />
                  <span>Service de vestiaire et sécurité certifiée</span>
                </div>
              </div>
            </div>

            <Link
              href="/catering-equipment"
              className="py-3 px-5 rounded-xl bg-stone-900 hover:bg-[#7c3c46] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border border-stone-800 transition-colors"
            >
              <span>Réserver une salle avec traiteur</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Service traiteur gastronomique */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="relative h-60 rounded-2xl overflow-hidden mb-6">
                <Image
                  src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80"
                  alt="Service Traiteur Le Vignoble"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-[#d9a844] text-stone-950 text-xs font-bold">
                  Dès 8 500 XOF / Convive
                </span>
              </div>

              <h3 className="text-2xl font-bold font-serif text-white mb-2">
                Service Traiteur Clé en Main
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light mb-6">
                Des buffets prestigieux aux cocktails dînatoires raffinés, notre brigade de chefs
                assure le régal de vos convives avec service professionnel en tenue.
              </p>

              <div className="space-y-3 mb-6">
                {SEED_CATERING_MENUS.map((menu) => (
                  <div
                    key={menu.id}
                    className="p-3 rounded-xl bg-stone-900/90 border border-stone-800/80 text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{menu.name}</span>
                      <span className="font-extrabold text-[#d9a844]">
                        {menu.pricePerPersonXof.toLocaleString("fr-FR")} XOF / pers.
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                      {menu.description} (Min. {menu.minGuests} personnes)
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/catering-equipment"
              className="py-3 px-5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <span>Personnaliser mon menu traiteur</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Equipment Rental Showcase Grid */}
        <div className="bg-stone-950/90 border border-stone-800 rounded-3xl p-6 sm:p-10 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-800">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold block mb-1">
                Catalogue Matériel en Stock Immédiat
              </span>
              <h3 className="text-2xl font-bold font-serif text-white">
                Location de Matériel Événementiel
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Tarifs par jour avec état des lieux départ/retour et gestion sécurisée de caution.
              </p>
            </div>
            <Link
              href="/catering-equipment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d9a844] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md"
            >
              <Calculator className="w-4 h-4 text-stone-950" />
              <span>Simulateur & Devis en Ligne</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {SEED_EQUIPMENT_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between hover:border-[#d9a844]/60 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 block w-fit mb-2">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold font-serif text-white mb-2 leading-snug">
                    {item.name}
                  </h4>
                  <div className="text-xs text-stone-400 mb-4">
                    Stock disponible : <strong className="text-white">{item.totalStock}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800">
                  <div className="text-base font-extrabold text-[#d9a844]">
                    {item.dailyRentalPriceXof.toLocaleString("fr-FR")} XOF
                  </div>
                  <div className="text-[10px] text-stone-400">
                    par jour • Caution {item.depositPerUnitXof.toLocaleString("fr-FR")} XOF
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery & Logistics Guarantee */}
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7c3c46]/30 border border-[#7c3c46]/50 flex items-center justify-center text-[#d9a844] flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold font-serif text-white">
                Livraison, Installation & Reprise sur le Lieu de Votre Événement
              </h4>
              <p className="text-xs text-stone-300 font-light mt-0.5 max-w-2xl">
                Nos équipes logistiques assurent le transport sécurisé, l&apos;installation rigoureuse
                et le démontage ponctuel de tout le matériel dans tout le département du Zou et sur l&apos;axe Cotonou-Abomey.
              </p>
            </div>
          </div>
          <Link
            href="/catering-equipment"
            className="px-6 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 flex-shrink-0 shadow-lg"
          >
            <span>Accéder au configurateur</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
