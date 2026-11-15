"use client";

import React, { useState } from "react";
import { SEED_PROPERTIES } from "@/lib/db/seed";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CreditCard,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function PracticalInfoSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Quelles sont les heures d'arrivée (check-in) et de départ (check-out) ?",
      a: "Les chambres sont disponibles à partir de 14h00 le jour de votre arrivée. Le départ s'effectue jusqu'à 12h00. Un check-in anticipé ou un départ tardif (late check-out) peut être accordé gratuitement sur demande auprès de la réception selon nos disponibilités.",
    },
    {
      q: "Quels modes de règlement sont acceptés au sein des établissements ?",
      a: "Nous acceptons les règlements en espèces (XOF Francs CFA), par Mobile Money (MTN Mobile Money, Moov Money), par cartes bancaires (Visa, Mastercard) et par virement bancaire préalable pour les entreprises et délégations.",
    },
    {
      q: "Comment rejoindre l'un des hôtels depuis l'Aéroport International de Cotonou ?",
      a: "Notre service conciergerie met à votre disposition une flotte de berlines et SUV climatisés avec chauffeur privé. Votre chauffeur vous accueille avec pancarte nominative dès la sortie de l'aérogare de Cotonou-Cadjehoun et assure votre transfert sécurisé direct.",
    },
    {
      q: "Les animaux de compagnie sont-ils admis ?",
      a: "Afin de préserver le calme et le confort de tous nos hôtes, les animaux de compagnie ne sont pas admis dans les chambres et espaces de restauration, à l'exception des chiens guides d'assistance.",
    },
    {
      q: "Les chambres disposent-elles d'une connexion Internet et de la climatisation ?",
      a: "Absolument. L'ensemble de nos chambres, suites, restaurants et salles de conférence bénéficient d'une climatisation individuelle silencieuse et d'une couverture Wi-Fi très haut débit gratuite.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#faf7f5] text-stone-900 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f7f2] border border-[#bcdec6] text-[#184f28] text-xs font-semibold uppercase tracking-wider mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Séjour Sans Souci</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight text-stone-900">
            Informations Pratiques & Conciergerie
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed font-light">
            Tout ce qu&apos;il faut savoir pour préparer votre venue et contacter directement nos équipes.
          </p>
        </div>

        {/* 4 Sites Quick Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {SEED_PROPERTIES.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm hover:border-[#7c3c46]/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0f7f2] text-[#184f28] block w-fit mb-2">
                  Site {prop.code}
                </span>
                <h4 className="text-base font-bold font-serif text-stone-900 mb-1">
                  {prop.city}
                </h4>
                <div className="flex items-start gap-1.5 text-xs text-stone-500 mb-4 font-light">
                  <MapPin className="w-3.5 h-3.5 text-[#184f28] flex-shrink-0 mt-0.5" />
                  <span>{prop.address}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                <a
                  href={`tel:${prop.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-stone-700 hover:text-[#7c3c46] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#d9a844]" />
                  <span>{prop.phone}</span>
                </a>
                <a
                  href={`mailto:${prop.email}`}
                  className="flex items-center gap-2 text-stone-700 hover:text-[#7c3c46] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#d9a844]" />
                  <span className="truncate">{prop.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Practical Guidelines & FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Key Guidelines */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold font-serif text-stone-900 mb-6">
              Repères pour Votre Séjour
            </h3>

            <div className="space-y-6 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-[#184f28] flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Horaires d&apos;Accueil</h4>
                  <p className="text-stone-600 font-light leading-relaxed">
                    Arrivée à partir de <strong>14h00</strong>. Départ jusqu&apos;à <strong>12h00</strong>. Réception ouverte 24h/24.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Règlements & Devises</h4>
                  <p className="text-stone-600 font-light leading-relaxed">
                    XOF (Franc CFA), MTN Mobile Money, Moov Money, Cartes Visa et Mastercard acceptées.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-[#d9a844] flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Ligne WhatsApp Directe Conciergerie</h4>
                  <p className="text-stone-600 font-light leading-relaxed mb-3">
                    Besoin d&apos;une réponse immédiate, d&apos;un véhicule ou d&apos;un devis traiteur ?
                  </p>
                  <a
                    href="https://wa.me/22997001122"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
                  >
                    <span>Écrire sur WhatsApp (+229 97 00 11 22)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Accordion FAQ */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold font-serif text-stone-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#184f28]" />
              <span>Questions Fréquentes</span>
            </h3>

            <div className="divide-y divide-stone-200">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left text-sm font-semibold text-stone-900 hover:text-[#7c3c46] transition-colors focus:outline-none"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0 ${
                          isOpen ? "rotate-180 text-[#7c3c46]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed font-light animate-in fade-in-50 duration-150">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
