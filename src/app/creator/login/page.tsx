"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Terminal, Cpu } from "lucide-react";

export default function CreatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/creator/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Identifiants créateur invalides.");
      }

      router.push("/creator/dashboard");
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between pb-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center">
            <Image
              src="/logo-vignoble-transparent.png"
              alt="HotelGest"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm">
              HotelGest • Platform Core
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold">
              Console Super-Admin Créateur
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/staff/login"
            className="text-stone-400 hover:text-white transition-colors"
          >
            Espace Direction & Staff
          </Link>
          <Link
            href="/"
            className="text-stone-400 hover:text-[#d4af37] transition-colors"
          >
            ← Retour au site public
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto py-8">
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-600/10 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-semibold mb-4">
              <Terminal className="w-3.5 h-3.5" />
              <span>Accès Concepteur & Éditeur du Logiciel</span>
            </div>

            <h1 className="text-2xl font-bold font-serif text-white tracking-tight mb-2">
              Console Créateur HotelGest
            </h1>
            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              Portail réservé au créateur du logiciel pour la gestion globale de la plateforme, l&apos;encaissement des abonnements via <strong>Chariow</strong>, et le contrôle des licences hôtelières.
            </p>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>Adresse Email Créateur</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="createur@hotelgest.io"
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Clé Maîtresse d&apos;Administration</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Accéder au Cockpit Plateforme</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> Passerelle Chariow v2
              </span>
              <span>Architecture SaaS Dédiée</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-stone-500 pt-8 border-t border-stone-900">
        <p>HotelGest Engine • Plateforme de Gestion Hôtelière Multi-Sites • Espace Réservé</p>
      </footer>
    </div>
  );
}
