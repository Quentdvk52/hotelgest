"use client";

import React, { useState, useEffect } from "react";
import { SEED_UNITS, SEED_ROOM_TYPES, SEED_PROPERTIES } from "@/lib/db/seed";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Hotel,
  UserPlus,
  LogIn,
  LogOut,
  Bed,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  Calendar,
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Car,
  UtensilsCrossed,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

interface DirectGuestReservation {
  id: string;
  ref: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomTypeId: string;
  roomTypeName: string;
  assignedUnitNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalXof: number;
  paymentStatus: "ACOMPTE_MOMO_VALIDE" | "REGLEMENT_ARRIVEE" | "TOTAL_REGLE";
  source: "SITE_OFFICIEL_WEB" | "MOTEUR_RESERVATION" | "RECEPTION_DIRECTE";
  status: "CONFIRMEE" | "CHECKED_IN" | "TERMINEE" | "ANNULEE";
  createdAt: string;
}

interface HallReservation {
  id: string;
  propertyId: string;
  hallName: string;
  eventType: "CONFERENCE" | "SEMINAIRE" | "CEREMONIE_MARIAGE" | "ATELIER";
  clientName: string;
  clientPhone: string;
  date: string;
  slot: "MATIN" | "APRES_MIDI" | "JOURNEE_ENTIERE";
  capacity: number;
  priceXof: number;
  status: "CONFIRMEE" | "EN_ATTENTE" | "TERMINEE";
}

interface EquipmentReservation {
  id: string;
  propertyId: string;
  itemName: string;
  category: "VEHICULE" | "MOBILIER" | "VAISSELLE" | "STRUCTURE";
  quantity: number;
  clientName: string;
  dates: string;
  totalXof: number;
  depositStatus: "CAUTION_VALIDEE" | "EN_ATTENTE";
}

interface CateringReservation {
  id: string;
  propertyId: string;
  formulaName: string;
  mcRequested: boolean;
  clientName: string;
  guestsCount: number;
  date: string;
  totalXof: number;
  status: "EN_COURS_VALIDATION" | "ACCEPTEE" | "TERMINEE";
}

