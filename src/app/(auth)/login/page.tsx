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
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
} from "lucide-react";

export default function ClientLoginPage() {
  const [activeTab, setActiveTab] = useState<"ACCOUNT" | "BOOKING_REF">("ACCOUNT");
  const [bookingRef, setBookingRef] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [clientResult, setClientResult] = useState<any | null>(null);
  const [clientMessage, setClientMessage] = useState<string | null>(null);

  // Google OAuth Login simulation for clients
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setClientMessage(null);

    setTimeout(() => {
      setGoogleLoading(false);
      setClientResult({
        ref: "RES-GOOGLE-2026-9921",
        guestName: "EDDY GNACADJA",
        authMethod: "Compte Google Certifié",
        email: "gnacadja.client@gmail.com",
        hotel: "Hôtel Le Vignoble - Bohicon",
        roomType: "Suite Royale Le Vignoble (Vue Piscine)",
        checkIn: "20 Novembre 2026 (dès 14h00)",
        checkOut: "24 Novembre 2026 (jusqu'à 12h00)",
        status: "CONFIRMÉE & GARANTIE",
        balanceStatus: "Acompte Mobile Money Payé (Solde à l'arrivée)",
        perks: [
          "Connexion Google VIP : Check-in express coupe-file",
          "Bouteille Château Vignoble Réserve offerte en chambre",
          "Cocktail de bienvenue au Bar Lounge",
          "Petit-déjeuner royal servi en suite",
          "Service conciergerie VIP & Room service 24h/24",
        ],
      });
      setClientMessage(
        "Connexion avec Google réussie ! Bienvenue dans votre Espace Hôte Privilège Le Vignoble."
      );
    }, 700);
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientLoading(true);
    setClientMessage(null);

    setTimeout(() => {
      setClientLoading(false);
      const name = clientEmail.includes("@")
        ? clientEmail.split("@")[0].toUpperCase()
        : "HÔTE PRIVILÈGE";

      setClientResult({
        ref: bookingRef.trim() || "RES-VIG-2024-8891",
        guestName: name,
        authMethod: "Compte Client Hôtelier",
        email: clientEmail,
        hotel: "Hôtel Le Vignoble - Bohicon",
        roomType: "Chambre Supérieure Vignoble",
        checkIn: "22 Novembre 2026 (dès 14h00)",
        checkOut: "25 Novembre 2026 (jusqu'à 12h00)",
        status: "CONFIRMÉE & ENREGISTRÉE",
        balanceStatus: "Règlement sur place à l'arrivée (Validé)",
        perks: [
          "Bouteille Château Vignoble offerte en chambre",
          "Cocktail de bienvenue au Bar Lounge",
          "Petit-déjeuner royal servi au restaurant",
          "Service conciergerie 24h/24",
        ],
      });
    }, 600);
  };

  const handleRequestEarlyCheckin = () => {
    setClientMessage(
      "Votre demande de check-in anticipé a été transmise à la réception de l'établissement. Un concierge vous contactera."
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
              Portail Hôte & Conciergerie
            </h2>
            <p className="mt-1 text-xs text-stone-400 font-light">
              Connectez-vous pour suivre votre séjour, réserver des services en chambre ou accéder à vos privilèges.
            </p>
          </div>

          {!clientResult ? (
            <div className="space-y-6">
              {/* Google Login Section - STRICTLY CLIENT PORTAL */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-3 transition-all border border-stone-200 active:scale-[0.99] disabled:opacity-50"
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continuer avec Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Separator */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-stone-800 w-full" />
                <span className="bg-stone-900 px-3 text-[10px] uppercase font-bold text-stone-500 tracking-widest whitespace-nowrap">
                  ou avec vos identifiants clients
                </span>
                <div className="border-t border-stone-800 w-full" />
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("ACCOUNT")}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                    activeTab === "ACCOUNT"
                      ? "bg-[#184f28] text-white shadow-sm"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Compte & Mot de Passe
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("BOOKING_REF")}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                    activeTab === "BOOKING_REF"
                      ? "bg-[#184f28] text-white shadow-sm"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Réf. de Réservation
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleClientSubmit} className="space-y-4">
                {activeTab === "BOOKING_REF" && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Numéro de Réservation / Dossier
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                        <FileText className="w-4 h-4 text-[#d4af37]" />
                      </div>
                      <input
                        type="text"
                        value={bookingRef}
                        onChange={(e) => setBookingRef(e.target.value)}
                        placeholder="Ex: RES-VIG-2024-8891"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#d4af37] transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Adresse Email Client
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

                {activeTab === "ACCOUNT" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-stone-300">
                        Mot de Passe Client
                      </label>
                      <span className="text-[10px] text-stone-500">
                        Code secret ou mot de passe
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                        <Lock className="w-4 h-4 text-[#d4af37]" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#d4af37] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition-colors"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                  {activeTab === "ACCOUNT"
                    ? "Accédez à votre compte pour consulter vos réservations, vos factures et vos avantages fidélité."
                    : "Saisissez votre référence de dossier et email pour ouvrir immédiatement le récapitulatif de votre séjour."}
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
                      <span>Accéder à mon espace</span>
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
            </div>
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
                  <div className="text-stone-400">Hôte enregistré :</div>
                  <div className="text-white font-bold text-sm font-serif flex items-center justify-between">
                    <span>{clientResult.guestName}</span>
                    <span className="text-[10px] text-[#d4af37] font-sans font-normal border border-[#d4af37]/30 px-2 py-0.5 rounded-full bg-[#d4af37]/10">
                      {clientResult.authMethod}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-stone-400">Établissement réservé :</div>
                  <div className="text-white font-semibold">{clientResult.hotel}</div>
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
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] flex-shrink-0" />
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
                Se déconnecter / Consulter un autre compte
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
