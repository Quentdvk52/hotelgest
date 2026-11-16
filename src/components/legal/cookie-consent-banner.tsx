"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Check,
  X,
  Settings,
  ChevronRight,
  Cookie,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "hotelgest_cookie_consent";
const CURRENT_POLICY_VERSION = "1.0";

export function CookieConsentBanner() {
  const [hasInteracted, setHasInteracted] = useState(true); // default true to avoid flash on SSR
  const [modalOpen, setModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user already made a choice
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setHasInteracted(false);
    } else {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.categories) {
          setPreferences({
            necessary: true,
            functional: parsed.categories.FUNCTIONAL ?? true,
            analytics: parsed.categories.ANALYTICS ?? false,
            marketing: parsed.categories.MARKETING ?? false,
          });
        }
      } catch {
        setHasInteracted(false);
      }
    }

    // Global listener so footer link "Gérer les cookies" can trigger preference modal
    const handleOpenModal = () => {
      setModalOpen(true);
    };

    window.addEventListener("hotelgest_open_cookie_preferences", handleOpenModal);
    return () => {
      window.removeEventListener("hotelgest_open_cookie_preferences", handleOpenModal);
    };
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const payload = {
      timestamp: new Date().toISOString(),
      policyVersion: CURRENT_POLICY_VERSION,
      categories: {
        NECESSARY: true,
        FUNCTIONAL: prefs.functional,
        ANALYTICS: prefs.analytics,
        MARKETING: prefs.marketing,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setPreferences(prefs);
    setHasInteracted(true);
    setModalOpen(false);

    // Apply real behavioral enforcement:
    // When analytics or marketing is declined, clean up non-essential cookies
    if (!prefs.analytics) {
      document.cookie = "_ga=; Max-Age=0; path=/;";
      document.cookie = "_gid=; Max-Age=0; path=/;";
    }
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  return (
    <>
      {/* Floating Bottom Banner */}
      {!hasInteracted && (
        <aside
          role="region"
          aria-label="Consentement aux cookies et traceurs"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-[#0b0f17] text-white border border-[#d4af37]/40 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0 text-[#d4af37]">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  Respect de votre vie privée
                  <span className="text-[10px] uppercase tracking-wider font-sans font-bold px-1.5 py-0.5 rounded bg-[#184f28] text-white">
                    Hôtel Le Vignoble
                  </span>
                </h4>
                <p className="text-[11px] text-stone-300 leading-relaxed font-light">
                  Nous utilisons des traceurs indispensables au fonctionnement de vos réservations, et avec votre accord, des traceurs optionnels pour mesurer l&apos;audience et personnaliser vos séjours.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 text-center"
                >
                  Tout Accepter
                </button>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 font-semibold text-xs transition-all active:scale-95 text-center"
                >
                  Tout Refuser
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-stone-400 hover:text-[#d4af37] underline underline-offset-2 transition-colors flex items-center gap-1 font-medium"
                >
                  <Settings className="w-3 h-3" />
                  Personnaliser les choix
                </button>

                <Link
                  href="/legal/cookies-et-traceurs"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Politique des cookies →
                </Link>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Comprehensive Customization Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-[#0b0f17] border border-stone-800 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="text-lg font-bold font-serif text-white">
                    Centre de Préférences des Traceurs
                  </h3>
                  <p className="text-xs text-stone-400">
                    Groupe Hôtelier Le Vignoble • Politique {CURRENT_POLICY_VERSION}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Vous pouvez activer ou désactiver les différentes familles de traceurs. Vos choix sont enregistrés et modifiables à tout moment via le lien « Gérer les cookies » situé dans le pied de page.
            </p>

            <div className="space-y-3.5">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">
                      Traceurs strictement nécessaires
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Toujours actif
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                  Indispensables pour sécuriser vos paiements en ligne (KkiaPay), la validation des réservations de chambres et le maintien de votre session.
                </p>
              </div>

              {/* Category 2: Functional */}
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#d4af37]" />
                    <span className="font-bold text-xs text-white">
                      Traceurs fonctionnels & Établissements
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({ ...preferences, functional: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#184f28]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                  Mémorisent votre agence préférée (Bohicon, Abomey, Calavi, Zogbodomey) et vos options de navigation.
                </p>
              </div>

              {/* Category 3: Analytics */}
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-xs text-white">
                      Mesure d&apos;audience & Ergonomie
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#184f28]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                  Collectent des statistiques agrégées et anonymisées pour mesurer les performances et accélérer l&apos;affichage de nos pages.
                </p>
              </div>

              {/* Category 4: Marketing / Social Sharing */}
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-xs text-white">
                      Partage Réseaux Sociaux & Événements
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#184f28]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                  Permettent l&apos;affichage d&apos;aperçus grand format de nos suites et offres lorsque vous partagez un lien avec vos proches.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="w-full sm:flex-1 py-3 rounded-xl bg-[#d4af37] hover:bg-[#c29f2f] text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Enregistrer mes Préférences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-800 font-semibold text-xs transition-all active:scale-95"
              >
                Tout Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Fonction d'aide pour déclencher le centre de préférences cookies depuis n'importe quel bouton
 */
export function openCookiePreferencesModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hotelgest_open_cookie_preferences"));
  }
}
