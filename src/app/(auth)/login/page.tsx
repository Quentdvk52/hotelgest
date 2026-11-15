"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, Hotel, AlertCircle, Eye, EyeOff } from "lucide-react";
import { SEED_USERS } from "@/lib/db/seed";
import { ENTERPRISE_PASSWORDS } from "@/lib/auth/passwords";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c3c46]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#7c3c46] border border-[#d9a844]/40 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
            H
          </div>
          <div className="text-left">
            <span className="font-bold text-white text-xl tracking-tight block">HotelGest</span>
            <span className="text-xs text-stone-400 font-medium">Hôtel Le Vignoble • Portail Sécurisé</span>
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Espace Direction & Personnel
        </h2>
        <p className="mt-2 text-sm text-stone-400">
          Connectez-vous pour accéder à vos modules selon vos attributions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-stone-950/80 border border-stone-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Identifiant / Email Professionnel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@hotel-levignoble.bj"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#7c3c46] focus:ring-1 focus:ring-[#7c3c46] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Mot de Passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#7c3c46] focus:ring-1 focus:ring-[#7c3c46] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#7c3c46] hover:bg-[#8f4551] text-white font-semibold text-sm shadow-lg shadow-[#7c3c46]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Test Emulation Shortcuts */}
          <div className="mt-8 pt-6 border-t border-stone-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2.5">
              Raccourcis de Test Rapide (Pilote Le Vignoble) :
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handlePreFill("gnacadjaeddy@gmail.com")}
                className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
              >
                <div className="font-bold text-amber-300">Promoteur (PDG)</div>
                <div className="text-[10px] text-stone-500 truncate">Eddy GNACADJA</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreFill("daf@hotel-levignoble.bj")}
                className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
              >
                <div className="font-bold text-amber-300">DAF Central</div>
                <div className="text-[10px] text-stone-500 truncate">Marcelin AGBID.</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreFill("gerant.bohicon@hotel-levignoble.bj")}
                className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
              >
                <div className="font-bold text-stone-200">Gérant Bohicon</div>
                <div className="text-[10px] text-stone-500 truncate">Aimée Hounsinou</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreFill("reception.boh@hotel-levignoble.bj")}
                className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
              >
                <div className="font-bold text-stone-200">Réception Bohicon</div>
                <div className="text-[10px] text-stone-500 truncate">Gaston Dossou</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreFill("chef.boh@hotel-levignoble.bj")}
                className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
              >
                <div className="font-bold text-stone-200">Chef Cuisine</div>
                <div className="text-[10px] text-stone-500 truncate">Rodrigue Mensah</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreFill("traiteur.event@hotel-levignoble.bj")}
                className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-left hover:border-amber-500/40 text-stone-300 transition-colors"
              >
                <div className="font-bold text-stone-200">Traiteur & Matériel</div>
                <div className="text-[10px] text-stone-500 truncate">Mathurin VODOUNOU</div>
              </button>
            </div>
            <p className="mt-3 text-[10px] text-stone-500 text-center">
              Consultez le fichier <span className="text-amber-400 font-semibold">donnees de test.docx</span> pour la liste intégrale des 20 comptes.
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-stone-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Authentification sécurisée & Chiffrement Neon PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}
