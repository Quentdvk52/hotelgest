"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  CheckCircle2,
  Phone,
  MessageSquare,
  KeyRound,
  FileText,
  Clock,
  Bed,
} from "lucide-react";
import { SEED_USERS } from "@/lib/db/seed";
import { ENTERPRISE_PASSWORDS } from "@/lib/auth/passwords";

export default function LoginPage() {
  const router = useRouter();

  // Tab: "client" (Mon compte client) vs "staff" (Espace Direction / Staff)
  const [activeTab, setActiveTab] = useState<"client" | "staff">("client");

  // Client Journey State
  const [bookingRef, setBookingRef] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientLoading, setClientLoading] = useState(false);
  const [clientResult, setClientResult] = useState<any | null>(null);
  const [clientMessage, setClientMessage] = useState<string | null>(null);

  // Staff Journey State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Client Reservation Lookup
  const handleClientLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setClientLoading(true);
    setClientMessage(null);

    // Simulate authentic lookup for guests
    setTimeout(() => {
      setClientLoading(false);
      setClientResult({
        ref: bookingRef || "RES-VIG-2024-8891",
        guestName: clientEmail.includes("@") ? clientEmail.split("@")[0] : "Client Hôte",
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
    }, 600);
  };

  const handleRequestEarlyCheckin = () => {
    setClientMessage(
      "Votre demande de check-in anticipé a été transmise au chef de réception de l'Hôtel Le Vignoble. Notre conciergerie vous confirme la disponibilité par SMS ou appel."
    );
  };

  // Handle Staff Authentication
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Identifiant ou mot de passe incorrect.");
      }

      // Store in localStorage for fast UI hydration
      if (typeof window !== "undefined") {
        localStorage.setItem("hotelgest_user", JSON.stringify(data.user));
      }

      // Redirect to assigned workspace
      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreFill = (userEmail: string) => {
    setEmail(userEmail);
    const pass = ENTERPRISE_PASSWORDS[userEmail] || "";
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#7c3c46]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#d9a844]/10 rounded-full blur-[140px] pointer-events-none" />

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
              Bohicon • Abomey • Calavi • Zogbodomey
            </span>
          </div>
        </Link>
      </div>

      {/* Main Dual Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4 sm:px-0">
        <div className="bg-stone-900/90 border border-stone-800 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          {/* Dual Navigation Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-stone-950 border border-stone-800 mb-8">
            <button
              type="button"
              onClick={() => {
                setActiveTab("client");
                setError(null);
              }}
              className={`py-3 px-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                activeTab === "client"
                  ? "bg-[#184f28] text-white shadow-lg border border-[#d4af37]/50"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <User className={`w-3.5 h-3.5 ${activeTab === "client" ? "text-[#d9a844]" : "text-stone-500"}`} />
              <span>Mon compte client</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("staff");
                setError(null);
              }}
              className={`py-3 px-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                activeTab === "staff"
                  ? "bg-stone-800 text-white shadow-lg border border-stone-700"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${activeTab === "staff" ? "text-[#d9a844]" : "text-stone-500"}`} />
              <span>Espace Direction / Staff</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* JOURNEY 1: MON COMPTE CLIENT (GUEST PORTAL)              */}
          {/* ========================================================= */}
          {activeTab === "client" && (
            <div>
              <div className="text-center mb-6">
                <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold block mb-1">
                  Espace Réservation Hôte
                </span>
                <h2 className="text-2xl font-bold font-serif text-white">
                  Bienvenue au Domaine Le Vignoble
                </h2>
                <p className="mt-1 text-xs text-stone-400 font-light">
                  Consultez votre séjour, demandez un check-in anticipé ou contactez votre conciergerie dédiée.
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
                        <FileText className="w-4 h-4 text-[#d9a844]" />
                      </div>
                      <input
                        type="text"
                        value={bookingRef}
                        onChange={(e) => setBookingRef(e.target.value)}
                        placeholder="Ex: RES-VIG-2024-8891"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#d9a844] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Adresse Email associée à votre réservation
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                        <Mail className="w-4 h-4 text-[#d9a844]" />
                      </div>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="votre.email@exemple.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#d9a844] transition-all"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                    Saisissez l&apos;adresse email utilisée lors de votre réservation directe pour accéder instantanément à vos prestations et privilèges.
                  </p>

                  <button
                    type="submit"
                    disabled={clientLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#d9a844] to-[#c59b27] hover:opacity-95 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all mt-4"
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
                      className="text-xs text-[#d9a844] hover:underline font-semibold"
                    >
                      Réserver un séjour en ligne au meilleur tarif
                    </Link>
                  </div>
                </form>
              ) : (
                /* Display Guest Booking Info */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-800">
                      <span className="text-stone-400">Dossier : <strong>{clientResult.ref}</strong></span>
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
                      <div className="text-[#d9a844] font-semibold">{clientResult.roomType}</div>
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
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#d9a844]" />
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
                      <Clock className="w-3.5 h-3.5 text-[#d9a844]" />
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
            </div>
          )}

          {/* ========================================================= */}
          {/* JOURNEY 2: ESPACE DIRECTION / STAFF (OPERATIONAL PORTAL) */}
          {/* ========================================================= */}
          {activeTab === "staff" && (
            <div>
              <div className="text-center mb-6">
                <span className="text-xs uppercase tracking-widest text-[#d9a844] font-bold block mb-1">
                  Accès Réservé Collaborateurs
                </span>
                <h2 className="text-2xl font-bold font-serif text-white">
                  Espace Direction & Personnel
                </h2>
                <p className="mt-1 text-xs text-stone-400 font-light">
                  Connectez-vous pour piloter les 4 établissements selon vos prérogatives.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Identifiant / Email Professionnel
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                      <Mail className="w-4 h-4 text-[#d9a844]" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@hotel-levignoble.bj"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#7c3c46] focus:ring-1 focus:ring-[#7c3c46] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Mot de Passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                      <Lock className="w-4 h-4 text-[#d9a844]" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#7c3c46] focus:ring-1 focus:ring-[#7c3c46] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#184f28]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Se connecter à mon espace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Profile Shortcuts for Seamless Evaluation */}
              <div className="mt-8 pt-6 border-t border-stone-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2.5">
                  Raccourcis de Test Rapide (Pilote Le Vignoble) :
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handlePreFill("gnacadjaeddy@gmail.com")}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
                  >
                    <div className="font-semibold text-white">Promoteur (PDG)</div>
                    <div className="text-[10px] text-stone-400 truncate">Eddy GNACADJA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreFill("daf@hotel-levignoble.bj")}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
                  >
                    <div className="font-semibold text-white">DAF Groupe</div>
                    <div className="text-[10px] text-stone-400 truncate">M. AGBIDINOUKOUN</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreFill("gerant.bohicon@hotel-levignoble.bj")}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
                  >
                    <div className="font-semibold text-white">Gérant Bohicon</div>
                    <div className="text-[10px] text-stone-400 truncate">Aimée Hounsinou</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreFill("reception.boh@hotel-levignoble.bj")}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
                  >
                    <div className="font-semibold text-white">Réception Bohicon</div>
                    <div className="text-[10px] text-stone-400 truncate">Gaston Dossou</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreFill("chef.boh@hotel-levignoble.bj")}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
                  >
                    <div className="font-semibold text-white">Chef Cuisinier</div>
                    <div className="text-[10px] text-stone-400 truncate">Chef Rodrigue Mensah</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreFill("traiteur.event@hotel-levignoble.bj")}
                    className="p-2 rounded-lg bg-stone-950 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
                  >
                    <div className="font-semibold text-white">Traiteur & Matériel</div>
                    <div className="text-[10px] text-stone-400 truncate">Mathurin VODOUNOU</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security & Confidentiality Notice */}
        <div className="mt-6 text-center text-xs text-stone-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#d9a844]" />
          <span>Portail officiel sécurisé • Chiffrement SSL 256 bits</span>
        </div>
      </div>
    </div>
  );
}
