"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Building,
  ShieldCheck,
  Star,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  Plus,
  Layers,
  Sparkles,
  Award,
  Wallet,
} from "lucide-react";
import { SEED_PROPERTIES } from "@/lib/db/seed";
import {
  clientsService,
  ClientRecord,
  ClientCategory,
  CLIENT_CATEGORY_LABELS,
} from "@/modules/clients/clients-service";
import { CsvExcelImporterModal } from "@/components/common/csv-excel-importer-modal";

interface ClientsManagerProps {
  isPromoter: boolean;
  isManager: boolean;
  managerPropertyId?: string;
}

export function ClientsManager({
  isPromoter,
  isManager,
  managerPropertyId,
}: ClientsManagerProps) {
  // If manager, enforce their propertyId; if promoter, default to "ALL"
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    isManager && managerPropertyId ? managerPropertyId : "ALL"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClientForView, setSelectedClientForView] = useState<ClientRecord | null>(null);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);

  // Form State
  const [clientForm, setClientForm] = useState<{
    fullName: string;
    category: ClientCategory;
    phone: string;
    email: string;
    propertyId: string;
    city: string;
    country: string;
    taxId: string;
    rccm: string;
    companyContactPerson: string;
    preferences: string;
    totalSpendXof: number;
    visitsCount: number;
    status: "ACTIF" | "VIP" | "PROSPECT" | "ARCHIVE";
    notes: string;
  }>({
    fullName: "",
    category: "PARTICULIER",
    phone: "",
    email: "",
    propertyId: isManager && managerPropertyId ? managerPropertyId : "prop-bohicon-001",
    city: "Bohicon",
    country: "Bénin",
    taxId: "",
    rccm: "",
    companyContactPerson: "",
    preferences: "",
    totalSpendXof: 0,
    visitsCount: 1,
    status: "ACTIF",
    notes: "",
  });

  // Active property object (for manager)
  const currentManagerProperty = useMemo(() => {
    return SEED_PROPERTIES.find((p) => p.id === managerPropertyId) || SEED_PROPERTIES[0];
  }, [managerPropertyId]);

  // Clients list from service
  const clientsList = useMemo(() => {
    const effectivePropId = isManager && managerPropertyId ? managerPropertyId : selectedPropertyId;
    return clientsService.listClients({
      propertyId: effectivePropId,
      category: selectedCategory,
      search: searchQuery,
    });
  }, [isManager, managerPropertyId, selectedPropertyId, selectedCategory, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const effectivePropId = isManager && managerPropertyId ? managerPropertyId : selectedPropertyId;
    return clientsService.getStats(effectivePropId);
  }, [isManager, managerPropertyId, selectedPropertyId]);

  const showToast = (msg: string, type: "success" | "info" = "success") => {
    setFeedbackToast({ msg, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setClientForm({
      fullName: "",
      category: "PARTICULIER",
      phone: "",
      email: "",
      propertyId: isManager && managerPropertyId ? managerPropertyId : (selectedPropertyId !== "ALL" ? selectedPropertyId : "prop-bohicon-001"),
      city: isManager ? (currentManagerProperty.city || "Bénin") : "Bohicon",
      country: "Bénin",
      taxId: "",
      rccm: "",
      companyContactPerson: "",
      preferences: "",
      totalSpendXof: 0,
      visitsCount: 1,
      status: "ACTIF",
      notes: "",
    });
    setIsClientModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (client: ClientRecord) => {
    setEditingClient(client);
    setClientForm({
      fullName: client.fullName,
      category: client.category,
      phone: client.phone,
      email: client.email,
      propertyId: client.propertyId,
      city: client.city,
      country: client.country,
      taxId: client.taxId || "",
      rccm: client.rccm || "",
      companyContactPerson: client.companyContactPerson || "",
      preferences: client.preferences || "",
      totalSpendXof: client.totalSpendXof || 0,
      visitsCount: client.visitsCount || 1,
      status: client.status,
      notes: client.notes || "",
    });
    setIsClientModalOpen(true);
  };

  // Save Client (Create or Update)
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.fullName.trim()) {
      alert("Le nom ou la raison sociale est obligatoire.");
      return;
    }

    const payload = {
      ...clientForm,
      taxId: clientForm.taxId.trim() || undefined,
      rccm: clientForm.rccm.trim() || undefined,
      companyContactPerson: clientForm.companyContactPerson.trim() || undefined,
      preferences: clientForm.preferences.trim() || undefined,
      notes: clientForm.notes.trim() || undefined,
    };

    if (editingClient) {
      clientsService.updateClient(editingClient.id, payload);
      showToast(`Fiche de ${payload.fullName} mise à jour avec succès.`);
    } else {
      clientsService.addClient(payload);
      showToast(`Client ${payload.fullName} enregistré avec succès.`);
    }

    setIsClientModalOpen(false);
  };

  // Delete Client
  const handleDeleteClient = (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de la fiche client « ${name} » ?`)) {
      clientsService.deleteClient(id);
      showToast(`Fiche de ${name} supprimée.`, "info");
      if (selectedClientForView?.id === id) {
        setSelectedClientForView(null);
      }
    }
  };

  // Handle Bulk Import from CSV/Excel
  const handleBulkImport = (importedRows: any[]) => {
    const result = clientsService.addClientsBulk(importedRows);
    showToast(
      `${result.added.length} client(s) importé(s) avec succès ! ${
        result.duplicates > 0 ? `(${result.duplicates} doublon(s) ignoré(s))` : ""
      }`
    );
  };

  // Export current list to CSV
  const handleExportCsv = () => {
    const effectivePropId = isManager && managerPropertyId ? managerPropertyId : selectedPropertyId;
    const clientsToExport = clientsService.listClients({
      propertyId: effectivePropId,
      category: selectedCategory,
      search: searchQuery,
    });

    const headers = [
      "ID",
      "Nom_Complet",
      "Categorie",
      "Telephone",
      "Email",
      "Site",
      "Ville",
      "Pays",
      "IFU",
      "RCCM",
      "Contact_Entreprise",
      "Preferences",
      "Total_Depenses_XOF",
      "Nombre_Visites",
      "Statut",
      "Date_Creation",
    ];

    const rows = clientsToExport.map((c) => [
      c.id,
      `"${c.fullName.replace(/"/g, '""')}"`,
      c.category,
      `"${c.phone}"`,
      c.email,
      `"${c.propertyName || ""}"`,
      `"${c.city}"`,
      `"${c.country}"`,
      c.taxId || "",
      c.rccm || "",
      `"${(c.companyContactPerson || "").replace(/"/g, '""')}"`,
      `"${(c.preferences || "").replace(/"/g, '""')}"`,
      c.totalSpendXof,
      c.visitsCount,
      c.status,
      c.createdAt,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `clients_hotel_vignoble_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${clientsToExport.length} clients exportés en CSV avec succès.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-stone-900 border border-[#d4af37]/60 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{feedbackToast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-[#d4af37]/30 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
              {isPromoter ? "Direction Générale & Multi-Sites" : "Gérance d'Établissement"}
            </span>
            {isManager && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Agence : {currentManagerProperty.name}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black font-serif text-white tracking-wide flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#d4af37]" />
            <span>
              {isPromoter
                ? "Fichier Clients & Fidélité Multi-Sites"
                : `Répertoire Clients • ${currentManagerProperty.name}`}
            </span>
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
            {isPromoter
              ? "Base centralisée des clients du Groupe Le Vignoble : particuliers, entreprises, délégations officielles et membres fidélité. Gestion par agence et imports CSV/Excel par lot."
              : `Gestion du portefeuille clients et habitués rattachés à votre agence (${currentManagerProperty.city}). Suivi des préférences, IFU fiscal et historiques de consommation.`}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Exporter en CSV"
          >
            <Download className="w-4 h-4 text-[#d4af37]" />
            <span>Exporter CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Importer un fichier CSV ou Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importer CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Client</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Clients</span>
            <Users className="w-4 h-4 text-stone-500" />
          </div>
          <p className="text-2xl font-black text-stone-900">{stats.total}</p>
          <span className="text-[10px] text-stone-500 mt-0.5 block">Portefeuille actif</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Clients VIP</span>
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.vips}</p>
          <span className="text-[10px] text-stone-500 mt-0.5 block">Suites & Personnalités</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Corporate & Délégations</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700">{stats.corporate}</p>
          <span className="text-[10px] text-stone-500 mt-0.5 block">Entreprises & Ministères</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Habitués Fidèles</span>
            <Star className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.habitues}</p>
          <span className="text-[10px] text-stone-500 mt-0.5 block">Fréquentation régulière</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">C.A. Cumulé</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-black text-amber-900 leading-tight">
            {stats.totalSpendXof.toLocaleString("fr-FR")} XOF
          </p>
          <span className="text-[10px] text-amber-700 mt-0.5 block">Consommations globales</span>
        </div>
      </div>

      {/* Filter Bar: Site & Category */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Site Selector (Only available to Promoter; locked for Manager) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              Site / Agence :
            </span>

            {isPromoter ? (
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-300 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#d4af37]"
              >
                <option value="ALL">✦ Tous les Sites du Groupe (Vue Globale)</option>
                {SEED_PROPERTIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-300 text-xs font-bold text-stone-900">
                {currentManagerProperty.name} ({currentManagerProperty.city})
              </span>
            )}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, IFU, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#d4af37] focus:bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1 shrink-0">
            Catégorie :
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedCategory === "ALL"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Toutes ({stats.total})
          </button>

          {(Object.keys(CLIENT_CATEGORY_LABELS) as ClientCategory[]).map((catKey) => {
            const meta = CLIENT_CATEGORY_LABELS[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#d4af37] text-black font-bold shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-stone-800">
              Liste des Clients ({clientsList.length})
            </h3>
            {searchQuery && (
              <span className="text-xs text-stone-500">
                pour la recherche &laquo; {searchQuery} &raquo;
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-500">
            Triés par date d&apos;enregistrement récente
          </span>
        </div>

        {clientsList.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs space-y-3">
            <Users className="w-12 h-12 mx-auto text-stone-300" />
            <p className="font-bold text-sm text-stone-700">Aucun client ne correspond aux critères.</p>
            <p className="text-stone-400 max-w-sm mx-auto">
              Vous pouvez enregistrer un nouveau client ou importer un fichier Excel / CSV pour alimenter votre base.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
              >
                + Ajouter un client
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Importer CSV / Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5">Client & Raison Sociale</th>
                  <th className="px-4 py-3.5">Catégorie</th>
                  <th className="px-4 py-3.5">Coordonnées (Tél & Email)</th>
                  <th className="px-4 py-3.5">Site / Agence</th>
                  <th className="px-4 py-3.5">Identifiants Fiscaux</th>
                  <th className="px-4 py-3.5 text-right">Dépenses Cumulées</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700">
                {clientsList.map((client) => {
                  const catMeta = CLIENT_CATEGORY_LABELS[client.category] || CLIENT_CATEGORY_LABELS.PARTICULIER;
                  return (
                    <tr key={client.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Name & Initials */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-stone-800 to-stone-700 text-[#d4af37] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {client.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block leading-snug">
                              {client.fullName}
                            </span>
                            <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              {client.city}, {client.country}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${catMeta.badgeClass}`}
                        >
                          {catMeta.label}
                        </span>
                      </td>

                      {/* Contacts */}
                      <td className="px-4 py-3.5 space-y-0.5">
                        <a
                          href={`tel:${client.phone}`}
                          className="text-stone-900 font-semibold hover:text-[#8c101c] flex items-center gap-1.5"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{client.phone}</span>
                        </a>
                        {client.email && (
                          <a
                            href={`mailto:${client.email}`}
                            className="text-stone-500 hover:text-stone-800 flex items-center gap-1.5 text-[11px]"
                          >
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span className="truncate max-w-[160px]">{client.email}</span>
                          </a>
                        )}
                      </td>

                      {/* Site / Property */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 font-medium text-[11px] border border-stone-200">
                          <Building className="w-3 h-3 text-stone-500" />
                          <span>{client.propertyName?.replace("Hôtel Le Vignoble - ", "") || "Bohicon"}</span>
                        </span>
                      </td>

                      {/* Tax ID (IFU / RCCM) */}
                      <td className="px-4 py-3.5">
                        {client.taxId ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              IFU: {client.taxId}
                            </span>
                            {client.rccm && (
                              <span className="block text-[10px] text-stone-500 font-mono">
                                RCCM: {client.rccm}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">Particulier (Sans IFU)</span>
                        )}
                      </td>

                      {/* Total Spend */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-black text-stone-900 text-xs block">
                          {(client.totalSpendXof || 0).toLocaleString("fr-FR")} XOF
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {client.visitsCount || 1} séjour{(client.visitsCount || 1) > 1 ? "s" : ""} / visite
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setSelectedClientForView(client)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-white transition-colors"
                            title="Voir la fiche complète"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(client)}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-white transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client.id, client.fullName)}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-white transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Detail Client Drawer */}
      {selectedClientForView && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 p-6 text-stone-900 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-stone-900 to-[#d4af37] text-white flex items-center justify-center font-black text-base shadow-md">
                  {selectedClientForView.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">{selectedClientForView.fullName}</h3>
                  <p className="text-xs text-stone-500">
                    Client depuis le {new Date(selectedClientForView.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientForView(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Catégorie</span>
                <span className="font-bold text-stone-800">{CLIENT_CATEGORY_LABELS[selectedClientForView.category]?.label}</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Site de rattachement</span>
                <span className="font-bold text-stone-800">{selectedClientForView.propertyName}</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Téléphone / WhatsApp</span>
                <a href={`tel:${selectedClientForView.phone}`} className="font-bold text-emerald-600">
                  {selectedClientForView.phone}
                </a>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">E-mail</span>
                <a href={`mailto:${selectedClientForView.email}`} className="font-bold text-blue-600 truncate block">
                  {selectedClientForView.email || "-"}
                </a>
              </div>
            </div>

            {selectedClientForView.taxId && (
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Données Fiscales pour Factures Normalisées</span>
                </div>
                <p className="text-blue-800 font-mono text-[11px]">IFU : {selectedClientForView.taxId}</p>
                {selectedClientForView.rccm && (
                  <p className="text-blue-800 font-mono text-[11px]">RCCM : {selectedClientForView.rccm}</p>
                )}
                {selectedClientForView.companyContactPerson && (
                  <p className="text-blue-800 text-[11px]">Contact : {selectedClientForView.companyContactPerson}</p>
                )}
              </div>
            )}

            {selectedClientForView.preferences && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Préférences & Habitudes d&apos;accueil :</span>
                <p className="text-amber-800 leading-relaxed">{selectedClientForView.preferences}</p>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-stone-400 font-bold block">Consommation Totale</span>
                <span className="text-lg font-black text-[#d4af37]">
                  {(selectedClientForView.totalSpendXof || 0).toLocaleString("fr-FR")} XOF
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-stone-200 font-bold">
                {selectedClientForView.visitsCount || 1} visites
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const c = selectedClientForView;
                  setSelectedClientForView(null);
                  handleOpenEditModal(c);
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-700"
              >
                Modifier la fiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Edit Client */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-stone-200 p-6 text-stone-900 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                  {editingClient ? "Mise à jour Fiche Client" : "Nouveau Client"}
                </span>
                <h3 className="font-black text-lg text-stone-900">
                  {editingClient ? `Modifier : ${editingClient.fullName}` : "Enregistrer un Client / Partenaire"}
                </h3>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Nom Complet ou Raison Sociale *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Société Civile Immobilière Danxomè ou M. KOUDERIN"
                    value={clientForm.fullName}
                    onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Catégorie Client *</label>
                  <select
                    value={clientForm.category}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, category: e.target.value as ClientCategory })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs bg-white"
                  >
                    {(Object.keys(CLIENT_CATEGORY_LABELS) as ClientCategory[]).map((k) => (
                      <option key={k} value={k}>
                        {CLIENT_CATEGORY_LABELS[k].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Site / Property */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Site / Agence Rattachée *</label>
                  {isManager ? (
                    <input
                      type="text"
                      disabled
                      value={currentManagerProperty.name}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-700 text-xs font-semibold"
                    />
                  ) : (
                    <select
                      value={clientForm.propertyId}
                      onChange={(e) => setClientForm({ ...clientForm, propertyId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs bg-white font-semibold"
                    >
                      {SEED_PROPERTIES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.city})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Téléphone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+229 97 00 00 00"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="client@domaine.bj"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs"
                  />
                </div>

                {/* City & Country */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ville</label>
                  <input
                    type="text"
                    placeholder="Bohicon, Cotonou, Paris..."
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Pays</label>
                  <input
                    type="text"
                    value={clientForm.country}
                    onChange={(e) => setClientForm({ ...clientForm, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs"
                  />
                </div>

                {/* IFU & RCCM (Fiscal) */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Numéro IFU (Fiscalité Bénin)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 3202412345678"
                    value={clientForm.taxId}
                    onChange={(e) => setClientForm({ ...clientForm, taxId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">RCCM (Si Entreprise)</label>
                  <input
                    type="text"
                    placeholder="Ex : RB/COT/24 B 1234"
                    value={clientForm.rccm}
                    onChange={(e) => setClientForm({ ...clientForm, rccm: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs font-mono"
                  />
                </div>

                {/* Company contact person */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Interlocuteur / Chargé de protocole (Si Entreprise / Ministère)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : M. Marcellin AKPOVI (Directeur Logistique)"
                    value={clientForm.companyContactPerson}
                    onChange={(e) => setClientForm({ ...clientForm, companyContactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs"
                  />
                </div>

                {/* Preferences */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Préférences d&apos;accueil, habitudes de table ou de chambre
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex : Préfère suite au 1er étage, vin rouge Saint-Émilion, sans piment rouge..."
                    value={clientForm.preferences}
                    onChange={(e) => setClientForm({ ...clientForm, preferences: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#d4af37] focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-md"
                >
                  {editingClient ? "Enregistrer les modifications" : "Créer le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Universal CSV / Excel Importer for Clients */}
      <CsvExcelImporterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        importType="CLIENTS"
        defaultPropertyId={isManager && managerPropertyId ? managerPropertyId : selectedPropertyId}
        onImport={handleBulkImport}
      />
    </div>
  );
}
