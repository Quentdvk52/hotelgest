import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLegalDocumentBySlug, getAllLegalDocuments } from "@/modules/legal/legal-service";
import {
  FileText,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Printer,
  Scale,
  Building,
  CheckCircle2,
} from "lucide-react";

export async function generateStaticParams() {
  const docs = getAllLegalDocuments(false);
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = getLegalDocumentBySlug(slug, false);
  if (!res || !res.publishedVersion) {
    return { title: "Document non trouvé" };
  }

  return {
    title: `${res.document.title} — Hôtel Le Vignoble`,
    description: res.document.description,
  };
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = getLegalDocumentBySlug(slug, false);

  if (!res || !res.publishedVersion) {
    notFound();
  }

  const { document: doc, publishedVersion: version } = res;

  const dateFormatted = version.publishedAt
    ? new Date(version.publishedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("fr-FR");

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-stone-900 pb-20">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/legal"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#184f28] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tous les documents légaux</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Version Officielle Publiée ({version.versionNumber})
            </span>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Document Header Card */}
        <header className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0b0f17] via-[#101726] to-[#0b0f17] text-white shadow-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[10px] font-bold uppercase tracking-wider">
              Groupe Hôtel Le Vignoble
            </span>
            <span className="text-stone-400 text-xs">• République du Bénin</span>
            <span className="text-stone-400 text-xs">• Document Référence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
            {doc.title}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-2xl">
            {doc.description}
          </p>

          <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Dernière mise à jour : {dateFormatted}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Identifiant de version : {version.id}</span>
            </div>
          </div>
        </header>

        {/* Formatted Text Content */}
        <article className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 shadow-sm leading-relaxed text-stone-800 space-y-6 text-sm">
          {version.content.split("\n\n").map((block, idx) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith("# ")) {
              return (
                <h2
                  key={idx}
                  className="font-serif text-2xl font-bold text-stone-950 pt-4 pb-2 border-b border-stone-200"
                >
                  {trimmed.replace("# ", "")}
                </h2>
              );
            }

            if (trimmed.startsWith("### ")) {
              return (
                <h3
                  key={idx}
                  className="font-serif text-lg font-bold text-[#184f28] pt-3 pb-1"
                >
                  {trimmed.replace("### ", "")}
                </h3>
              );
            }

            if (trimmed === "---") {
              return <hr key={idx} className="border-stone-200 my-6" />;
            }

            if (trimmed.startsWith("- ")) {
              const items = trimmed.split("\n");
              return (
                <ul key={idx} className="space-y-2 pl-4 list-disc marker:text-[#d4af37]">
                  {items.map((it, i) => (
                    <li key={i} className="text-stone-700">
                      {it.replace(/^- /, "")}
                    </li>
                  ))}
                </ul>
              );
            }

            if (trimmed.match(/^\d+\. /)) {
              const items = trimmed.split("\n");
              return (
                <ol key={idx} className="space-y-2 pl-4 list-decimal marker:font-bold marker:text-stone-900">
                  {items.map((it, i) => (
                    <li key={i} className="text-stone-700">
                      {it.replace(/^\d+\. /, "")}
                    </li>
                  ))}
                </ol>
              );
            }

            return (
              <p key={idx} className="text-stone-700 leading-relaxed font-light">
                {trimmed}
              </p>
            );
          })}
        </article>

        {/* Footer Guarantee */}
        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-[#184f28] flex-shrink-0" />
            <span>
              Document officiel conservé au registre juridique et numérique du Groupe Hôtel Le Vignoble.
            </span>
          </div>
          <Link
            href="/legal"
            className="text-xs font-bold text-[#184f28] hover:underline flex-shrink-0"
          >
            Retour au sommaire →
          </Link>
        </div>
      </main>
    </div>
  );
}
