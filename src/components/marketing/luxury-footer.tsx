"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SEED_ORGANIZATION, SEED_PROPERTIES } from "@/lib/db/seed";
import { MapPin, Phone, Mail, Shield, Lock, Sparkles, ArrowRight } from "lucide-react";

export function LuxuryFooter() {
  return (
    <footer className="bg-stone-950 text-white border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-stone-800/80">
          {/* Brand & Official Logo Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3.5 mb-6 group">
              <div className="relative w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl shadow-black/40 border border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
                <Image
                  src="/logo-vignoble-transparent.png"
                  alt="Logo Officiel Hôtel Le Vignoble"
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                  Hôtel Le Vignoble
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                  Hospitalité d&apos;Élite au Bénin
                </span>
              </div>
            </Link>

            <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-sm mb-6">
              Groupe hôtelier d&apos;excellence présent à Bohicon, Abomey, Abomey-Calavi et Zogbodomey.
              Suites royales, haute gastronomie du terroir, cave climatisée, service traiteur et location de prestige.
            </p>

            <div className="text-[11px] text-stone-400 space-y-1">
              <div>{SEED_ORGANIZATION.name} • Société par Actions Simplifiée</div>
              <div>{SEED_ORGANIZATION.legalRegistration} • {SEED_ORGANIZATION.taxIdentifier}</div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-4">
              Le Domaine
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <a href="#hotels" className="hover:text-white transition-colors">
                  Les Hôtels Vignobles
                </a>
              </li>
              <li>
                <a href="#offres" className="hover:text-white transition-colors">
                  Nos offres & séjours
                </a>
              </li>
              <li>
                <a href="#hebergements" className="hover:text-white transition-colors">
                  Hébergements & Suites
                </a>
              </li>
              <li>
                <a href="#restaurant" className="hover:text-white transition-colors">
                  Restaurant & Cave à vin
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-white transition-colors">
                  Location de véhicules VIP
                </a>
              </li>
              <li>
                <Link href="/catering-equipment" className="hover:text-white transition-colors">
                  Traiteur & Matériel
                </Link>
              </li>
            </ul>
          </div>

          {/* Nos 4 Sites */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-4">
              Nos Établissements
            </h4>
            <ul className="space-y-3 text-xs text-stone-300">
              {SEED_PROPERTIES.map((p) => (
                <li key={p.id}>
                  <div className="text-white font-semibold">{p.city} ({p.code})</div>
                  <div className="text-[11px] text-stone-400 font-light">{p.phone}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Conciergerie & Staff Access Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-4">
              Assistance & Accès
            </h4>
            <div className="space-y-3 text-xs text-stone-300 mb-6">
              <p className="text-stone-400 font-light">
                Conciergerie centrale & urgences réceptions 24h/24 :
              </p>
              <a
                href="tel:+22997001122"
                className="inline-flex items-center gap-2 text-white font-bold hover:text-[#d4af37] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>+229 97 00 11 22</span>
              </a>
              <div>
                <a
                  href="mailto:contact@hotel-levignoble.bj"
                  className="hover:text-white transition-colors"
                >
                  contact@hotel-levignoble.bj
                </a>
              </div>
            </div>

            {/* Official Dedicated Staff Portal Link as required by the user */}
            <div className="pt-4 border-t border-stone-800/80">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-800 text-xs font-semibold transition-all hover:border-[#184f28]"
                aria-label="Accès Espace Direction et Personnel"
              >
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Espace Direction / Staff</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Lower Bar: Copyright, Legal & Discretion */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Groupe Hôtelier Le Vignoble. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Mentions Légales</span>
            <span className="hover:text-white cursor-pointer">Politique de Confidentialité</span>
            <span className="hover:text-white cursor-pointer">Conditions Générales de Séjour</span>
            <Link href="/login" className="text-stone-300 hover:text-[#d4af37] transition-colors">
              Espace Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
