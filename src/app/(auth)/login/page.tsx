"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Bed,
  Phone,
  Lock,
} from "lucide-react";

export default function ClientLoginPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientLoading, setClientLoading] = useState(false);
  const [clientResult, setClientResult] = useState<any | null>(null);
  const [clientMessage, setClientMessage] = useState<string | null>(null);

  const handleClientLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setClientLoading(true);
    setClientMessage(null);

    // Simulate authentic reservation lookup for guests
    setTimeout(() => {
      setClientLoading(false);
      setClientResult({
        ref: bookingRef.trim() || "RES-VIG-2024-8891",
        guestName: clientEmail.includes("@") ? clientEmail.split("@")[0].toUpperCase() : "HÔTE PRIVILÈGE",
        hotel: "Hôtel Le Vignoble - Bohicon",
        roomType: "Suite Royale Le Vignoble",
        checkIn: "20 Novembre 2026 (dès 14h00)",
        checkOut: "22 Novembre 2026 (jusqu'à 12h00)",
        status: "CONFIRMÉE & ENREGISTRÉE",
        balanceStatus: "Règlement sur place à l'arrivée (Validé)",
        perks: [
          "Bouteille Château Vignoble offerte en chambre",
          "Cocktail de bienvenue au Bar Lounge",
          "Petit-déjeuner royal servi en chambre",
          "Service conciergerie VIP 24h/24",
        ],
      });
    }, 500);
  };

  const handleRequestEarlyCheckin = () => {
    setClientMessage(
      "Votre demande de check-in anticipé a été transmise avec succès à la réception de l'établissement. Un concierge vous contactera pour valider l'horaire souhaité."
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#184f28]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header / Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3.5 mb-6 group focus:outline-none"
          aria-label="Retour à l'accueil"
        >
          <div className="relative w-14 h-14 rounded-2xl bg-white p-1.5 shadow-xl border border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
            <Image
              src="/logo-vignoble-transparent.png"
              alt="Logo Officiel Hôtel Le Vignoble"
              width={56}
              height={56}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <div className="text-left">
            <span className="font-serif font-bold text-white text-xl tracking-tight block">
              Hôtel Le Vignoble
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
              Espace Client & Réservations
            </span>
          </div>
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4 sm:px-0">
        <div className="bg-stone-900/95 border border-stone-800 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#184f28]/30 border border-[#184f28]/60 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-2">
              <User className="w-3.5 h-3.5" />
              <span>Espace Visiteurs & Clients</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              Suivi de Séjour & Conciergerie
            </h2>
            <p className="mt-1 text-xs text-stone-400 font-light">
              Consultez votre réservation directe, demandez un accueil personnalisé ou contactez votre conciergerie 24/7.
            </p>
          </div>

          {!clientResult ? (
            <form onSubmit={handleClientLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Numéro de Réservation / Référence Dossier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <FileText className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <input
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="Ex: RES-VIG-2024-8891 (facultatif si email fourni)"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Adresse Email associée à votre réservation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <Mail className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@exemple.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                Indiquez l&apos;adresse email saisie lors de votre réservation directe pour afficher immédiatement votre dossier, vos prestations incluses et vos services exclusifs.
              </p>

              <button
                type="submit"
                disabled={clientLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#be9629] hover:from-[#e4c26e] hover:to-[#d4af37] text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all mt-4"
              >
                {clientLoading ? (
                  <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Accéder à ma réservation</span>
                    <ArrowRight className="w-4 h-4 text-stone-950" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-stone-800 text-center">
                <span className="text-xs text-stone-400 block mb-2">
                  Vous n&apos;avez pas encore de réservation en cours ?
                </span>
                <Link
                  href="/#reserver"
                  className="text-xs text-[#d4af37] hover:underline font-semibold"
                >
                  Réserver un séjour en ligne au meilleur tarif garanti →
                </Link>
              </div>
            </form>
          ) : (
            /* Display Guest Reservation Summary */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-stone-800">
                  <span className="text-stone-400">
                    Dossier : <strong className="text-white">{clientResult.ref}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                    {clientResult.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-stone-400">Établissement réservé :</div>
                  <div className="text-white font-bold text-sm font-serif">{clientResult.hotel}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-stone-400">Hébergement :</div>
                  <div className="text-[#d4af37] font-semibold">{clientResult.roomType}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
                  <div>
                    <span className="text-stone-500 block">Arrivée :</span>
                    <span className="text-stone-200 font-medium">{clientResult.checkIn}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Départ :</span>
                    <span className="text-stone-200 font-medium">{clientResult.checkOut}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Privilèges Directs Inclus :
                  </span>
                  <div className="space-y-1">
                    {clientResult.perks.map((p: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {clientMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{clientMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleRequestEarlyCheckin}
                  className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 border border-stone-700"
                >
                  <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Early Check-in</span>
                </button>

                <a
                  href="https://wa.me/22997001122"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setClientResult(null);
                  setClientMessage(null);
                }}
                className="w-full text-center text-xs text-stone-400 hover:text-stone-200 mt-2"
              >
                Consulter une autre réservation
              </button>
            </div>
          )}

          {/* Separation Notice: Dedicated Staff Portal Access */}
          <div className="mt-8 pt-6 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span>Vous faites partie du personnel ou de la direction ?</span>
            <Link
              href="/staff/login"
              className="text-[#d4af37] hover:underline font-semibold flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Espace Staff →</span>
            </Link>
          </div>
        </div>

        {/* Security & Confidentiality Notice */}
        <div className="mt-6 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
          <span>Espace réservé aux clients du Groupe Hôtel Le Vignoble</span>
        </div>
      </div>
    </div>
  );
}
