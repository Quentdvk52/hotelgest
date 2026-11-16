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
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function StaffLoginPage() {
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
        throw new Error(data.error || "Identifiant professionnel ou mot de passe incorrect.");
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
              Espace Direction & Personnel
            </span>
          </div>
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-stone-900/95 border border-stone-800 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#184f28]/30 border border-[#184f28]/60 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Portail Interne Sécurisé</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              Connexion Direction & Staff
            </h2>
            <p className="mt-1 text-xs text-stone-400 font-light">
              Accès réservé au promoteur, à la direction financière, aux gérants de sites et aux équipes opérationnelles.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Identifiant / Email Professionnel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@hotel-levignoble.bj ou gnacadjaeddy@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#184f28] focus:ring-1 focus:ring-[#184f28] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Mot de Passe Sécurisé
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4 text-[#d4af37]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm placeholder:text-stone-600 focus:outline-none focus:border-[#184f28] focus:ring-1 focus:ring-[#184f28] transition-all"
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

          <div className="mt-6 pt-4 border-t border-stone-800 text-center space-y-2">
            <div>
              <span className="text-xs text-stone-400 block mb-1">
                Vous êtes un client ou visiteur de l&apos;hôtel ?
              </span>
              <Link
                href="/login"
                className="text-xs text-[#d4af37] hover:underline font-semibold"
              >
                Accéder à l&apos;Espace Client & Réservations →
              </Link>
            </div>

            <div className="pt-2 border-t border-stone-900">
              <Link
                href="/creator/login"
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Concepteur & Éditeur du Logiciel ? Console Créateur (Chariow) →
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Confidentiality Notice */}
        <div className="mt-6 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
          <span>Accès Direction & Personnel • Authentification stricte</span>
        </div>
      </div>
    </div>
  );
}