export default function ReceptionPmsPage() {
  // Current logged in user context
  const [activeUser, setActiveUser] = useState<any>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("prop-bohicon-001");

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<
    "ROOM_AVAILABILITY" | "DIRECT_RESERVATIONS" | "HALL_RESERVATIONS" | "EQUIPMENT_RESERVATIONS" | "CATERING_RESERVATIONS"
  >("ROOM_AVAILABILITY");

  // Room status filter
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal States
  const [showDirectBookingModal, setShowDirectBookingModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  // Form States for Direct Booking Launcher
  const [newBooking, setNewBooking] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    roomTypeId: "rt-std-boh",
    unitNumber: "101",
    checkInDate: "2026-12-01",
    checkOutDate: "2026-12-03",
    paymentMode: "ESPECES_ARRIVEE",
  });

  // Checkin quick form
  const [quickGuestName, setQuickGuestName] = useState("");
  const [quickGuestPhone, setQuickGuestPhone] = useState("");

  // Rooms Data State
  const [units, setUnits] = useState(
    SEED_UNITS.map((u, i) => ({
      ...u,
      status: i === 0 || i === 3 ? "OCCUPIED" : i === 1 ? "RESERVED" : "AVAILABLE",
      guestName:
        i === 0
          ? "M. Dossou Mathieu"
          : i === 3
          ? "Mme Touré Awa"
          : i === 1
          ? "M. Koffi Mensah (Résa Web)"
          : undefined,
      checkInDate: "2026-11-20",
      checkOutDate: "2026-11-24",
      folioId: i === 0 ? "fol-001" : i === 3 ? "fol-002" : undefined,
      cleaningStatus: i === 4 ? "IN_PROGRESS" : "CLEAN",
    }))
  );

  // Direct Client Reservations (transmises automatiquement depuis le moteur de réservation)
  const [directReservations, setDirectReservations] = useState<DirectGuestReservation[]>([
    {
      id: "dres-001",
      ref: "RES-VIG-2026-8891",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      guestName: "EDDY GNACADJA",
      guestPhone: "+229 97 00 11 22",
      guestEmail: "gnacadja.client@gmail.com",
      roomTypeId: "rt-ste-boh",
      roomTypeName: "Suite Royale Le Vignoble",
      assignedUnitNumber: "301",
      checkInDate: "2026-11-20",
      checkOutDate: "2026-11-24",
      nights: 4,
      totalXof: 260000,
      paymentStatus: "ACOMPTE_MOMO_VALIDE",
      source: "SITE_OFFICIEL_WEB",
      status: "CONFIRMEE",
      createdAt: "Aujourd'hui à 10:14",
    },
    {
      id: "dres-002",
      ref: "RES-VIG-2026-8904",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      guestName: "Dr. Pascaline HOUNGBO",
      guestPhone: "+229 95 12 34 56",
      guestEmail: "pascaline.h@sante.bj",
      roomTypeId: "rt-dlx-boh",
      roomTypeName: "Chambre Supérieure Vignoble",
      assignedUnitNumber: "202",
      checkInDate: "2026-11-22",
      checkOutDate: "2026-11-25",
      nights: 3,
      totalXof: 114000,
      paymentStatus: "REGLEMENT_ARRIVEE",
      source: "MOTEUR_RESERVATION",
      status: "CONFIRMEE",
      createdAt: "Hier à 18:30",
    },
    {
      id: "dres-003",
      ref: "RES-VIG-2026-8910",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      guestName: "M. Aimé TOSSOU",
      guestPhone: "+229 66 99 88 77",
      guestEmail: "aime.tossou@energie.bj",
      roomTypeId: "rt-std-boh",
      roomTypeName: "Chambre Standard Confort",
      assignedUnitNumber: "102",
      checkInDate: "2026-11-21",
      checkOutDate: "2026-11-23",
      nights: 2,
      totalXof: 50000,
      paymentStatus: "TOTAL_REGLE",
      source: "SITE_OFFICIEL_WEB",
      status: "CONFIRMEE",
      createdAt: "Aujourd'hui à 08:45",
    },
    {
      id: "dres-004",
      ref: "RES-VIG-2026-9012",
      propertyId: "prop-calavi-003",
      propertyName: "Résidence Le Vignoble - Abomey-Calavi",
      guestName: "Mme Clarisse GNONLONFOUN",
      guestPhone: "+229 94 44 22 11",
      guestEmail: "clarisse.g@cabinet.bj",
      roomTypeId: "rt-dlx-boh",
      roomTypeName: "Chambre Supérieure Vignoble",
      assignedUnitNumber: "101",
      checkInDate: "2026-11-26",
      checkOutDate: "2026-11-28",
      nights: 2,
      totalXof: 76000,
      paymentStatus: "ACOMPTE_MOMO_VALIDE",
      source: "SITE_OFFICIEL_WEB",
      status: "CONFIRMEE",
      createdAt: "Il y a 2 jours",
    },
  ]);

  // Salles Reservations (for General Manager, DAF, Promoter)
  const [hallReservations, setHallReservations] = useState<HallReservation[]>([
    {
      id: "hall-001",
      propertyId: "prop-bohicon-001",
      hallName: "Salle des Banquets Le Vignoble",
      eventType: "CEREMONIE_MARIAGE",
      clientName: "Famille KOUDERIN & DOSSOU",
      clientPhone: "+229 97 11 22 33",
      date: "28 Novembre 2026",
      slot: "JOURNEE_ENTIERE",
      capacity: 350,
      priceXof: 350000,
      status: "CONFIRMEE",
    },
    {
      id: "hall-002",
      propertyId: "prop-bohicon-001",
      hallName: "Salle de Conférence Climatisee",
      eventType: "SEMINAIRE",
      clientName: "ONG Bénin Développement Durable",
      clientPhone: "+229 95 88 77 66",
      date: "02 Décembre 2026",
      slot: "MATIN",
      capacity: 80,
      priceXof: 120000,
      status: "CONFIRMEE",
    },
  ]);

  // Equipment Reservations (for DAF, Promoter)
  const [equipmentReservations, setEquipmentReservations] = useState<EquipmentReservation[]>([
    {
      id: "eq-res-01",
      propertyId: "prop-bohicon-001",
      itemName: "Flotte Véhicule Prado TXL + Chauffeur Privé VIP",
      category: "VEHICULE",
      quantity: 2,
      clientName: "Délégation Ministérielle UEMOA",
      dates: "25 au 27 Novembre 2026",
      totalXof: 180000,
      depositStatus: "CAUTION_VALIDEE",
    },
    {
      id: "eq-res-02",
      propertyId: "prop-bohicon-001",
      itemName: "Pack Chaises Napoléon Blanches & Tables Rondes (10 pers)",
      category: "MOBILIER",
      quantity: 200,
      clientName: "M. Sylvain AGBAHOUNGBA",
      dates: "29 Novembre 2026",
      totalXof: 240000,
      depositStatus: "CAUTION_VALIDEE",
    },
  ]);

  // Catering Reservations (for DAF, Promoter)
  const [cateringReservations, setCateringReservations] = useState<CateringReservation[]>([
    {
      id: "cat-res-01",
      propertyId: "prop-bohicon-001",
      formulaName: "Banquet Prestige Terroir & Maître de Cérémonies Officiel",
      mcRequested: true,
      clientName: "Gala Annuel Ordre des Avocats",
      guestsCount: 180,
      date: "05 Décembre 2026",
      totalXof: 2160000,
      status: "ACCEPTEE",
    },
  ]);

  // Load User & Role
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hotelgest_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setActiveUser(parsed);
          if (parsed.propertyId) {
            setSelectedPropertyId(parsed.propertyId);
          }
        } catch {
          // fallback
        }
      }
    }
  }, []);

  const roleCode = activeUser?.roleCode || "PROMOTER";
  const isReceptionist = roleCode === "RECEPTIONIST";
  const isManager = roleCode === "PROPERTY_MANAGER";
  const isPromoterOrDaf = roleCode === "PROMOTER" || roleCode === "FINANCIAL_DIRECTOR";

  // Filtered units according to agency and role restrictions
  const currentPropertyUnits = units.filter((u) => {
    if (isPromoterOrDaf && selectedPropertyId === "ALL") return true;
    return u.propertyId === (isReceptionist || isManager ? activeUser?.propertyId || "prop-bohicon-001" : selectedPropertyId);
  });

  const displayedUnits = currentPropertyUnits.filter((u) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "AVAILABLE") return u.status === "AVAILABLE";
    if (statusFilter === "OCCUPIED") return u.status === "OCCUPIED";
    if (statusFilter === "RESERVED") return u.status === "RESERVED";
    if (statusFilter === "CLEANING") return u.cleaningStatus === "IN_PROGRESS";
    return true;
  });

  // Filtered direct reservations
  const displayedDirectReservations = directReservations.filter((r) => {
    if (isPromoterOrDaf && selectedPropertyId === "ALL") return true;
    const targetProp = isReceptionist || isManager ? activeUser?.propertyId || "prop-bohicon-001" : selectedPropertyId;
    return r.propertyId === targetProp;
  });

  // Stats calculation
  const totalRooms = currentPropertyUnits.length;
  const availableCount = currentPropertyUnits.filter((u) => u.status === "AVAILABLE").length;
  const occupiedCount = currentPropertyUnits.filter((u) => u.status === "OCCUPIED").length;
  const reservedCount = currentPropertyUnits.filter((u) => u.status === "RESERVED").length;
  const occupancyRate = totalRooms > 0 ? Math.round(((occupiedCount + reservedCount) / totalRooms) * 100) : 0;

  // Actions
  const handleOpenCheckIn = (unit: any) => {
    setSelectedUnit(unit);
    setShowCheckInModal(true);
  };

  const handlePerformCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !quickGuestName) return;

    setUnits((prev) =>
      prev.map((u) =>
        u.id === selectedUnit.id
          ? {
              ...u,
              status: "OCCUPIED",
              guestName: quickGuestName,
              folioId: `fol-${Date.now().toString().slice(-4)}`,
            }
          : u
      )
    );

    setShowCheckInModal(false);
    setQuickGuestName("");
    setQuickGuestPhone("");
    alert(`Arrivée enregistrée avec succès pour ${quickGuestName} en chambre ${selectedUnit.unitNumber}. Folio client ouvert.`);
  };

  const handleDirectReservationCheckin = (res: DirectGuestReservation) => {
    // Locate unit
    setUnits((prev) =>
      prev.map((u) =>
        u.unitNumber === res.assignedUnitNumber
          ? {
              ...u,
              status: "OCCUPIED",
              guestName: res.guestName,
              folioId: `fol-${res.ref.slice(-4)}`,
            }
          : u
      )
    );

    setDirectReservations((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: "CHECKED_IN" } : r))
    );

    alert(`Check-in validé pour ${res.guestName} ! Chambre ${res.assignedUnitNumber} activée.`);
  };

  const handleCreateDirectBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newResId = `dres-${Date.now().toString().slice(-4)}`;
    const newRef = `RES-REC-${Date.now().toString().slice(-6)}`;

    const roomType = SEED_ROOM_TYPES.find((rt) => rt.id === newBooking.roomTypeId);
    const newReservation: DirectGuestReservation = {
      id: newResId,
      ref: newRef,
      propertyId: isReceptionist || isManager ? activeUser?.propertyId || "prop-bohicon-001" : selectedPropertyId,
      propertyName: "Hôtel Le Vignoble - Bohicon",
      guestName: newBooking.guestName,
      guestPhone: newBooking.guestPhone,
      guestEmail: newBooking.guestEmail || "client.direct@hotel-levignoble.bj",
      roomTypeId: newBooking.roomTypeId,
      roomTypeName: roomType?.name || "Chambre Confort",
      assignedUnitNumber: newBooking.unitNumber,
      checkInDate: newBooking.checkInDate,
      checkOutDate: newBooking.checkOutDate,
      nights: 2,
      totalXof: (roomType?.basePriceXof || 25000) * 2,
      paymentStatus: newBooking.paymentMode === "ESPECES_ARRIVEE" ? "REGLEMENT_ARRIVEE" : "TOTAL_REGLE",
      source: "RECEPTION_DIRECTE",
      status: "CONFIRMEE",
      createdAt: "À l'instant",
    };

    setDirectReservations([newReservation, ...directReservations]);

    // Update unit status to RESERVED
    setUnits((prev) =>
      prev.map((u) =>
        u.unitNumber === newBooking.unitNumber
          ? {
              ...u,
              status: "RESERVED",
              guestName: newBooking.guestName,
            }
          : u
      )
    );

    setShowDirectBookingModal(false);
    alert(`Réservation ${newRef} enregistrée avec succès pour ${newBooking.guestName} en chambre ${newBooking.unitNumber} !`);
  };

  const handlePerformCheckOut = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;

    if (
      confirm(
        `Confirmer le départ (check-out) pour la chambre ${unit.unitNumber} (${unit.guestName}) ?`
      )
    ) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === unitId
            ? {
                ...u,
                status: "AVAILABLE",
                cleaningStatus: "IN_PROGRESS",
                guestName: undefined,
                folioId: undefined,
              }
            : u
        )
      );
      alert(
        `Check-out validé pour la chambre ${unit.unitNumber}. La chambre est transmise au Housekeeping pour désinfection.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope Header Banner */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#184f28] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Hotel className="w-3 h-3 text-[#d4af37]" />
              {isReceptionist
                ? "Espace Réceptionniste"
                : isManager
                ? "Console Gérant du Site"
                : "Direction Générale & DAF"}
            </span>
            <span className="text-stone-400 text-xs font-medium">
              PMS Opérationnel & Réservations Directes
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight flex items-center gap-3">
            <span>
              {isReceptionist || isManager
                ? "Hôtel Le Vignoble — Bohicon"
                : selectedPropertyId === "ALL"
                ? "Groupe Hôtel Le Vignoble (Tous les Sites)"
                : selectedPropertyId === "prop-bohicon-001"
                ? "Hôtel Le Vignoble — Bohicon"
                : "Résidence Le Vignoble — Abomey-Calavi"}
            </span>
          </h1>

          <p className="text-xs text-stone-400 mt-1">
            {isReceptionist
              ? "Gestion exclusive des chambres du site, surveillance des disponibilités et réservations directes des voyageurs."
              : isManager
              ? "Supervision des chambres et des réservations de salles de conférences / événements du site."
              : "Cockpit global multi-agences : Chambres, Salles, Matériel et Service Traiteur."}
          </p>
        </div>

        {/* Agency Selector (Promoter & DAF only) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isPromoterOrDaf && (
            <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs">
              <Building2 className="w-4 h-4 text-[#d4af37] ml-2" />
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none pr-3 cursor-pointer"
              >
                <option value="ALL" className="bg-stone-900 text-white">
                  Toutes les Agences (Groupe)
                </option>
                <option value="prop-bohicon-001" className="bg-stone-900 text-white">
                  Hôtel Le Vignoble - Bohicon
                </option>
                <option value="prop-calavi-003" className="bg-stone-900 text-white">
                  Résidence Le Vignoble - Calavi
                </option>
              </select>
            </div>
          )}

          {/* New Reservation Action */}
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowDirectBookingModal(true)}
            className="gap-2 shadow-lg bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs uppercase tracking-wider"
          >
            <PlusCircle className="w-4 h-4 text-[#d4af37]" />
            <span>+ Nouvelle Réservation Directe</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Total Unités
          </div>
          <div className="text-2xl font-black text-stone-900">{totalRooms}</div>
          <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
            <Bed className="w-3 h-3 text-[#184f28]" /> Inventaire actif du site
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            Chambres Libres
          </div>
          <div className="text-2xl font-black text-emerald-800">{availableCount}</div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">
            Prêtes pour accueil immédiat
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 mb-1">
            Occupées / En Séjour
          </div>
          <div className="text-2xl font-black text-rose-800">{occupiedCount}</div>
          <div className="text-[10px] text-rose-600 mt-1 font-medium">
            Folios ouverts & clients logés
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 mb-1">
            Taux d&apos;Occupation
          </div>
          <div className="text-2xl font-black text-amber-800">{occupancyRate} %</div>
          <div className="text-[10px] text-amber-700 mt-1 font-medium">
            {reservedCount} réservations garanties
          </div>
        </div>
      </div>

      {/* Role Scoped Sub-Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {/* Tab 1: Chambres (Visible to Everyone) */}
        <button
          type="button"
          onClick={() => setActiveTab("ROOM_AVAILABILITY")}
          className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "ROOM_AVAILABILITY"
              ? "bg-[#184f28] text-white shadow-sm"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Bed className="w-3.5 h-3.5" />
          <span>Vue Globale Disponibilité Chambres</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {totalRooms}
          </span>
        </button>

        {/* Tab 2: Réservations Directes (Visible to Everyone) */}
        <button
          type="button"
          onClick={() => setActiveTab("DIRECT_RESERVATIONS")}
          className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "DIRECT_RESERVATIONS"
              ? "bg-[#184f28] text-white shadow-sm"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Réservations Directes Clients</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-900 font-bold text-[10px]">
            {displayedDirectReservations.length}
          </span>
        </button>

        {/* Tab 3: Réservations de Salles (Gérant, DAF, Promoteur ONLY) */}
        {(isManager || isPromoterOrDaf) && (
          <button
            type="button"
            onClick={() => setActiveTab("HALL_RESERVATIONS")}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "HALL_RESERVATIONS"
                ? "bg-[#184f28] text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Salles de Conférences & Fêtes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-700 text-[10px]">
              {hallReservations.length}
            </span>
          </button>
        )}

        {/* Tab 4: Matériel (DAF, Promoteur ONLY) */}
        {isPromoterOrDaf && (
          <button
            type="button"
            onClick={() => setActiveTab("EQUIPMENT_RESERVATIONS")}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "EQUIPMENT_RESERVATIONS"
                ? "bg-[#184f28] text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Locations Matériel & Flotte</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 text-[10px]">
              {equipmentReservations.length}
            </span>
          </button>
        )}

        {/* Tab 5: Service Traiteur (DAF, Promoteur ONLY) */}
        {isPromoterOrDaf && (
          <button
            type="button"
            onClick={() => setActiveTab("CATERING_RESERVATIONS")}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "CATERING_RESERVATIONS"
                ? "bg-[#184f28] text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Service Traiteur & MC</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-700 text-[10px]">
              {cateringReservations.length}
            </span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: ROOM AVAILABILITY GLOBAL VIEW
      ========================================================================== */}
      {activeTab === "ROOM_AVAILABILITY" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500 font-semibold mr-1">Filtrer par statut :</span>
              {[
                { id: "ALL", label: "Toutes les chambres" },
                { id: "AVAILABLE", label: "Libres / Disponibles" },
                { id: "OCCUPIED", label: "Occupées" },
                { id: "RESERVED", label: "Réservées" },
                { id: "CLEANING", label: "Housekeeping / Nettoyage" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    statusFilter === f.id
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-stone-500 font-medium">
              Affichage de <strong>{displayedUnits.length}</strong> chambres
            </div>
          </div>

          {/* Room Inventory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedUnits.map((unit) => {
              const roomType = SEED_ROOM_TYPES.find((rt) => rt.id === unit.roomTypeId);
              const isOccupied = unit.status === "OCCUPIED";
              const isReserved = unit.status === "RESERVED";
              const isAvailable = unit.status === "AVAILABLE";
              const isCleaning = unit.cleaningStatus === "IN_PROGRESS";

              return (
                <Card
                  key={unit.id}
                  className={`p-5 border-2 transition-all flex flex-col justify-between ${
                    isOccupied
                      ? "border-rose-300 bg-gradient-to-br from-white via-rose-50/20 to-white"
                      : isReserved
                      ? "border-amber-300 bg-gradient-to-br from-white via-amber-50/20 to-white"
                      : "border-stone-200/90 hover:border-emerald-400 bg-white"
                  }`}
                >
                  <div>
                    {/* Header: Unit Number & Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-stone-900 font-serif">
                            Chambre {unit.unitNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            Étage {unit.floor}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#184f28] mt-0.5">
                          {roomType?.name}
                        </div>
                      </div>

                      {isOccupied ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider border border-rose-200">
                          Occupée
                        </span>
                      ) : isReserved ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                          Réservée
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                          Disponible
                        </span>
                      )}
                    </div>

                    {/* Room Details Box */}
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 mb-4 text-xs space-y-2">
                      {isOccupied ? (
                        <>
                          <div className="flex justify-between font-semibold">
                            <span className="text-stone-500">Hôte en séjour :</span>
                            <span className="text-stone-900">{unit.guestName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Folio actif :</span>
                            <span className="font-mono text-[#184f28] font-bold">
                              {unit.folioId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Départ prévu :</span>
                            <span className="font-medium text-stone-800">
                              {unit.checkOutDate} (12h00)
                            </span>
                          </div>
                        </>
                      ) : isReserved ? (
                        <>
                          <div className="flex justify-between font-semibold">
                            <span className="text-stone-500">Réservé pour :</span>
                            <span className="text-amber-900">{unit.guestName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Arrivée prévue :</span>
                            <span className="text-stone-800 font-medium">Aujourd&apos;hui (dès 14h00)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Tarif nuitée :</span>
                            <span className="font-bold text-stone-900">
                              {roomType?.basePriceXof.toLocaleString("fr-FR")} XOF
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Tarif standard :</span>
                            <span className="font-bold text-stone-900 font-serif">
                              {roomType?.basePriceXof.toLocaleString("fr-FR")} XOF / nuit
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Capacité :</span>
                            <span className="font-medium text-stone-700">
                              {roomType?.capacity} personnes • Climatisation & Wi-Fi
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Housekeeping :</span>
                            <span
                              className={`font-semibold ${
                                isCleaning ? "text-amber-700" : "text-emerald-700"
                              }`}
                            >
                              {isCleaning ? "Désinfection en cours" : "Propre & Contrôlée"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions according to state */}
                  <div className="flex gap-2 pt-2 border-t border-stone-100">
                    {isOccupied ? (
                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full gap-1.5 font-bold"
                        onClick={() => handlePerformCheckOut(unit.id)}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Check-out & Clôture Folio</span>
                      </Button>
                    ) : isReserved ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full gap-1.5 font-bold bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => handleOpenCheckIn(unit)}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Enregistrer l&apos;Arrivée (Check-in)</span>
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full gap-1.5 font-bold bg-[#184f28] hover:bg-[#123c1f] text-white"
                        onClick={() => handleOpenCheckIn(unit)}
                      >
                        <LogIn className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Attribution Directe / Check-in</span>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DIRECT GUEST BOOKINGS (From Landing Page / Web Booking Engine)
      ========================================================================== */}
      {activeTab === "DIRECT_RESERVATIONS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Ces réservations proviennent en temps réel du site officiel et du moteur de réservation en ligne. Elles sont déjà enregistrées et garanties.
              </span>
            </div>
            <span className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
              Prise en compte automatique 100%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {displayedDirectReservations.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#184f28]"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-lg border border-stone-200">
                      {res.ref}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                      {res.paymentStatus === "ACOMPTE_MOMO_VALIDE"
                        ? "Acompte Mobile Money Validé"
                        : res.paymentStatus === "TOTAL_REGLE"
                        ? "Payé en Totalité"
                        : "Règlement à l'arrivée"}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Reçue : {res.createdAt}
                    </span>
                  </div>

                  <div className="text-base font-bold text-stone-900 font-serif">
                    {res.guestName}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span className="flex items-center gap-1 text-[#184f28] font-semibold">
                      <Bed className="w-3.5 h-3.5" /> {res.roomTypeName} (Chambre {res.assignedUnitNumber})
                    </span>
                    <span className="flex items-center gap-1 text-stone-500">
                      <Calendar className="w-3.5 h-3.5" /> Du {res.checkInDate} au {res.checkOutDate} ({res.nights} nuitées)
                    </span>
                    <span className="flex items-center gap-1 text-stone-500">
                      <Phone className="w-3.5 h-3.5" /> {res.guestPhone}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-stone-400">Montant Dossier :</div>
                    <div className="text-lg font-black text-stone-900 font-serif">
                      {res.totalXof.toLocaleString("fr-FR")} XOF
                    </div>
                  </div>

                  {res.status === "CHECKED_IN" ? (
                    <span className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 font-bold text-xs">
                      ✓ Client en Séjour
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-[#184f28] hover:bg-[#123c1f] text-white font-bold gap-1.5"
                      onClick={() => handleDirectReservationCheckin(res)}
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Effectuer le Check-in Direct</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HALL RESERVATIONS (GÉRANT & DAF & PROMOTEUR ONLY)
      ========================================================================== */}
      {activeTab === "HALL_RESERVATIONS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <span>
                Planning des salles de conférences, réunions de travail, séminaires et mariages du site.
              </span>
            </div>
            <span className="font-bold text-[10px] uppercase text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
              Privilège Gérant & Direction
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hallReservations.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{h.hallName}</h3>
                    <span className="text-xs text-purple-700 font-semibold">
                      Type d&apos;Événement : {h.eventType}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    {h.status}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Organisateur :</span>
                    <strong className="text-stone-800">{h.clientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Contact :</span>
                    <span className="text-stone-700">{h.clientPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Date & Créneau :</span>
                    <span className="text-stone-900 font-medium">{h.date} ({h.slot})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Capacité prévue :</span>
                    <span>Jusqu&apos;à {h.capacity} personnes</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-200">
                    <span className="text-stone-500">Tarif de location :</span>
                    <span className="font-bold text-stone-900 font-serif">
                      {h.priceXof.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: EQUIPMENT RESERVATIONS (DAF & PROMOTEUR ONLY)
      ========================================================================== */}
      {activeTab === "EQUIPMENT_RESERVATIONS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <span>
                Suivi des réservations de matériel événementiel : Flotte de véhicules avec chauffeur, chaises Napoléon, tables, chafing dishes et bâches.
              </span>
            </div>
            <span className="font-bold text-[10px] uppercase text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
              Privilège DAF & Promoteur
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipmentReservations.map((eq) => (
              <div
                key={eq.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{eq.itemName}</h3>
                    <span className="text-xs text-blue-700 font-medium">
                      Quantité : {eq.quantity} unités
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    {eq.depositStatus}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Client :</span>
                    <strong className="text-stone-800">{eq.clientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Dates de location :</span>
                    <span>{eq.dates}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-200">
                    <span className="text-stone-500">Total location :</span>
                    <span className="font-bold text-stone-900 font-serif">
                      {eq.totalXof.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: CATERING RESERVATIONS (DAF & PROMOTEUR ONLY)
      ========================================================================== */}
      {activeTab === "CATERING_RESERVATIONS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-rose-700 flex-shrink-0" />
              <span>
                Commandes officielles du Service Traiteur & Coordination Maître de Cérémonies (MC).
              </span>
            </div>
            <span className="font-bold text-[10px] uppercase text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
              Privilège DAF & Promoteur
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cateringReservations.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{cat.formulaName}</h3>
                    {cat.mcRequested && (
                      <span className="text-[10px] font-bold text-[#184f28] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ★ Maître de Cérémonies Inclus
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    {cat.status}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Donneur d&apos;ordre :</span>
                    <strong className="text-stone-800">{cat.clientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Couverts prévus :</span>
                    <span className="text-stone-900 font-bold">{cat.guestsCount} invités</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Date du banquet :</span>
                    <span>{cat.date}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-200">
                    <span className="text-stone-500">Facturation Prestation :</span>
                    <span className="font-bold text-stone-900 font-serif">
                      {cat.totalXof.toLocaleString("fr-FR")} XOF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NOUVELLE RÉSERVATION DIRECTE RÉCEPTION
      ========================================================================== */}
      {showDirectBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 bg-white shadow-2xl rounded-3xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-stone-900 font-serif">
                  Nouvelle Réservation Directe
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Création immédiate au guichet réception ou par appel téléphonique.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectBookingModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDirectBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nom Complet du Client *
                  </label>
                  <Input
                    required
                    placeholder="Ex: M. Jean Agossou"
                    value={newBooking.guestName}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, guestName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Téléphone Contact *
                  </label>
                  <Input
                    required
                    placeholder="+229 97 00 00 00"
                    value={newBooking.guestPhone}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, guestPhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Adresse Email (Facultatif pour envoi confirmation)
                </label>
                <Input
                  type="email"
                  placeholder="client@domaine.bj"
                  value={newBooking.guestEmail}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, guestEmail: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catégorie d&apos;Hébergement
                  </label>
                  <select
                    value={newBooking.roomTypeId}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, roomTypeId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none"
                  >
                    {SEED_ROOM_TYPES.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} ({rt.basePriceXof.toLocaleString("fr-FR")} XOF)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Attribuer Chambre Disponible
                  </label>
                  <select
                    value={newBooking.unitNumber}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, unitNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
                  >
                    {units
                      .filter((u) => u.status === "AVAILABLE")
                      .map((u) => (
                        <option key={u.id} value={u.unitNumber}>
                          Chambre {u.unitNumber} (Étage {u.floor})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date d&apos;Arrivée
                  </label>
                  <Input
                    type="date"
                    value={newBooking.checkInDate}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, checkInDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date de Départ
                  </label>
                  <Input
                    type="date"
                    value={newBooking.checkOutDate}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, checkOutDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Modalité de Règlement
                </label>
                <select
                  value={newBooking.paymentMode}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, paymentMode: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none"
                >
                  <option value="ESPECES_ARRIVEE">Règlement en espèces à l&apos;arrivée</option>
                  <option value="MOMO_ENCAISSE">Mobile Money encaissé immédiatement (MTN/Moov)</option>
                  <option value="CARTE_BANCAIRE">Carte bancaire au terminal TPE</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDirectBookingModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-[#184f28] hover:bg-[#123c1f] text-white font-bold"
                >
                  Confirmer la Réservation
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHECK-IN RAPIDE UNIT
      ========================================================================== */}
      {showCheckInModal && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl rounded-3xl">
            <h3 className="text-lg font-black text-stone-900 font-serif mb-1">
              Check-in — Chambre {selectedUnit.unitNumber}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Enregistrez le voyageur pour lui délivrer la clé et ouvrir son compte folio.
            </p>

            <form onSubmit={handlePerformCheckIn} className="space-y-4">
              <Input
                label="Nom complet de l'hôte *"
                placeholder="Ex: M. Jean Agossou"
                value={quickGuestName}
                onChange={(e) => setQuickGuestName(e.target.value)}
                required
              />

              <Input
                label="Numéro de téléphone / WhatsApp *"
                placeholder="+229 97 00 00 00"
                value={quickGuestPhone}
                onChange={(e) => setQuickGuestPhone(e.target.value)}
                required
              />

              <div className="pt-3 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCheckInModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-[#184f28] hover:bg-[#123c1f] text-white font-bold"
                >
                  Valider l&apos;accueil (Check-in)
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
