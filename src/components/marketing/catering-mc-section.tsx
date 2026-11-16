"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Mic2,
  UtensilsCrossed,
  Award,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  Calendar,
  X,
} from "lucide-react";
import { SEED_PROPERTIES } from "@/lib/db/seed";

export function CateringAndMcSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"TRAITEUR" | "MC" | "COMBO">("COMBO");
  const [selectedProperty, setSelectedProperty] = useState(SEED_PROPERTIES[0].name);
  const [guestCount, setGuestCount] = useState("100");
  const [eventDate, setEventDate] = useState("2026-12-15");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const formulas = [
    {
      id: "f-traiteur-royal",
      title: "Banquet Royal & Buffet Prestige",
      badge: "Haute Gastronomie",
      price: "Dès 12 500 XOF / convive",
      description:
        "Buffet somptueux alliant grands classiques de la cuisine béninoise raffinée (Amiwo impérial, sauce crincrin au mouton, pintade braisée) et spécialités internationales.",
      highlights: [
        "Cocktail apéritif d'accueil avec canapés fins",
        "Buffet chaud & froid à volonté (3 viandes, 2 poissons)",
        "Assortiment de desserts & fruits sculptés",
        "Maîtres d'hôtel en livrée et service d'arts de la table",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: "f-mc-prestige",
      title: "Maître de Cérémonies (MC) & Régie",
      badge: "Éloquence & Protocole",
      price: "Dès 150 000 XOF / prestation",
      description:
        "Présentation d'excellence, animation bilingue (Français, Fon, Anglais) et ordonnancement strict des temps forts pour vos mariages, galas d'État et célébrations privées.",
      highlights: [
        "Rédaction du déroulé protocolaire avec les mariés / organisateurs",
        "Gestion fluide des interventions, toasts et animations",
        "Coordination directe avec la brigade traiteur et les DJ",
        "Charisme, diction impeccable et courtoisie diplomatique",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: "f-combo-excellence",
      title: "Pack Prestige Clé en Main (Traiteur + MC)",
      badge: "Formule Complète Signature",
      price: "Sur Devis Personnalisé",
      description:
        "La signature intégrale de l'Hôtel Le Vignoble : coordination totale de la restauration et de l'animation pour une sérénité absolue le jour J.",
      highlights: [
        "Dégustation préalable offerte pour 2 personnes",
        "Maître de cérémonies dédié + Régisseur d'événement",
        "Mise à disposition gratuite de réchauds et arts de table",
        "Supervision générale par notre Direction Banquet",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  const handleOpenModal = (type: "TRAITEUR" | "MC" | "COMBO") => {
    setModalType(type);
    setSubmitted(false);
    setModalOpen(true);
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="traiteur-mc" className="py-20 lg:py-28 bg-[#0b1612] text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#184f28]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/90 border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold tracking-wider uppercase mb-4 shadow-lg">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span>Excellence Réceptive & Art Oratoire</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight leading-tight mb-4">
            Service Traiteur & Maître de Cérémonies
          </h2>
          <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
            De la composition de banquets mémorables jusqu&apos;à la direction scénique de vos cérémonies, notre brigade hôtelière et nos animateurs protocolaires subliment vos mariages, réceptions de prestige, réunions et dîners de gala à Bohicon, Abomey, Calavi et partout au Bénin.
          </p>
        </div>

        {/* 3 Large Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {formulas.map((f) => (
            <div
              key={f.id}
              className="bg-stone-900/80 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl hover:border-[#d4af37]/60 transition-all flex flex-col justify-between group"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={f.imageUrl}
                  alt={f.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-stone-950/90 backdrop-blur-md text-[11px] font-bold text-[#d4af37] border border-[#d4af37]/40 uppercase tracking-wider">
                    {f.badge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-lg font-black text-[#d4af37] font-serif drop-shadow-md">
                    {f.price}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white group-hover:text-[#d4af37] transition-colors mb-3">
                    {f.title}
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed mb-4">
                    {f.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-stone-800">
                    <span className="text-[11px] uppercase font-bold text-stone-400 block tracking-wider mb-2">
                      Points Forts Inclus :
                    </span>
                    {f.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() =>
                      handleOpenModal(
                        f.id === "f-traiteur-royal"
                          ? "TRAITEUR"
                          : f.id === "f-mc-prestige"
                          ? "MC"
                          : "COMBO"
                      )
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e4c26e] to-[#c59b27] hover:opacity-95 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Demander un Devis Direct</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900/90 via-stone-950 to-stone-900/90 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#184f28]/30 border border-[#184f28]/50 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold font-serif text-white">
                Régie & Coordination Intégrale Hôtel Le Vignoble
              </h4>
              <p className="text-xs text-stone-300 mt-0.5">
                Plus de 350 mariages, banquets diplomatiques et anniversaires organisés avec 100% de ponctualité au Bénin.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+22997001122"
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold tracking-wider flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Ligne Directe Évènements</span>
            </a>
            <button
              onClick={() => handleOpenModal("COMBO")}
              className="px-6 py-3 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
            >
              <span>Organiser mon événement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quote / Booking Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold block mb-1">
                  Réservation & Devis Personnalisé
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif mb-2">
                  {modalType === "TRAITEUR"
                    ? "Devis Service Traiteur & Banquets"
                    : modalType === "MC"
                    ? "Réservation Maître de Cérémonies (MC)"
                    : "Formule Complète Traiteur & MC"}
                </h3>
                <p className="text-xs text-stone-400 mb-6">
                  Précisez vos besoins pour votre réception. Notre chef banquet et régisseur vous recontactent sous 2 heures avec une proposition détaillée.
                </p>

                <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">
                      Nom complet de l&apos;organisateur / Entreprise
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Mme / M. Dossou-Yovo..."
                      className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Numéro Téléphone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+229 97 00 00 00"
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Date prévue de l&apos;événement
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Nombre de convives estimé
                      </label>
                      <input
                        type="number"
                        min={20}
                        required
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-300 mb-1">
                        Site / Ville de la réception
                      </label>
                      <select
                        value={selectedProperty}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        {SEED_PROPERTIES.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                        <option value="Autre localité">Autre localité (Domicile, Espace externe)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">
                      Attentes particulières, menus souhaités ou protocole
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Cocktail dînatoire debout avec 150 personnes, préférence pour plats du terroir béninois, besoin de sonorisation et pupitre..."
                      className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e4c26e] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold uppercase tracking-wider text-xs shadow-xl shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Transmettre ma demande à la Direction Banquet</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif mb-2">Demande Reçue avec Succès !</h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed mb-6">
                  Merci <span className="font-semibold text-white">{clientName}</span>. Votre demande pour{" "}
                  <span className="text-[#d4af37] font-semibold">{guestCount} convives</span> le{" "}
                  <span className="text-white font-semibold">{eventDate}</span> a été transmise à notre régie générale. Notre responsable vous contactera au{" "}
                  <span className="text-white font-semibold">{clientPhone}</span>.
                </p>

                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
