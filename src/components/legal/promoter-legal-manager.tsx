"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LegalDocument,
  LegalDocumentVersion,
  CookieConsentSettings,
} from "@/modules/legal/types";
import {
  getAllLegalDocuments,
  saveDraftVersion,
  publishVersion,
  restoreVersionAsDraft,
  updateDocumentMetadata,
  getCookieSettings,
  updateCookieSettings,
  diffLines,
} from "@/modules/legal/legal-service";
import { findPlaceholders } from "@/modules/legal/default-documents";
import {
  FileText,
  ShieldCheck,
  Scale,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  History,
  Save,
  Send,
  RotateCcw,
  Sparkles,
  Layers,
  Lock,
  Building,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  ExternalLink,
  Cookie,
  AlertCircle,
  HelpCircle,
  Edit3,
} from "lucide-react";

interface PromoterLegalManagerProps {
  activeUser: any;
}

export function PromoterLegalManager({ activeUser }: PromoterLegalManagerProps) {
  const [documents, setDocuments] = useState<LegalDocument[]>(() => {
    try {
      return getAllLegalDocuments(true);
    } catch {
      return [];
    }
  });
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-mentions-legales");
  const [activeTab, setActiveTab] = useState<"EDIT" | "HISTORY" | "DIFF" | "COOKIES">("EDIT");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Editor states
  const [draftContent, setDraftContent] = useState<string>("");
  const [summaryOfChanges, setSummaryOfChanges] = useState<string>("");
  const [isPublicVisible, setIsPublicVisible] = useState<boolean>(true);
  const [docScope, setDocScope] = useState<any>("GROUPE");
  const [docLanguage, setDocLanguage] = useState<any>("FR");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);

  // Publish confirmation modal
  const [publishModalOpen, setPublishModalOpen] = useState<boolean>(false);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  // Diff comparison states
  const [diffVersionAId, setDiffVersionAId] = useState<string>("");
  const [diffVersionBId, setDiffVersionBId] = useState<string>("");

  // Cookie settings state
  const [cookieSettings, setCookieSettings] = useState<CookieConsentSettings>(() => {
    try {
      return getCookieSettings();
    } catch {
      return {
        version: "1.0",
        bannerTitle: "Gestion de vos préférences sur les traceurs & cookies",
        bannerDescription: "Hôtel Le Vignoble utilise des cookies essentiels au bon fonctionnement du site et de la réservation.",
        categories: [],
        updatedAt: new Date().toISOString(),
        updatedBy: "Direction Générale",
      };
    }
  });

  const isAuthorized = !activeUser || activeUser?.roleCode === "PROMOTER" || activeUser?.roleCode === "FINANCIAL_DIRECTOR";

  const loadDocuments = () => {
    const docs = getAllLegalDocuments(true);
    setDocuments([...docs]);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;

  // Sync editor when selectedDoc changes
  useEffect(() => {
    if (selectedDoc) {
      const draft = selectedDoc.versions.find((v) => v.status === "BROUILLON");
      const published = selectedDoc.versions.find((v) => v.id === selectedDoc.currentPublishedVersionId);
      const baseVer = draft || published || selectedDoc.versions[0];
      setDraftContent(baseVer?.content || "");
      setSummaryOfChanges(draft?.summaryOfChanges || "");
      setIsPublicVisible(selectedDoc.isPubliclyVisible);
      setDocScope(selectedDoc.scope);
      setDocLanguage(selectedDoc.language);

      // Default diff versions
      if (selectedDoc.versions.length >= 2) {
        setDiffVersionAId(selectedDoc.versions[0].id);
        setDiffVersionBId(selectedDoc.versions[1].id);
      } else if (selectedDoc.versions.length === 1) {
        setDiffVersionAId(selectedDoc.versions[0].id);
        setDiffVersionBId(selectedDoc.versions[0].id);
      }
    }
  }, [selectedDocId, documents]);

  const currentPublishedVer = selectedDoc?.versions?.find(
    (v) => v.id === selectedDoc?.currentPublishedVersionId && v.status === "PUBLIE"
  ) || null;
  const currentDraftVer = selectedDoc?.versions?.find((v) => v.status === "BROUILLON") || null;

  // Incomplete placeholders detected in current draft
  const currentIncompletePlaceholders = findPlaceholders(draftContent || "");

  // Total incomplete placeholders across all documents
  const allIncompletePlaceholders = documents.flatMap((d) => {
    const pub = d.versions?.find((v) => v.id === d.currentPublishedVersionId) || d.versions?.[0];
    return pub ? findPlaceholders(pub.content) : [];
  });
  const uniqueIncompleteCount = Array.from(new Set(allIncompletePlaceholders)).length;

  const handleSaveDraft = () => {
    if (!isAuthorized) {
      alert("Privilège insuffisant. Seuls le Promoteur et le DAF peuvent modifier les documents.");
      return;
    }
    setIsSaving(true);
    const res = saveDraftVersion(selectedDoc.id, draftContent, summaryOfChanges, {
      id: activeUser?.id || "user-promoter-01",
      name: activeUser?.fullName || "Eddy GNACADJA (Promoteur)",
      roleCode: activeUser?.roleCode || "PROMOTER",
    });

    if (res.success) {
      // update metadata if changed
      updateDocumentMetadata(
        selectedDoc.id,
        { isPubliclyVisible: isPublicVisible, scope: docScope, language: docLanguage },
        { roleCode: activeUser?.roleCode || "PROMOTER" }
      );
      loadDocuments();
      setNotificationMsg({
        type: "success",
        text: "Brouillon enregistré avec succès. La version publique n'est pas modifiée tant que vous ne publiez pas.",
      });
    } else {
      setNotificationMsg({ type: "error", text: res.error || "Erreur d'enregistrement" });
    }
    setIsSaving(false);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleConfirmPublish = () => {
    if (!isAuthorized) return;
    setIsSaving(true);

    // First save current content as draft
    saveDraftVersion(selectedDoc.id, draftContent, summaryOfChanges, {
      id: activeUser?.id || "user-promoter-01",
      name: activeUser?.fullName || "Eddy GNACADJA (Promoteur)",
      roleCode: activeUser?.roleCode || "PROMOTER",
    });

    // Update metadata
    updateDocumentMetadata(
      selectedDoc.id,
      { isPubliclyVisible: isPublicVisible, scope: docScope, language: docLanguage },
      { roleCode: activeUser?.roleCode || "PROMOTER" }
    );

    // Get the target version (either draft or latest)
    const latestDoc = getAllLegalDocuments(true).find((d) => d.id === selectedDoc.id);
    const targetVer = latestDoc?.versions.find((v) => v.status === "BROUILLON") || latestDoc?.versions[0];

    if (targetVer) {
      const res = publishVersion(selectedDoc.id, targetVer.id, {
        id: activeUser?.id || "user-promoter-01",
        name: activeUser?.fullName || "Eddy GNACADJA (Promoteur)",
        roleCode: activeUser?.roleCode || "PROMOTER",
      });

      if (res.success) {
        loadDocuments();
        setPublishModalOpen(false);
        setNotificationMsg({
          type: "success",
          text: `La nouvelle version ${res.publishedVersion?.versionNumber} est maintenant officiellement publiée et visible sur le site public !`,
        });
      } else {
        alert(res.error);
      }
    }
    setIsSaving(false);
    setTimeout(() => setNotificationMsg(null), 6000);
  };

  const handleRestoreVersion = (versionId: string) => {
    if (!confirm("Voulez-vous restaurer cette ancienne version en tant que nouveau brouillon ?")) return;
    const res = restoreVersionAsDraft(selectedDoc.id, versionId, {
      id: activeUser?.id || "user-promoter-01",
      name: activeUser?.fullName || "Eddy GNACADJA",
      roleCode: activeUser?.roleCode || "PROMOTER",
    });

    if (res.success && res.newDraft) {
      loadDocuments();
      setDraftContent(res.newDraft.content);
      setActiveTab("EDIT");
      setNotificationMsg({
        type: "success",
        text: `Version ${res.newDraft.versionNumber} restaurée comme brouillon de travail.`,
      });
    }
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleSaveCookieSettings = () => {
    if (!isAuthorized) return;
    updateCookieSettings(cookieSettings, {
      name: activeUser?.fullName || "Direction Générale",
      roleCode: activeUser?.roleCode || "PROMOTER",
    });
    setNotificationMsg({
      type: "success",
      text: "Réglages de la bannière et des catégories de cookies enregistrés avec succès.",
    });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Filtered documents
  const filteredDocs = documents.filter((d) => {
    if (categoryFilter !== "ALL" && d.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (!selectedDoc) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-stone-200 shadow-sm">
        <div className="w-8 h-8 border-4 border-[#184f28] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-500 font-medium">Chargement des documents légaux...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider border border-[#d4af37]/30">
              Gouvernance Juridique & Conformité
            </span>
            <span className="text-xs text-stone-400">• République du Bénin (Loi n° 2017-20)</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-serif">
            Gestion des Documents Légaux, CGV & Traceurs
          </h2>
          <p className="text-xs text-stone-500">
            Éditez en brouillon, prévisualisez et publiez les mentions légales, conditions de séjour, restauration, véhicules, traiteur et politique de confidentialité.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/legal"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            <span>Voir l&apos;Espace Public</span>
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab("COOKIES")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "COOKIES"
                ? "bg-[#184f28] text-white shadow-md"
                : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Cookie className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Gestionnaire Cookies</span>
          </button>
        </div>
      </div>

      {/* Notification feedback */}
      {notificationMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in ${
            notificationMsg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : notificationMsg.type === "warning"
              ? "bg-amber-50 border border-amber-200 text-amber-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            )}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Total Documents</span>
          <div className="text-2xl font-black text-stone-900">{documents.length} Références</div>
          <span className="text-[10px] text-stone-500 font-medium">12 modèles obligatoires intégrés</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Documents Publiés</span>
          <div className="text-2xl font-black text-emerald-700">
            {documents.filter((d) => d.isPubliclyVisible && d.currentPublishedVersionId).length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Accessibles aux hôtes en ligne</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Brouillons en Cours</span>
          <div className="text-2xl font-black text-amber-600">
            {documents.filter((d) => d.versions.some((v) => v.status === "BROUILLON")).length}
          </div>
          <span className="text-[10px] text-amber-700 font-medium">Modifications privées non publiées</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Champs à Compléter</span>
          <div className="text-2xl font-black text-amber-700">{uniqueIncompleteCount} Placeholders</div>
          <span className="text-[10px] text-amber-800 font-semibold">À renseigner avant validation finale</span>
        </div>
      </div>

      {/* Checklist Banner for Hôtel Le Vignoble */}
      {uniqueIncompleteCount > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-amber-900">
                Checklist des informations officielles propres à Hôtel Le Vignoble restant à compléter :
              </h4>
              <p className="text-amber-800 font-light leading-relaxed">
                Les modèles ont été préremplis avec les données de base (Bohicon Siège, IFU 0201910839213, 4 établissements). Cependant, pour une sécurité juridique totale, veuillez relire et ajuster les placeholders suivants directement dans l&apos;éditeur :
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {[
                  "DÉNOMINATION LÉGALE & STATUTS",
                  "CAPITAL SOCIAL",
                  "NUMÉRO RCCM GREFFE",
                  "DÉLAIS D'ANNULATION SÉJOUR",
                  "CAUTION VÉHICULES VIP",
                  "RÈGLES ACCUEIL ANIMAUX",
                  "JURIDICTION COMPÉTENTE",
                ].map((item, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-amber-200/80 text-amber-900 font-mono text-[10px] font-bold"
                  >
                    [{item}]
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COOKIES TAB */}
      {activeTab === "COOKIES" ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Configuration du Bandeau & Traceurs de Consentement
                </h3>
                <p className="text-xs text-stone-500">
                  Personnalisez les intitulés, descriptions et catégories de traceurs présentés aux visiteurs.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("EDIT")}
              className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
            >
              ← Retour aux Documents
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Titre du bandeau de consentement
                </label>
                <input
                  type="text"
                  value={cookieSettings.bannerTitle}
                  onChange={(e) =>
                    setCookieSettings({ ...cookieSettings, bannerTitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#184f28]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Message explicatif du bandeau
                </label>
                <textarea
                  rows={3}
                  value={cookieSettings.bannerDescription}
                  onChange={(e) =>
                    setCookieSettings({ ...cookieSettings, bannerDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#184f28]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="font-bold text-stone-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#184f28]" /> Règle de blocage strict :
                </div>
                <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                  Aucun traceur d&apos;analyse ou de partage n&apos;est chargé tant que l&apos;internaute n&apos;a pas cliqué sur « Tout Accepter » ou sélectionné la catégorie concernée.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Catégories de traceurs configurées
              </label>

              <div className="space-y-3">
                {cookieSettings.categories.map((cat, idx) => (
                  <div key={cat.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900">{cat.title}</span>
                      {cat.isMandatory ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Obligatoire
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                          Optionnel
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">{cat.description}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveCookieSettings}
                className="w-full py-3 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#d4af37]" />
                <span>Enregistrer la Configuration des Cookies</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* DOCUMENTS WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Documents List & Filters */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#184f28]"
                />
              </div>

              <div className="overflow-y-auto max-h-[600px] space-y-1.5 pr-1">
                {filteredDocs.map((doc) => {
                  const isSelected = doc.id === selectedDoc.id;
                  const hasDraft = doc.versions.some((v) => v.status === "BROUILLON");
                  const published = doc.versions.find((v) => v.id === doc.currentPublishedVersionId);

                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all border flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-[#184f28]/10 border-[#184f28] text-stone-900 shadow-xs"
                          : "bg-white border-stone-100 hover:border-stone-200 text-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs font-serif truncate">{doc.title}</span>
                        {hasDraft ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider border border-amber-200 shrink-0">
                            Brouillon
                          </span>
                        ) : published ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider border border-emerald-200 shrink-0">
                            {published.versionNumber}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[9px] font-bold uppercase tracking-wider shrink-0">
                            Non publié
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span>Périmètre : {doc.scope}</span>
                        {doc.isPubliclyVisible ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" /> Visible public
                          </span>
                        ) : (
                          <span className="text-stone-400">Masqué</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Editor & Versioning Workspace */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-5">
              {/* Document Header & State Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      /{selectedDoc.slug}
                    </span>
                    {currentPublishedVer && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Publié : {currentPublishedVer.versionNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">
                    {selectedDoc.title}
                  </h3>
                </div>

                {/* Sub-tabs: Édition vs Historique vs Diff */}
                <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("EDIT")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === "EDIT" ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Édition Brouillon</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("HISTORY")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === "HISTORY" ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Historique ({selectedDoc.versions.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("DIFF")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === "DIFF" ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Comparateur Diff</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: EDIT MODE */}
              {activeTab === "EDIT" && (
                <div className="space-y-4">
                  {/* Metadata Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Périmètre d&apos;application
                      </label>
                      <select
                        value={docScope}
                        onChange={(e) => setDocScope(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                      >
                        <option value="GROUPE">Tout le Groupe (4 Hôtels)</option>
                        <option value="BOHICON">Bohicon (Siège)</option>
                        <option value="ABOMEY">Abomey (Cité)</option>
                        <option value="CALAVI">Abomey-Calavi</option>
                        <option value="ZOGBODOMEY">Zogbodomey</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Langue du document
                      </label>
                      <select
                        value={docLanguage}
                        onChange={(e) => setDocLanguage(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                      >
                        <option value="FR">Français (Langue officielle)</option>
                        <option value="EN">Anglais (Traduction internationale)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Visibilité sur le site public
                      </label>
                      <select
                        value={isPublicVisible ? "true" : "false"}
                        onChange={(e) => setIsPublicVisible(e.target.value === "true")}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                      >
                        <option value="true">Affiché sur le site public</option>
                        <option value="false">Masqué aux visiteurs</option>
                      </select>
                    </div>
                  </div>

                  {/* Placeholders alert indicator */}
                  {currentIncompletePlaceholders.length > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900 block">
                            {currentIncompletePlaceholders.length} champs ou placeholders à valider dans ce texte :
                          </span>
                          <span className="text-[11px] text-amber-800 font-light">
                            {currentIncompletePlaceholders.slice(0, 3).join(", ")}
                            {currentIncompletePlaceholders.length > 3 && ` (+${currentIncompletePlaceholders.length - 3} autres)`}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900 shrink-0">
                        À relire
                      </span>
                    </div>
                  )}

                  {/* Markdown Editor Textarea */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center justify-between">
                      <span>Corps du document juridique (Format Markdown supporté) :</span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {draftContent.length} caractères • {draftContent.split("\n").length} lignes
                      </span>
                    </label>
                    <textarea
                      rows={18}
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 font-mono leading-relaxed focus:outline-none focus:border-[#184f28] focus:bg-white transition-colors"
                      placeholder="Rédigez ou collez le texte juridique..."
                    />
                  </div>

                  {/* Summary of changes */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Motif / Résumé des modifications (Traçabilité historique) :
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Mise à jour des coordonnées du siège et des conditions d'annulation 48h..."
                      value={summaryOfChanges}
                      onChange={(e) => setSummaryOfChanges(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#184f28]"
                    />
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[11px] text-stone-400">
                      {currentDraftVer ? (
                        <span className="text-amber-700 font-semibold">
                          ⚠️ Brouillon en cours de révision (Dernière sauvegarde : {new Date(currentDraftVer.createdAt).toLocaleTimeString("fr-FR")})
                        </span>
                      ) : (
                        <span>Texte actuel identique à la version publiée</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Prévisualiser</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Enregistrer Brouillon</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPublishModalOpen(true)}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Publier la Version</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VERSION HISTORY */}
              {activeTab === "HISTORY" && (
                <div className="space-y-4">
                  <div className="text-xs text-stone-500">
                    Registre complet de traçabilité. Chaque modification est versionnée et horodatée.
                  </div>

                  <div className="space-y-3">
                    {selectedDoc.versions.map((ver) => {
                      const isPub = ver.id === selectedDoc.currentPublishedVersionId && ver.status === "PUBLIE";
                      const isDraft = ver.status === "BROUILLON";

                      return (
                        <div
                          key={ver.id}
                          className={`p-4 rounded-2xl border transition-all space-y-2 ${
                            isPub
                              ? "bg-emerald-50/50 border-emerald-300"
                              : isDraft
                              ? "bg-amber-50/50 border-amber-300"
                              : "bg-stone-50 border-stone-200"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-stone-900">
                                {ver.versionNumber}
                              </span>
                              {isPub && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider border border-emerald-200">
                                  Actuellement Publiée
                                </span>
                              )}
                              {isDraft && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                                  Brouillon de travail
                                </span>
                              )}
                              {ver.status === "ARCHIVE" && (
                                <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 text-[9px] font-bold uppercase tracking-wider">
                                  Archivée
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-stone-500">
                              <span>Rédigé par : <strong>{ver.authorName}</strong></span>
                              <span>• {new Date(ver.createdAt).toLocaleDateString("fr-FR")}</span>
                            </div>
                          </div>

                          <p className="text-xs text-stone-600 italic">
                            « {ver.summaryOfChanges} »
                          </p>

                          <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-stone-400 font-mono">
                              ID: {ver.id} • {ver.incompletePlaceholders.length} placeholders
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftContent(ver.content);
                                  setActiveTab("EDIT");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-[11px] font-semibold"
                              >
                                Charger dans l&apos;éditeur
                              </button>

                              {!isPub && (
                                <button
                                  type="button"
                                  onClick={() => handleRestoreVersion(ver.id)}
                                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3 text-[#d4af37]" />
                                  <span>Restaurer comme brouillon</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: SIDE BY SIDE DIFF COMPARATOR */}
              {activeTab === "DIFF" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-700">Comparer Version A :</span>
                      <select
                        value={diffVersionAId}
                        onChange={(e) => setDiffVersionAId(e.target.value)}
                        className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-semibold"
                      >
                        {selectedDoc.versions.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.versionNumber} ({v.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-700">Avec Version B :</span>
                      <select
                        value={diffVersionBId}
                        onChange={(e) => setDiffVersionBId(e.target.value)}
                        className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-semibold"
                      >
                        {selectedDoc.versions.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.versionNumber} ({v.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Diff View Box */}
                  <div className="border border-stone-200 rounded-2xl p-4 bg-stone-950 text-white font-mono text-[11px] max-h-[500px] overflow-y-auto space-y-1">
                    {(() => {
                      const verA = selectedDoc.versions.find((v) => v.id === diffVersionAId) || selectedDoc.versions[0];
                      const verB = selectedDoc.versions.find((v) => v.id === diffVersionBId) || selectedDoc.versions[0];
                      const diffs = diffLines(verA?.content || "", verB?.content || "");

                      return diffs.map((d, i) => (
                        <div
                          key={i}
                          className={`px-2 py-0.5 rounded leading-relaxed ${
                            d.type === "add"
                              ? "bg-emerald-950/80 text-emerald-300 border-l-2 border-emerald-500"
                              : d.type === "remove"
                              ? "bg-rose-950/80 text-rose-300 border-l-2 border-rose-500 line-through opacity-75"
                              : "text-stone-400"
                          }`}
                        >
                          <span className="mr-2 text-stone-600 select-none">
                            {d.type === "add" ? "+" : d.type === "remove" ? "-" : " "}
                          </span>
                          {d.line || " "}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION BEFORE PUBLISH MODAL */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-[#184f28]/10 text-[#184f28] flex items-center justify-center mb-1">
              <Send className="w-6 h-6 text-[#184f28]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Confirmer la Publication Officielle
              </h3>
              <p className="text-xs text-stone-500">
                Vous êtes sur le point de remplacer la version publique de : <strong>{selectedDoc.title}</strong>.
              </p>
            </div>

            {/* Warning if placeholders remain */}
            {currentIncompletePlaceholders.length > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Avertissement : {currentIncompletePlaceholders.length} mentions à compléter détectées !
                </div>
                <p className="text-[11px] text-amber-700 font-light leading-relaxed">
                  Le texte contient encore des placeholders qui apparaîtront tels quels aux visiteurs. Vous pouvez néanmoins publier si vous souhaitez mettre en ligne cette version intermédiaire :
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1 pt-1 font-mono text-[10px] text-amber-950 font-bold">
                  {currentIncompletePlaceholders.map((p, i) => (
                    <div key={i}>• {p}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tous les placeholders ont été renseignés. Le document est prêt pour diffusion officielle.</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
              <div><strong>Auteur certifié :</strong> {activeUser?.fullName || "Direction Générale"}</div>
              <div><strong>Date & Heure :</strong> {new Date().toLocaleString("fr-FR")}</div>
              <div><strong>Portée :</strong> {docScope} • {docLanguage}</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-xs text-stone-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="flex-1 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] font-bold text-xs text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#d4af37]" />
                <span>Confirmer & Publier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW PUBLIC VIEW MODAL */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#184f28]" />
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Prévisualisation du Rendu Public
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 leading-relaxed font-light space-y-4">
              <div className="font-serif text-lg font-bold text-stone-900 border-b border-stone-200 pb-2">
                {selectedDoc.title}
              </div>
              <div className="whitespace-pre-wrap font-sans text-stone-700">
                {draftContent}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs"
              >
                Fermer l&apos;Aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
