"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Megaphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Plus,
  Calendar,
  Users,
  Eye,
  FileText,
  ShieldCheck,
  Send,
  X,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  audienceType: string;
  targetPropertyName?: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  status: "DRAFT" | "PENDING_APPROVAL" | "SCHEDULED" | "PUBLISHED" | "CANCELLED";
  publishDate: string;
  requiresAcknowledgment: boolean;
  receiptsCount: number;
}

function AnnouncementsContent() {
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get("id");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(highlightedId);
  const [acknowledgedMap, setAcknowledgedMap] = useState<Record<string, boolean>>({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAudience, setNewAudience] = useState("ALL_STAFF");
  const [newPriority, setNewPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [requiresAck, setRequiresAck] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncements(json.data);
        if (!selectedId && json.data.length > 0) {
          setSelectedId(json.data[0].id);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (highlightedId) {
      setSelectedId(highlightedId);
    }
  }, [highlightedId]);

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACKNOWLEDGE", announcementId: id }),
      });
      const json = await res.json();
      if (json.success) {
        setAcknowledgedMap((prev) => ({ ...prev, [id]: true }));
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, receiptsCount: json.receiptsCount } : a))
        );
      }
    } catch {
      // Ignore
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          title: newTitle,
          content: newContent,
          audienceType: newAudience,
          priority: newPriority,
          requiresAcknowledgment: requiresAck,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncements((prev) => [json.data, ...prev]);
        setSelectedId(json.data.id);
        setCreateModalOpen(false);
        setNewTitle("");
        setNewContent("");
      }
    } catch {
      // Ignore
    } finally {
      setCreating(false);
    }
  };

  const selectedAnnouncement =
    announcements.find((a) => a.id === selectedId) || announcements[0];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">URGENT</span>;
      case "HIGH":
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">HAUTE PRIORITÉ</span>;
      default:
        return <span className="text-[10px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-full">NORMALE</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Annonces Officielles & Notes de Service
            </h1>
            <p className="text-xs text-stone-500">
              Communications institutionnelles de la Direction Générale et des Gérants de Site.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#184f28] hover:bg-[#123e1f] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Annonce</span>
        </button>
      </div>

      {/* Main Grid: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bulletins List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400 px-1">
            Communications en cours ({announcements.length})
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-xl border border-stone-200">
              Chargement des annonces...
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-xl border border-stone-200">
              Aucune annonce officielle publiée pour le moment.
            </div>
          ) : (
            announcements.map((ann) => {
              const isSelected = ann.id === selectedAnnouncement?.id;
              return (
                <div
                  key={ann.id}
                  onClick={() => setSelectedId(ann.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-stone-900 text-white border-stone-850 shadow-md"
                      : "bg-white hover:bg-stone-50 text-stone-900 border-stone-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {getPriorityBadge(ann.priority)}
                    <span className={`text-[10px] font-mono ${isSelected ? "text-stone-400" : "text-stone-400"}`}>
                      {new Date(ann.publishDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold mb-1.5 leading-snug line-clamp-2">
                    {ann.title}
                  </h3>

                  <div className={`flex items-center justify-between text-[10px] pt-2 border-t ${
                    isSelected ? "border-stone-800 text-stone-400" : "border-stone-100 text-stone-500"
                  }`}>
                    <span>Par {ann.authorName}</span>
                    <span className="font-semibold">
                      {ann.audienceType === "ALL_STAFF" ? "Tout le personnel" : ann.targetPropertyName || "Agence"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Announcement View */}
        <div className="lg:col-span-7">
          {selectedAnnouncement ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="border-b border-stone-100 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedAnnouncement.priority)}
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {selectedAnnouncement.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Publié le {new Date(selectedAnnouncement.publishDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-stone-900 leading-tight">
                  {selectedAnnouncement.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#184f28]" />
                    <span className="font-semibold">{selectedAnnouncement.authorName}</span>
                    <span className="text-stone-400">({selectedAnnouncement.authorRole})</span>
                  </div>
                  <span className="text-stone-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <span>Audience : {selectedAnnouncement.audienceType === "ALL_STAFF" ? "Consolidé Groupe (Tous sites)" : selectedAnnouncement.targetPropertyName}</span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50/50 p-5 rounded-xl border border-stone-100">
                {selectedAnnouncement.content}
              </div>

              {/* Acknowledgment Section */}
              {selectedAnnouncement.requiresAcknowledgment && (
                <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-amber-700" />
                      Accusé de prise de connaissance obligatoire
                    </h4>
                    <p className="text-[11px] text-amber-900/80">
                      Chaque collaborateur concerné doit confirmer avoir lu et intégré ces directives.
                    </p>
                  </div>

                  {acknowledgedMap[selectedAnnouncement.id] ? (
                    <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accusé Enregistré</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(selectedAnnouncement.id)}
                      className="px-4 py-2 bg-[#184f28] hover:bg-[#123e1f] text-white rounded-xl text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
                    >
                      J&apos;ai pris connaissance ✓
                    </button>
                  )}
                </div>
              )}

              {/* Receipts Counter */}
              <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-100 font-mono">
                <span>Réf. {selectedAnnouncement.id}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  {selectedAnnouncement.receiptsCount} collaborateurs ont accusé réception
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
              Sélectionnez une annonce dans la liste de gauche pour en afficher le détail.
            </div>
          )}
        </div>
      </div>

      {/* Modal Creation */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#184f28]" />
                Rédiger une Note Officielle
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Titre de la communication *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Directives d'exploitation haute saison..."
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#184f28]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Audience</label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#184f28]"
                  >
                    <option value="ALL_STAFF">Tout le personnel (Groupe)</option>
                    <option value="PROPERTY">Mon établissement uniquement</option>
                    <option value="ROLE">Rôles spécifiques</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Priorité</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-[#184f28]"
                  >
                    <option value="NORMAL">Normale</option>
                    <option value="HIGH">Haute priorité</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contenu détaillé de la note *
                </label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Rédigez les consignes formelles, dates d'application, directives..."
                  className="w-full text-xs p-3 border border-stone-200 rounded-xl focus:outline-none focus:border-[#184f28]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reqAck"
                  checked={requiresAck}
                  onChange={(e) => setRequiresAck(e.target.checked)}
                  className="rounded border-stone-300 text-[#184f28] focus:ring-[#184f28]"
                />
                <label htmlFor="reqAck" className="text-xs text-stone-700 font-medium">
                  Exiger un accusé « J&apos;ai pris connaissance » par les destinataires
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#184f28] hover:bg-[#123e1f] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{creating ? "Publication..." : "Publier l'annonce"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Chargement des annonces...</div>}>
      <AnnouncementsContent />
    </Suspense>
  );
}
