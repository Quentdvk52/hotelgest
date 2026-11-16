import React from "react";
import Link from "next/link";
import { getAllLegalDocuments } from "@/modules/legal/legal-service";
import {
  FileText,
  ShieldCheck,
  Scale,
  Clock,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Lock,
  Phone,
  Mail,
  Building,
} from "lucide-react";

export const metadata = {
  title: "Documents Légaux, CGV & Conformité Réglementaire",
  description:
    "Consultez les mentions légales, conditions générales de vente, politique de confidentialité et règlements intérieurs du Groupe Hôtel Le Vignoble au Bénin.",
};

export default function LegalIndexPage() {
  const documents = getAllLegalDocuments(false);

  const categoriesMap: Record<string, { label: string; icon: any; color: string }> = {
    MENTIONS: { label: "Éditeur & Identification", icon: Building, color: "text-blue-700 bg-blue-50 border-blue-200" },
    CONFIDENTIALITE: { label: "Données Personnelles & RGPD", icon: Lock, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    COOKIES: { label: "Traceurs & Cookies", icon: ShieldCheck, color: "text-amber-700 bg-amber-50 border-amber-200" },
    CGU: { label: "Conditions du Site", icon: Scale, color: "text-stone-700 bg-stone-100 border-stone-200" },
    CGV_SEJOUR: { label: "Hébergement & Séjour", icon: BookOpen, color: "text-[#184f28] bg-emerald-50 border-emerald-200" },
    ANNULATION: { label: "Annulation & No-Show", icon: Clock, color: "text-rose-700 bg-rose-50 border-rose-200" },
    RESTAURATION: { label: "Restauration & Room Service", icon: FileText, color: "text-amber-700 bg-amber-50 border-amber-200" },
    LOCATION_VEHICULES: { label: "Flotte & Chauffeurs VIP", icon: FileText, color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
    EVENEMENTS: { label: "Salles & Réceptions", icon: FileText, color: "text-purple-700 bg-purple-50 border-purple-200" },
    TRAITEUR: { label: "Traiteur & Matériel", icon: FileText, color: "text-pink-700 bg-pink-50 border-pink-200" },
    RECLAMATIONS: { label: "Réclamations & Médiation", icon: Scale, color: "text-amber-700 bg-amber-50 border-amber-200" },
    ACCESSIBILITE: { label: "Accessibilité Numérique", icon: ShieldCheck, color: "text-teal-700 bg-teal-50 border-teal-200" },
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-stone-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#0b0f17] via-[#101726] to-[#0b0f17] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
              Référentiel Juridique & Hôtelier
            </span>
            <span className="text-xs text-stone-400">• République du Bénin</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
            Documents Légaux & Conditions Générales
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl font-light leading-relaxed">
            Consultez en toute transparence l&apos;ensemble des conditions contractuelles, mentions réglementaires, politiques de protection des données et engagements de service du Groupe Hôtel Le Vignoble.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
          <span>{documents.length} documents légaux officiellement publiés</span>
          <span>Dernière mise à jour générale : 16 Novembre 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => {
            const cat = categoriesMap[doc.category] || {
              label: doc.category,
              icon: FileText,
              color: "text-stone-700 bg-stone-100 border-stone-200",
            };
            const Icon = cat.icon;
            const currentVer = doc.versions[0];

            return (
              <Link
                key={doc.id}
                href={`/legal/${doc.slug}`}
                className="group p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:border-[#184f28] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cat.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </span>

                    {currentVer && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {currentVer.versionNumber}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-stone-900 group-hover:text-[#184f28] transition-colors font-serif">
                    {doc.title}
                  </h2>

                  <p className="text-xs text-stone-500 leading-relaxed font-light line-clamp-2">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#184f28]">
                  <span>Consulter le document</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Assistance & Conciergerie Banner */}
        <div className="p-8 rounded-3xl bg-stone-900 text-white border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-white">
                Besoin d&apos;un renseignement sur nos conditions ?
              </h3>
              <p className="text-xs text-stone-300 font-light max-w-xl">
                Notre conciergerie et notre direction administrative se tiennent à votre entière disposition pour toute question relative à votre réservation ou à l&apos;organisation de vos événements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:+22997001122"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-bold transition-all shadow-md"
              >
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>+229 97 00 11 22</span>
              </a>
              <a
                href="mailto:contact@hotel-levignoble.bj"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all border border-stone-700"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>contact@hotel-levignoble.bj</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
