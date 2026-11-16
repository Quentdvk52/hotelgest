"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Hotel,
  DollarSign,
  Users,
  UtensilsCrossed,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building,
  TrendingUp,
  TrendingDown,
  Bed,
  Wine,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  CreditCard,
  Plus,
  Car,
  Package,
  Layers,
  Wallet,
  ArrowDownRight,
  Eye,
  ImageIcon,
  ShieldAlert,
  Activity,
  Zap,
  BarChart3,
  SlidersHorizontal,
  ShoppingCart,
  CalendarCheck,
  ArrowLeftRight,
  Star,
  Award,
  MessageSquare,
  Send,
  ThumbsUp,
  UserCheck,
  UserX,
  Tag,
  Boxes,
} from "lucide-react";
import {
  SEED_PROPERTIES,
  SEED_USERS,
} from "@/lib/db/seed";
import { PromoterLegalManager } from "@/components/legal/promoter-legal-manager";

// Types
export interface OrderRecord {
  id: string;
  orderNumber: string;
  propertyId: string;
  propertyName: string;
  orderType: "RESERVATION_CHAMBRE" | "REPAS_BOISSON" | "CAVE_A_VIN" | "LOCATION_MATERIEL" | "SERVICE_TRAITEUR";
  clientName: string;
  clientPhone: string;
  itemsSummary: string;
  totalAmountXof: number;
  status: "EN_ATTENTE" | "VALIDEE" | "EN_PREPARATION" | "LIVREE" | "PAYEE" | "ANNULEE";
  origin: "SERVEUSE" | "RECEPTION" | "CLIENT_SITE_WEB" | "ROOM_SERVICE";
  createdAt: string;
}

export interface HotelEventRecord {
  id: string;
  title: string;
  category: "BRUNCH" | "SOIREE_PRESTIGE" | "SEMINAIRE" | "ATELIER" | "MARIAGE" | "GALA";
  propertyId: string;
  propertyName: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedGuests: number;
  pricePerPersonXof: number;
  description: string;
  imageUrl: string;
  tags: string[];
  status: "PLANIFIE" | "EN_COURS" | "TERMINE";
}

export interface StaffMutationRecord {
  id: string;
  staffId: string;
  staffName: string;
  fromPropertyId: string;
  fromPropertyName: string;
  toPropertyId: string;
  toPropertyName: string;
  fromRoleName: string;
  toRoleName: string;
  effectiveDate: string;
  decisionMaker: string;
  reason: string;
  status: "EFFECTIVE" | "PLANIFIEE";
}

export interface StaffRatingRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  propertyId: string;
  propertyName: string;
  clientName: string;
  clientEmail: string;
  serviceCategory: "ACCUEIL_RECEPTION" | "SERVICE_CHAMBRE" | "RESTAURATION_BAR" | "CHAUFFEUR_VIP" | "SERVICE_TRAITEUR";
  rating: number; // 1 to 5
  comment: string;
  date: string;
  notifiedRoles: string[];
}
const ALL_AMENITY_OPTIONS = [
  "Wi-Fi Haut Débit",
  "Chaînes Câblées (Canal+ & Satellite)",
  "Climatisation Split",
  "Ventilation / Brasseur d'air",
  "Salle de bain privative",
  "Mini-bar réfrigéré",
  "Coffre-fort électronique",
  "Balcon privatif vue jardin",
  "Eau chaude solaire",
  "Bureau de travail & USB",
  "Petit-déjeuner inclus",
  "Room-service 24h/24",
];

export interface RoomRecord {
  id: string;
  number: string;
  name: string;
  propertyId: string;
  propertyName: string;
  type: "STANDARD" | "SUPERIEURE" | "SUITE_ROYALE" | "PAVILLON";
  basePriceXof: number;
  capacity: number;
  bedPlaces?: number;
  bedConfiguration?: string;
  amenities: string[];
  status: "DISPONIBLE" | "OCCUPEE" | "RESERVEE" | "NETTOYAGE" | "MAINTENANCE";
  imageUrl: string;
}

export interface StockItemRecord {
  id: string;
  sku: string;
  name: string;
  category: "CAVE_A_VIN" | "BOISSON_BAR" | "VIVRES_CUISINE" | "LINGERIE_CHAMBRE" | "PRODUIT_ENTRETIEN";
  propertyId: string;
  propertyName: string;
  unitMeasure: string; // "Bouteilles", "Kg", "Sacs 25kg", "Litres", "Pièces", "Cartons", "Rouleaux"
  currentQuantity: number;
  alertThreshold: number; // Stock d'alerte (réapprovisionnement conseillé)
  securityThreshold: number; // Stock de sécurité (seuil critique de rupture imminente)
  unitCostXof: number;
  storageLocation: string;
  supplierName?: string;
}

export interface StaffRoleRecord {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  propertyId: string;
  propertyName: string;
  roleCode: string;
  roleName: string;
  maxDiscount: number;
  rights: {
    pmsReservations: boolean;
    posOrderTaking: boolean;
    kitchenKds: boolean;
    barKds: boolean;
    cashFinance: boolean;
    hallBooking: boolean;
    equipmentCatering: boolean;
    reportsTreasury: boolean;
    intersiteMessaging: boolean;
    stocksManage: boolean;
  };
}

export interface WineRecord {
  id: string;
  name: string;
  category: "ROUGE" | "CHAMPAGNE" | "BLANC_ROSE" | "SPIRITUEUX" | "BOISSON_TERROIR";
  origin: string;
  millesime: string;
  priceXof: number;
  stockBottles: number;
  minStockAlert: number;
  pairings: string;
  imageUrl: string;
}

export interface MealRecord {
  id: string;
  name: string;
  category: "ENTREE" | "PLAT_TRADITIONNEL" | "GRILLADE" | "ACCOMPAGNEMENT" | "DESSERT";
  priceXof: number;
  prepTimeMinutes: number;
  accompaniments: string[];
  description: string;
  available: boolean;
  imageUrl: string;
}

export type RentalCategory =
  | "VOITURES"
  | "DISH"
  | "COUVERTS"
  | "TABLES"
  | "CHAISES"
  | "SALLES_FETE"
  | "SALLE_REUNION"
  | "SALLE_ATELIER"
  | "BACHE_HANGAR";

export interface RentalRecord {
  id: string;
  name: string;
  type: RentalCategory;
  dailyPriceXof: number;
  depositXof: number;
  totalQuantity: number;
  availableQuantity: number;
  specs: string;
  imageUrl: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  propertyId: string;
  propertyName: string;
  shift: "MATIN" | "SOIR" | "NUIT" | "ASTREINTE";
  date: string;
  checkInTime?: string;
  status: "PRESENT" | "RETARD" | "ABSENT_JUSTIFIE" | "ABSENT_INJUSTIFIE" | "EN_GARDE" | "CONGE";
  delayMinutes?: number;
  notes?: string;
}

export interface DutyRosterRecord {
  id: string;
  title: string;
  propertyId: string;
  propertyName: string;
  shift: "MATIN" | "SOIR" | "NUIT" | "ASTREINTE";
  date: string;
  assignedStaff: { userId: string; userName: string; roleName: string }[];
  instructions: string;
  status: "PLANIFIE" | "EN_COURS" | "TERMINE";
}

export interface CateringRecord {
  id: string;
  name: string;
  pricePerPersonXof: number;
  minGuests: number;
  inclusions: string[];
  serviceLevel: string;
  imageUrl: string;
  propertyId?: string;
  propertyName?: string;
}

export interface StaffRecord {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
  roleCode: string;
  propertyName: string;
  propertyId: string | null;
  maxDiscount: string;
  phone: string;
  status: "ACTIF" | "SUSPENDU";
  avatarUrl: string;
}

export interface TreasuryAccount {
  id: string;
  label: string;
  type: "BANQUE" | "CAISSE" | "MOBILE_MONEY";
  balanceXof: number;
  accountNumber: string;
  institution: string;
  propertyId?: string;
  propertyName?: string;
}

export interface CashTransaction {
  id: string;
  date: string;
  label: string;
  type: "ENTREE" | "SORTIE";
  amountXof: number;
  accountId: string;
  accountLabel: string;
  category: string;
  propertyId?: string;
  propertyName?: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const currentView = (searchParams.get("view") || "cockpit").toLowerCase();

  // Multi-Angle Filters for "Vue d'ensemble"
  const [agencyAngle, setAgencyAngle] = useState<"ALL" | "BOH" | "ABM" | "ABC" | "ZOG">("ALL");
  const [poleAngle, setPoleAngle] = useState<"ALL" | "ROOMS" | "FOOD" | "WINE" | "RENTAL" | "CATERING">("ALL");
  const [timeframe, setTimeframe] = useState<"1D" | "7D" | "30D" | "1Y">("7D");
  const [signalFilter, setSignalFilter] = useState<"ALL" | "VIP" | "CAVE" | "TRAITEUR" | "ALERTS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Room Specific Filters
  const [roomAgencyFilter, setRoomAgencyFilter] = useState<string>("ALL");
  const [roomStatusFilter, setRoomStatusFilter] = useState<string>("ALL");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("ALL");

  // Wine Specific Filters
  const [wineCategoryFilter, setWineCategoryFilter] = useState<string>("ALL");
  const [winePriceFilter, setWinePriceFilter] = useState<string>("ALL");
  const [wineStockFilter, setWineStockFilter] = useState<string>("ALL");
  const [wineSortFilter, setWineSortFilter] = useState<string>("DEFAULT");

  // Rental Specific Filters
  const [rentalCategoryFilter, setRentalCategoryFilter] = useState<string>("ALL");

  // Multi-Site Filters for each individual tab
  const [winePropertyFilter, setWinePropertyFilter] = useState<string>("ALL");
  const [mealPropertyFilter, setMealPropertyFilter] = useState<string>("ALL");
  const [mealCategoryFilter, setMealCategoryFilter] = useState<string>("ALL");
  const [rentalPropertyFilter, setRentalPropertyFilter] = useState<string>("ALL");
  const [cateringPropertyFilter, setCateringPropertyFilter] = useState<string>("ALL");
  const [staffPropertyFilter, setStaffPropertyFilter] = useState<string>("ALL");
  const [treasuryPropertyFilter, setTreasuryPropertyFilter] = useState<string>("ALL");
  const [mutationPropertyFilter, setMutationPropertyFilter] = useState<string>("ALL");

  // Fiscal e-MECeF & Universal Printer state
  const [fiscalModalOpen, setFiscalModalOpen] = useState(false);
  const [printerModalOpen, setPrinterModalOpen] = useState(false);
  const [activeFiscalInvoice, setActiveFiscalInvoice] = useState<{
    invoiceData: any;
    normalizedData: any;
  } | null>(null);

  // Active User & Manager RBAC Scope
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hotelgest_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setActiveUser(parsed);
          if (parsed.roleCode === "PROPERTY_MANAGER" && parsed.propertyId) {
            setRoomAgencyFilter(parsed.propertyId);
            setOrderSiteFilter(parsed.propertyId);
            setEventSiteFilter(parsed.propertyId);
            setRatingSiteFilter(parsed.propertyId);
            setPresenceSiteFilter(parsed.propertyId);
            setWinePropertyFilter(parsed.propertyId);
            setMealPropertyFilter(parsed.propertyId);
            setRentalPropertyFilter(parsed.propertyId);
            setCateringPropertyFilter(parsed.propertyId);
            setStaffPropertyFilter(parsed.propertyId);
            setTreasuryPropertyFilter(parsed.propertyId);
            setMutationPropertyFilter(parsed.propertyId);
            const angleMap: Record<string, "BOH" | "ABM" | "ABC" | "ZOG"> = {
              "prop-bohicon-001": "BOH",
              "prop-abomey-002": "ABM",
              "prop-calavi-003": "ABC",
              "prop-zogbo-004": "ZOG",
            };
            if (angleMap[parsed.propertyId]) {
              setAgencyAngle(angleMap[parsed.propertyId]);
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const isPromoter = !activeUser || activeUser.roleCode === "PROMOTER" || activeUser.roleCode === "FINANCIAL_DIRECTOR";
  const isManager = activeUser?.roleCode === "PROPERTY_MANAGER";
  const managerPropertyId = activeUser?.propertyId;
  const isBohiconManager = managerPropertyId === "prop-bohicon-001";

  // Commandes Specific States
  const [orderSiteFilter, setOrderSiteFilter] = useState<string>("ALL");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<Partial<OrderRecord>>({
    orderType: "REPAS_BOISSON",
    propertyId: "prop-bohicon-001",
    clientName: "",
    clientPhone: "",
    itemsSummary: "",
    totalAmountXof: 15000,
    status: "VALIDEE",
    origin: "SERVEUSE",
  });

  // Events Specific States
  const [eventSiteFilter, setEventSiteFilter] = useState<string>("ALL");
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("ALL");
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HotelEventRecord | null>(null);
  const [eventForm, setEventForm] = useState<Partial<HotelEventRecord>>({
    title: "",
    category: "BRUNCH",
    propertyId: "prop-bohicon-001",
    date: new Date().toISOString().split("T")[0],
    startTime: "12:00",
    endTime: "16:00",
    expectedGuests: 50,
    pricePerPersonXof: 18500,
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
    tags: ["#BrunchVignoble"],
    status: "PLANIFIE",
  });

  // Mutations Specific States
  const [mutationModalOpen, setMutationModalOpen] = useState(false);
  const [mutationForm, setMutationForm] = useState({
    staffId: "",
    toPropertyId: "prop-bohicon-001",
    toRoleName: "Gérant d'Agence",
    effectiveDate: new Date().toISOString().split("T")[0],
    reason: "Renfort stratégique et optimisation des équipes régionales",
  });

  // Notations Specific States
  const [ratingSiteFilter, setRatingSiteFilter] = useState<string>("ALL");
  const [ratingCategoryFilter, setRatingCategoryFilter] = useState<string>("ALL");
  const [ratingMinStars, setRatingMinStars] = useState<number>(0);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingNotificationSent, setRatingNotificationSent] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    staffId: "",
    clientName: "",
    clientEmail: "",
    serviceCategory: "ACCUEIL_RECEPTION" as any,
    rating: 5,
    comment: "",
  });

  // Permanence & Présence States
  const [presenceSiteFilter, setPresenceSiteFilter] = useState<string>("ALL");
  const [presenceShiftFilter, setPresenceShiftFilter] = useState<string>("ALL");
  const [presenceStatusFilter, setPresenceStatusFilter] = useState<string>("ALL");
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [dutyForm, setDutyForm] = useState<Partial<DutyRosterRecord>>({
    title: "",
    propertyId: "prop-bohicon-001",
    shift: "MATIN",
    date: new Date().toISOString().split("T")[0],
    assignedStaff: [],
    instructions: "",
    status: "PLANIFIE",
  });

  // =========================================================================
  // 1. DATA: CHAMBRES
  // =========================================================================
  const [rooms, setRooms] = useState<RoomRecord[]>([
    {
      id: "rm-101",
      number: "101",
      name: "Suite Royale Le Vignoble",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      type: "SUITE_ROYALE",
      basePriceXof: 85000,
      capacity: 3,
      bedPlaces: 3,
      bedConfiguration: "1 Lit King Size + 1 Lit d'appoint (3 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Mini-bar réfrigéré",
        "Coffre-fort électronique",
        "Balcon privatif vue jardin",
        "Petit-déjeuner inclus",
        "Room-service 24h/24",
      ],
      status: "OCCUPEE",
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-102",
      number: "102",
      name: "Suite Supérieure Exécutive",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      type: "SUPERIEURE",
      basePriceXof: 45000,
      capacity: 2,
      bedPlaces: 2,
      bedConfiguration: "1 Lit King Size (2 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Mini-bar réfrigéré",
        "Balcon privatif vue jardin",
        "Bureau de travail & USB",
      ],
      status: "DISPONIBLE",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-103",
      number: "103",
      name: "Chambre Prestige VIP",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      type: "SUPERIEURE",
      basePriceXof: 50000,
      capacity: 2,
      bedPlaces: 2,
      bedConfiguration: "1 Lit Queen Size (2 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Balcon privatif vue jardin",
        "Room-service 24h/24",
      ],
      status: "RESERVEE",
      imageUrl: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-104",
      number: "104",
      name: "Chambre Standard Jardin",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      type: "STANDARD",
      basePriceXof: 25000,
      capacity: 2,
      bedPlaces: 2,
      bedConfiguration: "1 Lit Double Confort (2 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Salle de bain privative",
        "Eau chaude solaire",
      ],
      status: "NETTOYAGE",
      imageUrl: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-201",
      number: "201",
      name: "Chambre Standard Confort",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      type: "STANDARD",
      basePriceXof: 25000,
      capacity: 2,
      bedPlaces: 2,
      bedConfiguration: "1 Lit Double Confort (2 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
      ],
      status: "DISPONIBLE",
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-202",
      number: "202",
      name: "Suite Royale des Reines d'Abomey",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      type: "SUITE_ROYALE",
      basePriceXof: 90000,
      capacity: 4,
      bedPlaces: 4,
      bedConfiguration: "Suite Familiale 2 Grands Lits (4 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Balcon privatif vue jardin",
        "Mini-bar réfrigéré",
        "Coffre-fort électronique",
        "Petit-déjeuner inclus",
        "Room-service 24h/24",
      ],
      status: "OCCUPEE",
      imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-203",
      number: "203",
      name: "Chambre Supérieure Goho",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      type: "SUPERIEURE",
      basePriceXof: 40000,
      capacity: 2,
      bedPlaces: 2,
      bedConfiguration: "1 Lit King Size (2 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Balcon privatif vue jardin",
      ],
      status: "RESERVEE",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-204",
      number: "204",
      name: "Chambre Traditionnelle Terroir",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      type: "STANDARD",
      basePriceXof: 22000,
      capacity: 2,
      bedPlaces: 2,
      bedConfiguration: "2 Lits simples séparés (2 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Ventilation / Brasseur d'air",
        "Salle de bain privative",
      ],
      status: "MAINTENANCE",
      imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-301",
      number: "301",
      name: "Pavillon Familial Jardin",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      type: "PAVILLON",
      basePriceXof: 65000,
      capacity: 4,
      bedPlaces: 4,
      bedConfiguration: "Pavillon 2 Chambres - 4 places",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Balcon privatif vue jardin",
        "Mini-bar réfrigéré",
        "Petit-déjeuner inclus",
      ],
      status: "DISPONIBLE",
      imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-302",
      number: "302",
      name: "Suite Exécutive Campus & Lac",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      type: "SUPERIEURE",
      basePriceXof: 48000,
      capacity: 2,
      bedPlaces: 2,
      bedConfiguration: "1 Lit King Size (2 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Bureau de travail & USB",
      ],
      status: "RESERVEE",
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-401",
      number: "401",
      name: "Pavillon Éco-Nature Piscine",
      propertyId: "prop-zogbo-004",
      propertyName: "Hôtel Le Vignoble - Zogbodomey",
      type: "PAVILLON",
      basePriceXof: 55000,
      capacity: 3,
      bedPlaces: 3,
      bedConfiguration: "1 Lit King Size + 1 Lit d'appoint (3 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Salle de bain privative",
        "Balcon privatif vue jardin",
        "Petit-déjeuner inclus",
      ],
      status: "DISPONIBLE",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "rm-402",
      number: "402",
      name: "Suite Escale Royale",
      propertyId: "prop-zogbo-004",
      propertyName: "Hôtel Le Vignoble - Zogbodomey",
      type: "SUPERIEURE",
      basePriceXof: 42000,
      capacity: 2,
      bedPlaces: 2,
      bedConfiguration: "1 Lit King Size (2 places)",
      amenities: [
        "Wi-Fi Haut Débit",
        "Climatisation Split",
        "Chaînes Câblées (Canal+ & Satellite)",
        "Salle de bain privative",
        "Mini-bar réfrigéré",
      ],
      status: "OCCUPEE",
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomRecord | null>(null);
  const [roomForm, setRoomForm] = useState<Partial<RoomRecord>>({
    number: "",
    name: "",
    propertyId: "prop-bohicon-001",
    type: "STANDARD",
    basePriceXof: 25000,
    capacity: 2,
    bedPlaces: 2,
    bedConfiguration: "1 Lit King Size (2 places)",
    amenities: [
      "Wi-Fi Haut Débit",
      "Climatisation Split",
      "Salle de bain privative",
      "Eau chaude solaire",
    ],
    status: "DISPONIBLE",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  });

  // =========================================================================
  // 2. DATA: CAVE A VIN
  // =========================================================================
  const [wines, setWines] = useState<WineRecord[]>([
    {
      id: "w-01",
      name: "Château Vignoble Réserve Prestige",
      category: "ROUGE",
      origin: "Cuvée Spéciale Domaine Le Vignoble",
      millesime: "2018",
      priceXof: 38000,
      stockBottles: 42,
      minStockAlert: 10,
      pairings: "Viandes braisées royales, Pintade du terroir, Fromages affinés",
      imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "w-02",
      name: "Champagne Moët & Chandon Brut Impérial",
      category: "CHAMPAGNE",
      origin: "Épernay, France",
      millesime: "Brut NV",
      priceXof: 65000,
      stockBottles: 14,
      minStockAlert: 6,
      pairings: "Apéritif de prestige, Poissons nobles, Célébrations",
      imageUrl: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "w-03",
      name: "Dom Pérignon Vintage Prestige",
      category: "CHAMPAGNE",
      origin: "Hautvillers, France",
      millesime: "2013",
      priceXof: 210000,
      stockBottles: 5,
      minStockAlert: 3,
      pairings: "Dîners de gala VIP, Caviar, Grandes réceptions",
      imageUrl: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "w-04",
      name: "Châteauneuf-du-Pape Grand Cru",
      category: "ROUGE",
      origin: "Vallée du Rhône, France",
      millesime: "2019",
      priceXof: 48000,
      stockBottles: 18,
      minStockAlert: 5,
      pairings: "Agouti braisé, Ragoûts épicés",
      imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "w-05",
      name: "Chablis Premier Cru Domaine Laroche",
      category: "BLANC_ROSE",
      origin: "Bourgogne, France",
      millesime: "2021",
      priceXof: 32000,
      stockBottles: 8,
      minStockAlert: 5,
      pairings: "Carpe braisée, Gambas grillées",
      imageUrl: "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "w-06",
      name: "Nectar Pur Hibiscus & Gingembre 75cl",
      category: "BOISSON_TERROIR",
      origin: "Maison Le Vignoble",
      millesime: "Frais du Jour",
      priceXof: 3500,
      stockBottles: 50,
      minStockAlert: 15,
      pairings: "Rafraîchissement tous repas, Digestif sans alcool",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  const [wineModalOpen, setWineModalOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<WineRecord | null>(null);
  const [wineForm, setWineForm] = useState<Partial<WineRecord>>({
    name: "",
    category: "ROUGE",
    origin: "",
    millesime: "2020",
    priceXof: 35000,
    stockBottles: 12,
    minStockAlert: 5,
    pairings: "",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
  });

  // =========================================================================
  // 3. DATA: REPAS
  // =========================================================================
  const [meals, setMeals] = useState<MealRecord[]>([
    {
      id: "m-01",
      name: "Amiwo Royal au Poulet Bicyclette",
      category: "PLAT_TRADITIONNEL",
      priceXof: 8500,
      prepTimeMinutes: 25,
      accompaniments: ["Piment vert pilé", "Oignons confits", "Jus de volaille réduit"],
      description: "Pâte rouge de maïs parfumé à la tomate et crevettes séchées, servie avec poulet bicyclette local doré au feu de bois.",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "m-02",
      name: "Djenkoumé Royal & Pintade Braisée",
      category: "PLAT_TRADITIONNEL",
      priceXof: 9500,
      prepTimeMinutes: 30,
      accompaniments: ["Sauce tomate relevée", "Banane plantain vapeur"],
      description: "Galette de semoule de maïs enrichie à la tomate et épices royales d'Abomey, accompagnée d'un demi-pintade braisée.",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "m-03",
      name: "Carpe Braisée du Lac Nokoué",
      category: "GRILLADE",
      priceXof: 7500,
      prepTimeMinutes: 20,
      accompaniments: ["Alloco doré", "Attiéké frais", "Moyoyo"],
      description: "Carpe entière fraîche marinée aux aromates de Grand-Popo, grillée lentement au charbon de bois.",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "m-04",
      name: "Alloco Bananes Plantains Dorées",
      category: "ACCOMPAGNEMENT",
      priceXof: 2000,
      prepTimeMinutes: 10,
      accompaniments: ["Sauce piment doux"],
      description: "Tranches de plantains mûrs frites à l'huile végétale claire, moelleuses à cœur et croustillantes.",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "m-05",
      name: "Igname Pilée Légendaire & Sauce Arachide",
      category: "PLAT_TRADITIONNEL",
      priceXof: 8000,
      prepTimeMinutes: 25,
      accompaniments: ["Mouton tendre", "Fromage peul wagashi"],
      description: "Igname pilée au mortier traditionnel, texture souple et élastique, servie avec sauce d'arachide onctueuse.",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);
  const [mealForm, setMealForm] = useState<Partial<MealRecord>>({
    name: "",
    category: "PLAT_TRADITIONNEL",
    priceXof: 7500,
    prepTimeMinutes: 20,
    accompaniments: ["Alloco", "Piment frais"],
    description: "",
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
  });

  // =========================================================================
  // 4. DATA: LOCATION (VEHICULES, DISH, COUVERTS, TABLES, CHAISES, SALLES, BACHES)
  // =========================================================================
  const [rentals, setRentals] = useState<RentalRecord[]>([
    {
      id: "r-01",
      name: "Toyota Prado TXL 4x4 Climatisé",
      type: "VOITURES",
      dailyPriceXof: 75000,
      depositXof: 150000,
      totalQuantity: 3,
      availableQuantity: 2,
      specs: "Moteur Diesel D4D, Cuir noir, Chauffeur d'élite inclus, Assurance tous risques Bénin",
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-02",
      name: "Toyota Land Cruiser V8 Executive VIP",
      type: "VOITURES",
      dailyPriceXof: 120000,
      depositXof: 250000,
      totalQuantity: 2,
      availableQuantity: 1,
      specs: "Finition V8 blindée VIP, vitres teintées, liaison aéroport et escortes officielles",
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-03",
      name: "Minibus VIP Hiace 15 Places",
      type: "VOITURES",
      dailyPriceXof: 85000,
      depositXof: 100000,
      totalQuantity: 2,
      availableQuantity: 2,
      specs: "Idéal délégations, séminaires et mariages, climatisation double zone, chauffeur expérimenté",
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-04",
      name: "Lot de 10 Chafing Dishes & Chauffe-plats Inox",
      type: "DISH",
      dailyPriceXof: 35000,
      depositXof: 50000,
      totalQuantity: 8,
      availableQuantity: 6,
      specs: "Chauffe-plats gastronomiques inox poli miroir, bacs GN 1/1, brûleurs à gel d'éthanol inclus",
      imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-05",
      name: "Ensemble 100 Couverts Prestige Dorés & Verrerie Cristal",
      type: "COUVERTS",
      dailyPriceXof: 50000,
      depositXof: 40000,
      totalQuantity: 6,
      availableQuantity: 4,
      specs: "Couteaux, fourchettes, cuillères dorées finition satinée, verres à eau et flûtes à champagne en cristal",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-06",
      name: "Lot 10 Tables Rondes Banquet (10 Places) & Nappes",
      type: "TABLES",
      dailyPriceXof: 45000,
      depositXof: 30000,
      totalQuantity: 10,
      availableQuantity: 7,
      specs: "Diamètre 180cm, piétement pliant renforcé, nappage blanc immaculé en coton damassé inclus",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-07",
      name: "Lot 100 Chaises Napoléon Chiavari Dorées / Cristal",
      type: "CHAISES",
      dailyPriceXof: 75000,
      depositXof: 50000,
      totalQuantity: 8,
      availableQuantity: 5,
      specs: "Chaises Chiavari résine monobloc dorées avec coussins velours blanc cassé déhoussables",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-08",
      name: "Grande Salle de Banquet & Fêtes Royale (500 Convives)",
      type: "SALLES_FETE",
      dailyPriceXof: 650000,
      depositXof: 300000,
      totalQuantity: 2,
      availableQuantity: 1,
      specs: "Climatisation centrale intégrale, scène d'honneur, sonorisation de concert, vestiaires et office traiteur dédié",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-09",
      name: "Salle du Conseil VIP & Visioconférence (25 Places)",
      type: "SALLE_REUNION",
      dailyPriceXof: 150000,
      depositXof: 100000,
      totalQuantity: 3,
      availableQuantity: 2,
      specs: "Table en acajou massif, fauteuils cuir grand confort, écran interactif 85 pouces 4K, visioconférence multipoint",
      imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-10",
      name: "Salle d'Atelier & Formation Modulaire (60 Places)",
      type: "SALLE_ATELIER",
      dailyPriceXof: 180000,
      depositXof: 80000,
      totalQuantity: 3,
      availableQuantity: 2,
      specs: "Disposition modulaire en U ou classe, vidéoprojecteur laser, paperboards électroniques et sonorisation HF",
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-11",
      name: "Chapiteau Stretch Nomade 200m² & Mâts Bois",
      type: "BACHE_HANGAR",
      dailyPriceXof: 250000,
      depositXof: 150000,
      totalQuantity: 3,
      availableQuantity: 2,
      specs: "Toile imperméable ignifugée M2 beige champagne, esthétique safari luxe, montage et haubanage sécurisé inclus",
      imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-12",
      name: "Bâche Hangar Modulaire de Stockage / Événement 300m²",
      type: "BACHE_HANGAR",
      dailyPriceXof: 350000,
      depositXof: 200000,
      totalQuantity: 2,
      availableQuantity: 1,
      specs: "Structure en aluminium aéronautique, bardages latéraux étanches anti-pluie, éclairage LED étanche intégré",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  const [rentalModalOpen, setRentalModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalRecord | null>(null);
  const [rentalForm, setRentalForm] = useState<Partial<RentalRecord>>({
    name: "",
    type: "VOITURES",
    dailyPriceXof: 75000,
    depositXof: 100000,
    totalQuantity: 1,
    availableQuantity: 1,
    specs: "",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  });

  // =========================================================================
  // 4b. DATA: PERMANENCE & PRESENCES (PAR SITE & PAR QUART)
  // =========================================================================
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([
    {
      id: "att-01",
      userId: "user-dir-boh",
      userName: "Aimée Hounsinou",
      userRole: "Directeur de Site",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      shift: "MATIN",
      date: "2026-11-15",
      checkInTime: "07:45",
      status: "PRESENT",
      notes: "Ouverture générale et briefing des équipes",
    },
    {
      id: "att-02",
      userId: "user-rec-boh",
      userName: "Reine KPONHINTO",
      userRole: "Réceptionniste",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      shift: "MATIN",
      date: "2026-11-15",
      checkInTime: "08:18",
      status: "RETARD",
      delayMinutes: 18,
      notes: "Ralentissement circulation carrefour Dako",
    },
    {
      id: "att-03",
      userId: "user-srv-boh",
      userName: "Prudence DOSSOU",
      userRole: "Serveuse Bar & Resto",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      shift: "MATIN",
      date: "2026-11-15",
      checkInTime: "07:50",
      status: "PRESENT",
      notes: "Mise en place salle de petit-déjeuner",
    },
    {
      id: "att-04",
      userId: "user-dir-abm",
      userName: "Sylvain KPOFFON",
      userRole: "Gérant Agence Abomey",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      shift: "MATIN",
      date: "2026-11-15",
      status: "ABSENT_JUSTIFIE",
      notes: "Mission officielle à la Direction Générale à Bohicon",
    },
    {
      id: "att-05",
      userId: "user-srv-abm",
      userName: "Béatrice HOUEDANOU",
      userRole: "Serveuse Bar & Resto",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      shift: "MATIN",
      date: "2026-11-15",
      checkInTime: "07:55",
      status: "PRESENT",
    },
    {
      id: "att-06",
      userId: "user-dir-abc",
      userName: "Brice DOSSOU-YOVO",
      userRole: "Gérant Agence Abomey-Calavi",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      shift: "MATIN",
      date: "2026-11-15",
      checkInTime: "07:40",
      status: "PRESENT",
      notes: "Contrôle des pavillons et des navettes",
    },
    {
      id: "att-07",
      userId: "user-srv-abc",
      userName: "Chantal AGBOHOUN",
      userRole: "Serveuse Bar & Resto",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      shift: "SOIR",
      date: "2026-11-15",
      status: "EN_GARDE",
      notes: "Service du soir & veille banquet",
    },
    {
      id: "att-08",
      userId: "user-dir-zog",
      userName: "Clarisse ALLAGBE",
      userRole: "Gérant Agence Zogbodomey",
      propertyId: "prop-zogbo-004",
      propertyName: "Hôtel Le Vignoble - Zogbodomey",
      shift: "MATIN",
      date: "2026-11-15",
      status: "CONGE",
      notes: "Congé annuel autorisé par le Promoteur",
    },
    {
      id: "att-09",
      userId: "user-srv-zog",
      userName: "Flora TCHIBOZO",
      userRole: "Serveuse Bar & Resto",
      propertyId: "prop-zogbo-004",
      propertyName: "Hôtel Le Vignoble - Zogbodomey",
      shift: "MATIN",
      date: "2026-11-15",
      checkInTime: "07:52",
      status: "PRESENT",
    },
    {
      id: "att-10",
      userId: "user-daf-01",
      userName: "Marcelin AGBIDINOUKOUN",
      userRole: "DAF Groupe",
      propertyId: "prop-bohicon-001",
      propertyName: "Direction Générale Groupe",
      shift: "MATIN",
      date: "2026-11-15",
      checkInTime: "07:30",
      status: "PRESENT",
      notes: "Supervision clôtures financières et caisses",
    },
  ]);

  const [dutyRosters, setDutyRosters] = useState<DutyRosterRecord[]>([
    {
      id: "dr-01",
      title: "Garde & Permanence Nuit Bohicon",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      shift: "NUIT",
      date: "2026-11-15",
      assignedStaff: [
        { userId: "user-rec-boh", userName: "Reine KPONHINTO", roleName: "Réceptionniste de Nuit" },
      ],
      instructions: "Surveillance accès VIP, accueil des arrivées tardives, vérification extinction éclairages extérieurs.",
      status: "EN_COURS",
    },
    {
      id: "dr-02",
      title: "Permanence Restaurant & Week-end Abomey",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      shift: "SOIR",
      date: "2026-11-15",
      assignedStaff: [
        { userId: "user-srv-abm", userName: "Béatrice HOUEDANOU", roleName: "Responsable Service Soir" },
      ],
      instructions: "Tenue royale exigée pour le dîner de gala des notables.",
      status: "PLANIFIE",
    },
    {
      id: "dr-03",
      title: "Permanence Navettes & Pavillons Calavi",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      shift: "ASTREINTE",
      date: "2026-11-15",
      assignedStaff: [
        { userId: "user-dir-abc", userName: "Brice DOSSOU-YOVO", roleName: "Gérant en Astreinte" },
      ],
      instructions: "Prise en charge navette aéroport pour délégation universitaire.",
      status: "PLANIFIE",
    },
  ]);

  // =========================================================================
  // 5. DATA: TRAITEUR
  // =========================================================================
  const [cateringFormulas, setCateringFormulas] = useState<CateringRecord[]>([
    {
      id: "cat-01",
      name: "Buffet Prestige Terroir Béninois",
      pricePerPersonXof: 14500,
      minGuests: 30,
      inclusions: ["3 Entrées fines", "Amiwo Poulet Bicyclette", "Carpe grillée", "Alloco", "Mousse Mangue"],
      serviceLevel: "Mise en place buffet, chauffe-plats inox, service par maîtres d'hôtel en tenue royale",
      imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "cat-02",
      name: "Banquet Royal d'Abomey (3 Services Clé en Main)",
      pricePerPersonXof: 24000,
      minGuests: 50,
      inclusions: ["Cocktail d'accueil Vignoble", "Djenkoumé Royal", "Agouti braisé", "Vins & Champagnes inclus"],
      serviceLevel: "Service à table sous cloche, arts de la table dorés, sommelier dédié et chef sur place",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "cat-03",
      name: "Cocktail Dînatoire VIP & Canapés Fins",
      pricePerPersonXof: 9500,
      minGuests: 25,
      inclusions: ["12 Pièces cocktail par convive", "Mini-brochettes de pintade", "Verrines avocat crevette"],
      serviceLevel: "Service au plateau en continu, mange-debout et verrerie en cristal",
      imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  const [cateringModalOpen, setCateringModalOpen] = useState(false);
  const [editingCatering, setEditingCatering] = useState<CateringRecord | null>(null);
  const [cateringForm, setCateringForm] = useState<Partial<CateringRecord>>({
    name: "",
    pricePerPersonXof: 15000,
    minGuests: 30,
    inclusions: ["Entrée", "Plat de résistance", "Dessert"],
    serviceLevel: "Personnel inclus",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  });

  // =========================================================================
  // 6. DATA: PERSONNEL (20 COMPTES)
  // =========================================================================
  const [staffList, setStaffList] = useState<StaffRecord[]>(
    SEED_USERS.map((u) => {
      const prop = SEED_PROPERTIES.find((p) => p.id === u.propertyId);
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        roleName: u.roleName,
        roleCode: u.roleCode,
        propertyName: prop ? prop.name : "Groupe Entier (Siège)",
        propertyId: u.propertyId,
        maxDiscount: u.maxDiscount,
        phone: "+229 97 00 00 00",
        status: "ACTIF",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      };
    })
  );

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [staffForm, setStaffForm] = useState<Partial<StaffRecord>>({
    fullName: "",
    email: "",
    roleName: "Réceptionniste",
    roleCode: "RECEPTIONIST",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    propertyId: "prop-bohicon-001",
    maxDiscount: "10",
    phone: "+229 97 00 11 22",
    status: "ACTIF",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  });

  // =========================================================================
  // 7. DATA: TRESORERIE
  // =========================================================================
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>([
    {
      id: "acc-boa-01",
      label: "Compte Courant Principal BOA Bénin",
      type: "BANQUE",
      balanceXof: 8450000,
      accountNumber: "BJ061 01001 002345678901 45",
      institution: "Bank of Africa Bénin (Agence Bohicon)",
    },
    {
      id: "acc-cash-central",
      label: "Caisse Centrale d'Exploitation",
      type: "CAISSE",
      balanceXof: 1250000,
      accountNumber: "CAISSE-SIEGE-001",
      institution: "Coffre-fort Direction Générale",
    },
    {
      id: "acc-momo-kkiapay",
      label: "Compte Passerelle KkiaPay Mobile Money",
      type: "MOBILE_MONEY",
      balanceXof: 2750000,
      accountNumber: "KKIAPAY-MERCHANT-LE-VIGNOBLE",
      institution: "MTN MoMo / Moov Money / Celtiis",
    },
  ]);

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([
    {
      id: "tx-01",
      date: "Aujourd'hui, 14:30",
      label: "Encaissement Réservation M. Mathieu Dossou (Suite Royale)",
      type: "ENTREE",
      amountXof: 85000,
      accountId: "acc-momo-kkiapay",
      accountLabel: "KkiaPay MoMo",
      category: "Hébergement",
    },
    {
      id: "tx-02",
      date: "Aujourd'hui, 12:15",
      label: "Vente Cave à Vin (2x Moët & Chandon Brut)",
      type: "ENTREE",
      amountXof: 130000,
      accountId: "acc-cash-central",
      accountLabel: "Caisse Centrale",
      category: "Cave à Vin",
    },
    {
      id: "tx-03",
      date: "Aujourd'hui, 09:40",
      label: "Achat vivres marché central de Bohicon (volaille, légumes)",
      type: "SORTIE",
      amountXof: 45000,
      accountId: "acc-cash-central",
      accountLabel: "Caisse Centrale",
      category: "Approvisionnement Cuisine",
    },
  ]);

  const [treasuryModalOpen, setTreasuryModalOpen] = useState(false);
  const [treasuryForm, setTreasuryForm] = useState({
    label: "",
    type: "ENTREE" as "ENTREE" | "SORTIE",
    amountXof: 50000,
    accountId: "acc-cash-central",
    category: "Recette",
  });

  const totalTreasuryBalance = treasuryAccounts.reduce((acc, curr) => acc + curr.balanceXof, 0);

  // =========================================================================
  // 8. DATA: COMMANDES (FLUX COMPLET SITES & CLIENTS)
  // =========================================================================
  const [orders, setOrders] = useState<OrderRecord[]>([
    {
      id: "ord-001",
      orderNumber: "CMD-2026-089",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      orderType: "RESERVATION_CHAMBRE",
      clientName: "M. Mathieu DOSSOU",
      clientPhone: "+229 97 12 34 56",
      itemsSummary: "Suite Royale N°101 (2 nuitées) + Petit-déjeuner royal",
      totalAmountXof: 170000,
      status: "VALIDEE",
      origin: "CLIENT_SITE_WEB",
      createdAt: "Aujourd'hui, 14:30",
    },
    {
      id: "ord-002",
      orderNumber: "CMD-2026-090",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      orderType: "REPAS_BOISSON",
      clientName: "Table N°4 (Terrasse)",
      clientPhone: "+229 96 11 22 33",
      itemsSummary: "2x Amiwo Royal Poulet Bicyclette + 1x Alloco + 2x Jus d'ananas frais",
      totalAmountXof: 21000,
      status: "EN_PREPARATION",
      origin: "SERVEUSE",
      createdAt: "Aujourd'hui, 13:45",
    },
    {
      id: "ord-003",
      orderNumber: "CMD-2026-091",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      orderType: "CAVE_A_VIN",
      clientName: "Mme Clarisse KPADONOU",
      clientPhone: "+229 95 00 12 45",
      itemsSummary: "2x Moët & Chandon Brut Impérial + 1x Château Vignoble Réserve",
      totalAmountXof: 168000,
      status: "PAYEE",
      origin: "CLIENT_SITE_WEB",
      createdAt: "Aujourd'hui, 12:15",
    },
    {
      id: "ord-004",
      orderNumber: "CMD-2026-092",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      orderType: "LOCATION_MATERIEL",
      clientName: "Délégation Ministère du Tourisme",
      clientPhone: "+229 97 88 99 00",
      itemsSummary: "Toyota Land Cruiser V8 Executive VIP (2 jours avec chauffeur)",
      totalAmountXof: 240000,
      status: "EN_PREPARATION",
      origin: "RECEPTION",
      createdAt: "Aujourd'hui, 11:20",
    },
    {
      id: "ord-005",
      orderNumber: "CMD-2026-093",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      orderType: "REPAS_BOISSON",
      clientName: "Table N°2 (Salon Privé)",
      clientPhone: "+229 90 22 33 44",
      itemsSummary: "3x Djenkoumé Royal & Pintade + 1x Agouti braisé",
      totalAmountXof: 36500,
      status: "EN_ATTENTE",
      origin: "SERVEUSE",
      createdAt: "Aujourd'hui, 11:05",
    },
    {
      id: "ord-006",
      orderNumber: "CMD-2026-094",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      orderType: "RESERVATION_CHAMBRE",
      clientName: "Pr. Justin ADANHOUNME",
      clientPhone: "+229 97 45 67 89",
      itemsSummary: "Pavillon VIP N°301 (1 nuitée affaires)",
      totalAmountXof: 55000,
      status: "LIVREE",
      origin: "CLIENT_SITE_WEB",
      createdAt: "Hier, 19:10",
    },
    {
      id: "ord-007",
      orderNumber: "CMD-2026-095",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      orderType: "SERVICE_TRAITEUR",
      clientName: "Société Bénin Télécoms",
      clientPhone: "+229 21 30 00 00",
      itemsSummary: "Buffet Prestige Terroir (50 convives) + Location Salle de Conférence",
      totalAmountXof: 725000,
      status: "VALIDEE",
      origin: "CLIENT_SITE_WEB",
      createdAt: "Hier, 16:40",
    },
    {
      id: "ord-008",
      orderNumber: "CMD-2026-096",
      propertyId: "prop-zogbo-004",
      propertyName: "Hôtel Le Vignoble - Zogbodomey",
      orderType: "RESERVATION_CHAMBRE",
      clientName: "M. Romain HOUENOU",
      clientPhone: "+229 94 33 22 11",
      itemsSummary: "Pavillon N°401 (Séjour détente week-end)",
      totalAmountXof: 35000,
      status: "VALIDEE",
      origin: "CLIENT_SITE_WEB",
      createdAt: "Hier, 15:00",
    },
  ]);

  // =========================================================================
  // 9. DATA: EVENEMENTS & RENDEZ-VOUS
  // =========================================================================
  const [hotelEvents, setHotelEvents] = useState<HotelEventRecord[]>([
    {
      id: "evt-01",
      title: "Le Grand Brunch Dominical du Terroir",
      category: "BRUNCH",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      date: "2026-11-22",
      startTime: "11:30",
      endTime: "16:00",
      expectedGuests: 120,
      pricePerPersonXof: 18500,
      description: "Grand buffet gourmand en plein air, grillades au feu de bois, orchestre acoustique et animation verger.",
      imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
      tags: ["#BrunchVignoble", "#BuffetTerroir", "#Piscine"],
      status: "PLANIFIE",
    },
    {
      id: "evt-02",
      title: "Soirée Prestige Oenologie & Dégustation Grands Crus",
      category: "SOIREE_PRESTIGE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      date: "2026-11-28",
      startTime: "19:30",
      endTime: "23:30",
      expectedGuests: 40,
      pricePerPersonXof: 35000,
      description: "Dégustation animée par un sommelier réputé. 5 crus d'exception et accords mets royaux.",
      imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
      tags: ["#OenologieVignoble", "#GrandsCrus", "#Sommelier"],
      status: "PLANIFIE",
    },
    {
      id: "evt-03",
      title: "Gala Royal & Nuit Historique d'Abomey",
      category: "GALA",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      date: "2026-12-12",
      startTime: "20:00",
      endTime: "02:00",
      expectedGuests: 250,
      pricePerPersonXof: 45000,
      description: "Dîner de gala impérial sous cloche dorée, danses traditionnelles de cour et récital d'artistes royaux.",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      tags: ["#GalaRoyal", "#NuitAbomey", "#Prestige"],
      status: "PLANIFIE",
    },
    {
      id: "evt-04",
      title: "Séminaire Exécutif & Sommet des Décideurs",
      category: "SEMINAIRE",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      date: "2026-12-18",
      startTime: "08:30",
      endTime: "18:00",
      expectedGuests: 80,
      pricePerPersonXof: 28000,
      description: "Atelier stratégique d'entreprises, équipement 4K, pauses gourmandes et navettes aéroport dédiées.",
      imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
      tags: ["#SeminaireVIP", "#CalaviBusiness", "#Colloque"],
      status: "PLANIFIE",
    },
    {
      id: "evt-05",
      title: "Soirée Romantique aux Chandelles",
      category: "SOIREE_PRESTIGE",
      propertyId: "prop-zogbo-004",
      propertyName: "Hôtel Le Vignoble - Zogbodomey",
      date: "2026-11-21",
      startTime: "19:00",
      endTime: "23:00",
      expectedGuests: 50,
      pricePerPersonXof: 22000,
      description: "Ambiance feutrée aux abords des bassins, menu dégustation deux couverts et violoniste live.",
      imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
      tags: ["#RomanceVignoble", "#DînerAuxChandelles"],
      status: "PLANIFIE",
    },
  ]);

  // =========================================================================
  // 10. DATA: MUTATIONS DU PERSONNEL (DIRECTION & DAF SEULEMENT)
  // =========================================================================
  const [mutations, setMutations] = useState<StaffMutationRecord[]>([
    {
      id: "mut-001",
      staffId: "user-rec-boh",
      staffName: "Reine KPONHINTO",
      fromPropertyId: "prop-calavi-003",
      fromPropertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      toPropertyId: "prop-bohicon-001",
      toPropertyName: "Hôtel Le Vignoble - Bohicon",
      fromRoleName: "Réceptionniste",
      toRoleName: "Réceptionniste Principale Bohicon",
      effectiveDate: "2026-11-01",
      decisionMaker: "Eddy GNACADJA (Promoteur)",
      reason: "Renfort stratégique de l'accueil au siège pour la haute saison touristique.",
      status: "EFFECTIVE",
    },
    {
      id: "mut-002",
      staffId: "user-dir-abm",
      staffName: "Sylvain KPOFFON",
      fromPropertyId: "prop-bohicon-001",
      fromPropertyName: "Direction Générale Groupe",
      toPropertyId: "prop-abomey-002",
      toPropertyName: "Hôtel Le Vignoble - Abomey",
      fromRoleName: "Responsable Hébergement",
      toRoleName: "Gérant Agence Abomey",
      effectiveDate: "2026-10-15",
      decisionMaker: "Marcelin AGBIDINOUKOUN (DAF)",
      reason: "Promotion au poste de direction de site pour dynamiser le complexe historique d'Abomey.",
      status: "EFFECTIVE",
    },
    {
      id: "mut-003",
      staffId: "user-srv-boh",
      staffName: "Prudence DOSSOU",
      fromPropertyId: "prop-abomey-002",
      fromPropertyName: "Hôtel Le Vignoble - Abomey",
      toPropertyId: "prop-bohicon-001",
      toPropertyName: "Hôtel Le Vignoble - Bohicon",
      fromRoleName: "Serveuse Bar & Resto",
      toRoleName: "Chef de Rang Restaurant Royal Bohicon",
      effectiveDate: "2026-11-10",
      decisionMaker: "Eddy GNACADJA (Promoteur)",
      reason: "Affectation pour superviser les banquets et le service traiteur au restaurant central.",
      status: "EFFECTIVE",
    },
  ]);

  // =========================================================================
  // 11. DATA: NOTATIONS DU PERSONNEL PAR LES CLIENTS
  // =========================================================================
  const [ratings, setRatings] = useState<StaffRatingRecord[]>([
    {
      id: "rat-001",
      staffId: "user-rec-boh",
      staffName: "Reine KPONHINTO",
      staffRole: "Réceptionniste",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      clientName: "M. Mathieu DOSSOU",
      clientEmail: "mathieu.dossou@gmail.com",
      serviceCategory: "ACCUEIL_RECEPTION",
      rating: 5,
      comment: "Accueil royal et souriant ! Prise en charge immédiate pour notre arrivée tardive. Elle a été aux petits soins.",
      date: "15 Nov 2026",
      notifiedRoles: ["Promoteur", "DAF", "Gérant Bohicon", "Reine KPONHINTO"],
    },
    {
      id: "rat-002",
      staffId: "user-srv-boh",
      staffName: "Prudence DOSSOU",
      staffRole: "Serveuse Bar & Resto",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      clientName: "Dr. Armand SOGLO",
      clientEmail: "armand.soglo@yahoo.fr",
      serviceCategory: "RESTAURATION_BAR",
      rating: 5,
      comment: "Service à table impeccable pour le déjeuner royal. L'Amiwo et le poulet bicyclette servis chauds et avec élégance.",
      date: "15 Nov 2026",
      notifiedRoles: ["Promoteur", "DAF", "Gérant Bohicon", "Prudence DOSSOU"],
    },
    {
      id: "rat-003",
      staffId: "user-dir-boh",
      staffName: "Aimée Hounsinou",
      staffRole: "Directeur de Site",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      clientName: "Mme Clarisse KPADONOU",
      clientEmail: "c.kpadonou@banque-atlantique.bj",
      serviceCategory: "SERVICE_CHAMBRE",
      rating: 5,
      comment: "Gestion de notre séjour au cordeau. Le directeur a personnellement veillé au confort de notre suite VIP.",
      date: "14 Nov 2026",
      notifiedRoles: ["Promoteur", "DAF", "Aimée Hounsinou"],
    },
    {
      id: "rat-004",
      staffId: "user-srv-abm",
      staffName: "Béatrice HOUEDANOU",
      staffRole: "Serveuse Bar & Resto",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      clientName: "M. Christian BOKPE",
      clientEmail: "christian.b@outlook.com",
      serviceCategory: "RESTAURATION_BAR",
      rating: 4,
      comment: "Très gentille et serviable pour notre dîner sous les étoiles à Abomey. Cadre magique.",
      date: "14 Nov 2026",
      notifiedRoles: ["Promoteur", "DAF", "Gérant Abomey", "Béatrice HOUEDANOU"],
    },
    {
      id: "rat-005",
      staffId: "user-srv-abc",
      staffName: "Chantal AGBOHOUN",
      staffRole: "Serveuse Bar & Resto",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      clientName: "Pr. Justin ADANHOUNME",
      clientEmail: "adanhoume.j@uac.bj",
      serviceCategory: "ACCUEIL_RECEPTION",
      rating: 5,
      comment: "Discrétion et ponctualité remarquable pour notre réunion d'affaires à Calavi. Bravo à toute l'équipe.",
      date: "13 Nov 2026",
      notifiedRoles: ["Promoteur", "DAF", "Gérant Calavi", "Chantal AGBOHOUN"],
    },
    {
      id: "rat-006",
      staffId: "user-srv-zog",
      staffName: "Flora TCHIBOZO",
      staffRole: "Serveuse Bar & Resto",
      propertyId: "prop-zogbo-004",
      propertyName: "Hôtel Le Vignoble - Zogbodomey",
      clientName: "Famille GOMEZ",
      clientEmail: "famille.gomez@gmail.com",
      serviceCategory: "SERVICE_TRAITEUR",
      rating: 5,
      comment: "Week-end ressourçant à Zogbodomey. Flora a été adorable avec nos enfants lors du petit-déjeuner.",
      date: "12 Nov 2026",
      notifiedRoles: ["Promoteur", "DAF", "Gérant Zogbodomey", "Flora TCHIBOZO"],
    },
  ]);

  // =========================================================================
  // 12. DATA: STOCKS MULTI-SITES (CAVE, BAR, VIVRES CUISINE, LINGERIE, ENTRETIEN)
  // =========================================================================
  const [stocks, setStocks] = useState<StockItemRecord[]>([
    // CAVE A VIN
    {
      id: "stk-cv-01",
      sku: "STK-CAVE-001",
      name: "Château Vignoble Réserve Prestige (75cl)",
      category: "CAVE_A_VIN",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bouteilles",
      currentQuantity: 38,
      alertThreshold: 15,
      securityThreshold: 5,
      unitCostXof: 22000,
      storageLocation: "Cave Climatisée Centrale",
      supplierName: "Domaine Le Vignoble",
    },
    {
      id: "stk-cv-02",
      sku: "STK-CAVE-002",
      name: "Champagne Moët & Chandon Brut Impérial (75cl)",
      category: "CAVE_A_VIN",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bouteilles",
      currentQuantity: 12,
      alertThreshold: 10,
      securityThreshold: 4,
      unitCostXof: 45000,
      storageLocation: "Cave Climatisée Centrale",
      supplierName: "Import Épernay France",
    },
    {
      id: "stk-cv-03",
      sku: "STK-CAVE-003",
      name: "Châteauneuf-du-Pape Grand Millésime (75cl)",
      category: "CAVE_A_VIN",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bouteilles",
      currentQuantity: 8,
      alertThreshold: 10,
      securityThreshold: 3,
      unitCostXof: 38000,
      storageLocation: "Cave Climatisée Centrale",
      supplierName: "Vins de la Vallée du Rhône",
    },
    {
      id: "stk-cv-04",
      sku: "STK-CAVE-004",
      name: "Cognac Hennessy VSOP Privilège (70cl)",
      category: "CAVE_A_VIN",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      unitMeasure: "Bouteilles",
      currentQuantity: 4,
      alertThreshold: 6,
      securityThreshold: 2,
      unitCostXof: 48000,
      storageLocation: "Cave VIP Calavi",
      supplierName: "Distillerie Prestige",
    },
    {
      id: "stk-cv-05",
      sku: "STK-CAVE-005",
      name: "Liqueur Royale de Maracudja Terroir Bénin",
      category: "CAVE_A_VIN",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      unitMeasure: "Bouteilles",
      currentQuantity: 32,
      alertThreshold: 15,
      securityThreshold: 6,
      unitCostXof: 8500,
      storageLocation: "Réserve Spéciale Abomey",
      supplierName: "Distillerie Artisanale d'Allada",
    },

    // BAR & RESTAURANT (BOISSONS)
    {
      id: "stk-br-01",
      sku: "STK-BAR-001",
      name: "Bière Béninoise La Béninoise (65cl)",
      category: "BOISSON_BAR",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bouteilles",
      currentQuantity: 140,
      alertThreshold: 50,
      securityThreshold: 20,
      unitCostXof: 950,
      storageLocation: "Chambre Froide Bar Lounge",
      supplierName: "SOBEBRA Bénin",
    },
    {
      id: "stk-br-02",
      sku: "STK-BAR-002",
      name: "Bière Beaufort Lager (50cl)",
      category: "BOISSON_BAR",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bouteilles",
      currentQuantity: 45,
      alertThreshold: 50,
      securityThreshold: 15,
      unitCostXof: 1100,
      storageLocation: "Chambre Froide Bar Lounge",
      supplierName: "SOBEBRA Bénin",
    },
    {
      id: "stk-br-03",
      sku: "STK-BAR-003",
      name: "Eau Minérale Naturelle Possotomé (1.5L)",
      category: "BOISSON_BAR",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bouteilles",
      currentQuantity: 180,
      alertThreshold: 60,
      securityThreshold: 25,
      unitCostXof: 450,
      storageLocation: "Dépôt Boissons Central",
      supplierName: "Sources de Possotomé",
    },
    {
      id: "stk-br-04",
      sku: "STK-BAR-004",
      name: "Jus d'Ananas Pur Frais Pressé d'Allada (1L)",
      category: "BOISSON_BAR",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bouteilles",
      currentQuantity: 18,
      alertThreshold: 25,
      securityThreshold: 8,
      unitCostXof: 750,
      storageLocation: "Frigo Comptoir Bar",
      supplierName: "Coopérative Ananas Allada",
    },
    {
      id: "stk-br-05",
      sku: "STK-BAR-005",
      name: "Sodas Assortis (Coca-Cola, Fanta, Sprite 33cl)",
      category: "BOISSON_BAR",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      unitMeasure: "Canettes",
      currentQuantity: 95,
      alertThreshold: 40,
      securityThreshold: 15,
      unitCostXof: 500,
      storageLocation: "Réserve Bar Calavi",
      supplierName: "SOBEBRA Bénin",
    },

    // CUISINE (VIVRES & MATIERES PREMIERES BRUTES POUR REPAS)
    {
      id: "stk-vc-01",
      sku: "STK-VIV-001",
      name: "Poulets Bicyclettes Fermiers Prêts à Cuire",
      category: "VIVRES_CUISINE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Unités",
      currentQuantity: 42,
      alertThreshold: 15,
      securityThreshold: 6,
      unitCostXof: 3200,
      storageLocation: "Chambre Froide Négative Cuisine",
      supplierName: "Élevage Local Bohicon Terroir",
    },
    {
      id: "stk-vc-02",
      sku: "STK-VIV-002",
      name: "Quartiers et Gigots de Mouton Frais Découpés",
      category: "VIVRES_CUISINE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Kg",
      currentQuantity: 11,
      alertThreshold: 15,
      securityThreshold: 5,
      unitCostXof: 3800,
      storageLocation: "Chambre Froide Viandes",
      supplierName: "Boucherie Centrale du Zou",
    },
    {
      id: "stk-vc-03",
      sku: "STK-VIV-003",
      name: "Poissons Mérous et Capitaines Frais du Lac",
      category: "VIVRES_CUISINE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Kg",
      currentQuantity: 26,
      alertThreshold: 12,
      securityThreshold: 5,
      unitCostXof: 4500,
      storageLocation: "Chambre Froide Poissons",
      supplierName: "Pêcheries Artisanales Lac Nokoué",
    },
    {
      id: "stk-vc-04",
      sku: "STK-VIV-004",
      name: "Sacs de Riz Parfumé Long Grain Qualité Supérieure",
      category: "VIVRES_CUISINE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Sacs 25kg",
      currentQuantity: 16,
      alertThreshold: 6,
      securityThreshold: 2,
      unitCostXof: 18500,
      storageLocation: "Économat Vivres Secs",
      supplierName: "Rizerie de Glazoué",
    },
    {
      id: "stk-vc-05",
      sku: "STK-VIV-005",
      name: "Régimes de Bananes Plantains Mûres (Alloco)",
      category: "VIVRES_CUISINE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Régimes",
      currentQuantity: 7,
      alertThreshold: 8,
      securityThreshold: 3,
      unitCostXof: 4500,
      storageLocation: "Zone Légumerie Aérée",
      supplierName: "Marché Central d'Abomey",
    },
    {
      id: "stk-vc-06",
      sku: "STK-VIV-006",
      name: "Bidons d'Huile Végétale Raffinée Pure (20L)",
      category: "VIVRES_CUISINE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bidons 20L",
      currentQuantity: 10,
      alertThreshold: 4,
      securityThreshold: 2,
      unitCostXof: 21000,
      storageLocation: "Économat Vivres Secs",
      supplierName: "Huilerie d'Avrankou",
    },
    {
      id: "stk-vc-07",
      sku: "STK-VIV-007",
      name: "Farine d'Igname Pilée Pure (Agoun du Zou)",
      category: "VIVRES_CUISINE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Sacs 10kg",
      currentQuantity: 14,
      alertThreshold: 5,
      securityThreshold: 2,
      unitCostXof: 8000,
      storageLocation: "Économat Vivres Secs",
      supplierName: "Producteurs du Zou Nord",
    },
    {
      id: "stk-vc-08",
      sku: "STK-VIV-008",
      name: "Tomates Fraîches Terroir & Pâte de Piment Rouge",
      category: "VIVRES_CUISINE",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      unitMeasure: "Kg",
      currentQuantity: 28,
      alertThreshold: 10,
      securityThreshold: 4,
      unitCostXof: 1200,
      storageLocation: "Légumerie Calavi",
      supplierName: "Maraîchers Calavi",
    },

    // LINGERIE & MATERIEL DE CHAMBRES
    {
      id: "stk-lc-01",
      sku: "STK-LING-001",
      name: "Draps Grand Lit 2 Places en Coton d'Égypte 300 Fils",
      category: "LINGERIE_CHAMBRE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Pièces",
      currentQuantity: 85,
      alertThreshold: 30,
      securityThreshold: 12,
      unitCostXof: 14000,
      storageLocation: "Lingerie Centrale RDC",
      supplierName: "Textile Hôtelier Prestige",
    },
    {
      id: "stk-lc-02",
      sku: "STK-LING-002",
      name: "Draps Lit Simple 1 Place Satinés",
      category: "LINGERIE_CHAMBRE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Pièces",
      currentQuantity: 48,
      alertThreshold: 20,
      securityThreshold: 8,
      unitCostXof: 9500,
      storageLocation: "Lingerie Centrale RDC",
      supplierName: "Textile Hôtelier Prestige",
    },
    {
      id: "stk-lc-03",
      sku: "STK-LING-003",
      name: "Grandes Serviettes de Bain Éponge Épaisse 600g",
      category: "LINGERIE_CHAMBRE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Pièces",
      currentQuantity: 110,
      alertThreshold: 40,
      securityThreshold: 15,
      unitCostXof: 6500,
      storageLocation: "Lingerie Centrale RDC",
      supplierName: "Linge d'Or Cotonou",
    },
    {
      id: "stk-lc-04",
      sku: "STK-LING-004",
      name: "Taies d'Oreiller Brodées Sigle Le Vignoble",
      category: "LINGERIE_CHAMBRE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Pièces",
      currentQuantity: 92,
      alertThreshold: 30,
      securityThreshold: 10,
      unitCostXof: 3500,
      storageLocation: "Lingerie Centrale RDC",
      supplierName: "Linge d'Or Cotonou",
    },
    {
      id: "stk-lc-05",
      sku: "STK-LING-005",
      name: "Savonnettes Végétales d'Accueil Hôtelières 40g",
      category: "LINGERIE_CHAMBRE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Pièces",
      currentQuantity: 240,
      alertThreshold: 80,
      securityThreshold: 30,
      unitCostXof: 350,
      storageLocation: "Économat Produits d'Accueil",
      supplierName: "Cosmétiques Terroir Bénin",
    },
    {
      id: "stk-lc-06",
      sku: "STK-LING-006",
      name: "Rouleaux de Papier Hygiénique Qualité Supérieure Double Épaisseur",
      category: "LINGERIE_CHAMBRE",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Rouleaux",
      currentQuantity: 195,
      alertThreshold: 70,
      securityThreshold: 25,
      unitCostXof: 300,
      storageLocation: "Magasin Central Housekeeping",
      supplierName: "Papeterie Centrale Cotonou",
    },
    {
      id: "stk-lc-07",
      sku: "STK-LING-007",
      name: "Flacons Shampoing & Gel Douche Huile d'Argan (50ml)",
      category: "LINGERIE_CHAMBRE",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      unitMeasure: "Flacons",
      currentQuantity: 150,
      alertThreshold: 60,
      securityThreshold: 20,
      unitCostXof: 450,
      storageLocation: "Magasin Housekeeping Calavi",
      supplierName: "Cosmétiques Terroir Bénin",
    },

    // PRODUITS D'ENTRETIEN
    {
      id: "stk-pe-01",
      sku: "STK-ENT-001",
      name: "Détergent Désinfectant Hôtelier Sols & Surfaces Parfum Pin (5L)",
      category: "PRODUIT_ENTRETIEN",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bidons 5L",
      currentQuantity: 18,
      alertThreshold: 8,
      securityThreshold: 3,
      unitCostXof: 7500,
      storageLocation: "Local Produits Chimiques & Entretien",
      supplierName: "Hygiène Pro Bénin",
    },
    {
      id: "stk-pe-02",
      sku: "STK-ENT-002",
      name: "Eau de Javel Concentrée 12° Hôtelière (5L)",
      category: "PRODUIT_ENTRETIEN",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Bidons 5L",
      currentQuantity: 22,
      alertThreshold: 8,
      securityThreshold: 3,
      unitCostXof: 4500,
      storageLocation: "Local Produits Chimiques & Entretien",
      supplierName: "Hygiène Pro Bénin",
    },
    {
      id: "stk-pe-03",
      sku: "STK-ENT-003",
      name: "Nettoyant Vitres et Miroirs Professionnel Sans Traces (1L)",
      category: "PRODUIT_ENTRETIEN",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Flacons 1L",
      currentQuantity: 5,
      alertThreshold: 8,
      securityThreshold: 2,
      unitCostXof: 2200,
      storageLocation: "Local Housekeeping",
      supplierName: "Hygiène Pro Bénin",
    },
    {
      id: "stk-pe-04",
      sku: "STK-ENT-004",
      name: "Sacs Poubelle Épais Renforcés 100L",
      category: "PRODUIT_ENTRETIEN",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      unitMeasure: "Rouleaux 25 unités",
      currentQuantity: 24,
      alertThreshold: 10,
      securityThreshold: 4,
      unitCostXof: 3500,
      storageLocation: "Local Entretien RDC",
      supplierName: "Plastiques d'Afrique",
    },
    {
      id: "stk-pe-05",
      sku: "STK-ENT-005",
      name: "Lavettes Microfibres & Éponges Sanitaires Professionnelles",
      category: "PRODUIT_ENTRETIEN",
      propertyId: "prop-abomey-002",
      propertyName: "Hôtel Le Vignoble - Abomey",
      unitMeasure: "Pièces",
      currentQuantity: 40,
      alertThreshold: 20,
      securityThreshold: 8,
      unitCostXof: 1200,
      storageLocation: "Réserve Entretien Abomey",
      supplierName: "Hygiène Pro Bénin",
    },
  ]);

  // Stocks Specific States & Filters
  const [stockDisplayMode, setStockDisplayMode] = useState<"QUANTITY" | "VALUE">("QUANTITY");
  const [stockCategoryFilter, setStockCategoryFilter] = useState<string>("ALL");
  const [stockPropertyFilter, setStockPropertyFilter] = useState<string>("ALL");
  const [stockAlertFilter, setStockAlertFilter] = useState<"ALL" | "ALERTS_ONLY">("ALL");
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItemRecord | null>(null);
  const [stockForm, setStockForm] = useState<Partial<StockItemRecord>>({
    sku: "",
    name: "",
    category: "VIVRES_CUISINE",
    propertyId: "prop-bohicon-001",
    unitMeasure: "Kg",
    currentQuantity: 10,
    alertThreshold: 5,
    securityThreshold: 2,
    unitCostXof: 5000,
    storageLocation: "Économat Principal",
    supplierName: "",
  });

  // =========================================================================
  // 13. DATA: ROLES ET ATTRIBUTS DU PERSONNEL (HABILITATIONS & DROITS MODULAIRES)
  // =========================================================================
  const [staffRoleAssignments, setStaffRoleAssignments] = useState<StaffRoleRecord[]>([
    {
      id: "user-rec-boh",
      fullName: "Gaston Dossou",
      email: "reception.boh@hotel-levignoble.bj",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      roleCode: "RECEPTIONIST",
      roleName: "Réceptionniste Bohicon",
      maxDiscount: 5,
      rights: {
        pmsReservations: true,
        posOrderTaking: false,
        kitchenKds: false,
        barKds: false,
        cashFinance: true,
        hallBooking: false,
        equipmentCatering: false,
        reportsTreasury: false,
        intersiteMessaging: true,
        stocksManage: false,
      },
    },
    {
      id: "user-srv-boh",
      fullName: "Chantal Tossou",
      email: "serveuse.boh@hotel-levignoble.bj",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      roleCode: "WAITSTAFF",
      roleName: "Serveuse Restaurant & Bar Bohicon",
      maxDiscount: 0,
      rights: {
        pmsReservations: false,
        posOrderTaking: true,
        kitchenKds: false,
        barKds: false,
        cashFinance: false,
        hallBooking: false,
        equipmentCatering: false,
        reportsTreasury: false,
        intersiteMessaging: false,
        stocksManage: false,
      },
    },
    {
      id: "user-bar-boh",
      fullName: "Marc Kpadonou",
      email: "barman.boh@hotel-levignoble.bj",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      roleCode: "BARTENDER",
      roleName: "Barman & Sommelier Bohicon",
      maxDiscount: 0,
      rights: {
        pmsReservations: false,
        posOrderTaking: true,
        kitchenKds: false,
        barKds: true,
        cashFinance: false,
        hallBooking: false,
        equipmentCatering: false,
        reportsTreasury: false,
        intersiteMessaging: false,
        stocksManage: true,
      },
    },
    {
      id: "user-cui-boh",
      fullName: "Chef Rodrigue Mensah",
      email: "chef.boh@hotel-levignoble.bj",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      roleCode: "CHEF",
      roleName: "Chef Cuisinier Bohicon",
      maxDiscount: 0,
      rights: {
        pmsReservations: false,
        posOrderTaking: false,
        kitchenKds: true,
        barKds: false,
        cashFinance: false,
        hallBooking: false,
        equipmentCatering: false,
        reportsTreasury: false,
        intersiteMessaging: false,
        stocksManage: true,
      },
    },
    {
      id: "user-mgr-boh",
      fullName: "Gérant Bohicon",
      email: "gerant.bohicon@hotel-levignoble.bj",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      roleCode: "PROPERTY_MANAGER",
      roleName: "Gérant d'Établissement Bohicon",
      maxDiscount: 10,
      rights: {
        pmsReservations: true,
        posOrderTaking: true,
        kitchenKds: true,
        barKds: true,
        cashFinance: true,
        hallBooking: true,
        equipmentCatering: false,
        reportsTreasury: true,
        intersiteMessaging: true,
        stocksManage: true,
      },
    },
    {
      id: "user-rec-abc",
      fullName: "Nadine ADANHOU",
      email: "reception.abc@hotel-levignoble.bj",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      roleCode: "RECEPTIONIST",
      roleName: "Réceptionniste Calavi",
      maxDiscount: 5,
      rights: {
        pmsReservations: true,
        posOrderTaking: false,
        kitchenKds: false,
        barKds: false,
        cashFinance: true,
        hallBooking: false,
        equipmentCatering: false,
        reportsTreasury: false,
        intersiteMessaging: true,
        stocksManage: false,
      },
    },
    {
      id: "user-hsk-01",
      fullName: "Henriette DEDJI",
      email: "housekeeping@hotel-levignoble.bj",
      propertyId: "prop-bohicon-001",
      propertyName: "Hôtel Le Vignoble - Bohicon",
      roleCode: "HOUSEKEEPING",
      roleName: "Gouvernante Générale (Housekeeping)",
      maxDiscount: 0,
      rights: {
        pmsReservations: true,
        posOrderTaking: false,
        kitchenKds: false,
        barKds: false,
        cashFinance: false,
        hallBooking: false,
        equipmentCatering: false,
        reportsTreasury: false,
        intersiteMessaging: true,
        stocksManage: true,
      },
    },
    {
      id: "user-event-01",
      fullName: "Mathurin VODOUNOU",
      email: "traiteur.event@hotel-levignoble.bj",
      propertyId: "prop-bohicon-001",
      propertyName: "Groupe Hôtel Le Vignoble",
      roleCode: "CATERING_MANAGER",
      roleName: "Responsable Traiteur & Matériel",
      maxDiscount: 10,
      rights: {
        pmsReservations: false,
        posOrderTaking: true,
        kitchenKds: true,
        barKds: true,
        cashFinance: true,
        hallBooking: true,
        equipmentCatering: true,
        reportsTreasury: true,
        intersiteMessaging: true,
        stocksManage: true,
      },
    },
    {
      id: "user-daf-01",
      fullName: "Direction Financière (DAF)",
      email: "daf@hotel-levignoble.bj",
      propertyId: "prop-bohicon-001",
      propertyName: "Groupe Hôtel Le Vignoble (Consolidé)",
      roleCode: "FINANCIAL_DIRECTOR",
      roleName: "Directeur Administratif & Financier",
      maxDiscount: 20,
      rights: {
        pmsReservations: true,
        posOrderTaking: true,
        kitchenKds: true,
        barKds: true,
        cashFinance: true,
        hallBooking: true,
        equipmentCatering: true,
        reportsTreasury: true,
        intersiteMessaging: true,
        stocksManage: true,
      },
    },
  ]);

  // Roles Specific States & Filters
  const [rolePropertyFilter, setRolePropertyFilter] = useState<string>("ALL");
  const [roleCodeFilter, setRoleCodeFilter] = useState<string>("ALL");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRoleAssignment, setEditingRoleAssignment] = useState<StaffRoleRecord | null>(null);
  const [roleForm, setRoleForm] = useState<Partial<StaffRoleRecord>>({
    fullName: "",
    email: "",
    roleCode: "RECEPTIONIST",
    roleName: "Réceptionniste",
    propertyId: "prop-bohicon-001",
    maxDiscount: 5,
    rights: {
      pmsReservations: true,
      posOrderTaking: false,
      kitchenKds: false,
      barKds: false,
      cashFinance: false,
      hallBooking: false,
      equipmentCatering: false,
      reportsTreasury: false,
      intersiteMessaging: true,
      stocksManage: false,
    },
  });
  const filteredRooms = rooms.filter((r) => {
    if (isManager && managerPropertyId && r.propertyId !== managerPropertyId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.number.includes(q) ||
        r.propertyName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roomAgencyFilter !== "ALL" && r.propertyId !== roomAgencyFilter) return false;
    if (roomStatusFilter !== "ALL" && r.status !== roomStatusFilter) return false;
    if (roomTypeFilter !== "ALL" && r.type !== roomTypeFilter) return false;
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (isManager && managerPropertyId && o.propertyId !== managerPropertyId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        o.orderNumber.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        o.itemsSummary.toLowerCase().includes(q) ||
        o.propertyName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (orderSiteFilter !== "ALL" && o.propertyId !== orderSiteFilter) return false;
    if (orderTypeFilter !== "ALL" && o.orderType !== orderTypeFilter) return false;
    if (orderStatusFilter !== "ALL" && o.status !== orderStatusFilter) return false;
    return true;
  });

  const filteredEvents = hotelEvents.filter((e) => {
    if (isManager && managerPropertyId && e.propertyId !== managerPropertyId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.propertyName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (eventSiteFilter !== "ALL" && e.propertyId !== eventSiteFilter) return false;
    if (eventCategoryFilter !== "ALL" && e.category !== eventCategoryFilter) return false;
    return true;
  });

  const filteredRatings = ratings.filter((rt) => {
    if (isManager && managerPropertyId && rt.propertyId !== managerPropertyId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        rt.staffName.toLowerCase().includes(q) ||
        rt.clientName.toLowerCase().includes(q) ||
        rt.comment.toLowerCase().includes(q) ||
        rt.propertyName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (ratingSiteFilter !== "ALL" && rt.propertyId !== ratingSiteFilter) return false;
    if (ratingCategoryFilter !== "ALL" && rt.serviceCategory !== ratingCategoryFilter) return false;
    if (ratingMinStars > 0 && rt.rating < ratingMinStars) return false;
    return true;
  });

  const filteredStaff = isManager && managerPropertyId
    ? staffList.filter((s) => s.propertyId === managerPropertyId)
    : staffList;

  const filteredWines = wines
    .filter((w) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          w.name.toLowerCase().includes(q) ||
          w.origin.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (wineCategoryFilter !== "ALL" && w.category !== wineCategoryFilter) return false;
      if (winePriceFilter !== "ALL") {
        if (winePriceFilter === "LESS_25K" && w.priceXof >= 25000) return false;
        if (winePriceFilter === "25K_75K" && (w.priceXof < 25000 || w.priceXof > 75000)) return false;
        if (winePriceFilter === "MORE_75K" && w.priceXof <= 75000) return false;
      }
      if (wineStockFilter !== "ALL") {
        if (wineStockFilter === "IN_STOCK" && w.stockBottles <= w.minStockAlert) return false;
        if (wineStockFilter === "LOW_STOCK" && (w.stockBottles <= 0 || w.stockBottles > w.minStockAlert)) return false;
        if (wineStockFilter === "OUT_OF_STOCK" && w.stockBottles > 0) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (wineSortFilter === "PRICE_ASC") return a.priceXof - b.priceXof;
      if (wineSortFilter === "PRICE_DESC") return b.priceXof - a.priceXof;
      if (wineSortFilter === "STOCK_ASC") return a.stockBottles - b.stockBottles;
      if (wineSortFilter === "STOCK_DESC") return b.stockBottles - a.stockBottles;
      return 0;
    });

  const filteredMeals = searchQuery
    ? meals.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : meals;

  const filteredRentals = rentals.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.specs.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (rentalCategoryFilter !== "ALL" && r.type !== rentalCategoryFilter) return false;
    return true;
  });

  const filteredCatering = cateringFormulas.filter((c) => {
    if (isManager && managerPropertyId && c.propertyId && c.propertyId !== managerPropertyId) return false;
    if (cateringPropertyFilter !== "ALL" && c.propertyId && c.propertyId !== cateringPropertyFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.serviceLevel.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredMutations = mutations.filter((m) => {
    if (isManager && managerPropertyId && m.fromPropertyId !== managerPropertyId && m.toPropertyId !== managerPropertyId) return false;
    if (mutationPropertyFilter !== "ALL" && m.fromPropertyId !== mutationPropertyFilter && m.toPropertyId !== mutationPropertyFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!m.staffName.toLowerCase().includes(q) && !m.reason.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredTreasuryAccounts = treasuryAccounts.filter((acc) => {
    if (isManager && managerPropertyId && acc.propertyId && acc.propertyId !== "ALL" && acc.propertyId !== managerPropertyId) return false;
    if (treasuryPropertyFilter !== "ALL" && acc.propertyId && acc.propertyId !== "ALL" && acc.propertyId !== treasuryPropertyFilter) return false;
    return true;
  });

  const filteredCashTransactions = cashTransactions.filter((tx) => {
    if (isManager && managerPropertyId && tx.propertyId && tx.propertyId !== managerPropertyId) return false;
    if (treasuryPropertyFilter !== "ALL" && tx.propertyId && tx.propertyId !== treasuryPropertyFilter) return false;
    return true;
  });

  const handleOpenFiscalInvoice = (customOrder?: any) => {
    const defaultItems = [
      { name: "Hébergement Suite Royale Bohicon (2 Nuitées)", price: 65000, quantity: 2, taxGroup: "B" as const },
      { name: "Dîner Terroir Béninois & Champagne Moët Brut", price: 65000, quantity: 1, taxGroup: "B" as const },
      { name: "Location Berline VIP avec Chauffeur (1 Jour)", price: 45000, quantity: 1, taxGroup: "B" as const },
    ];

    const items = customOrder?.itemsSummary
      ? [
          {
            name: customOrder.itemsSummary,
            price: customOrder.totalAmountXof || 15000,
            quantity: 1,
            taxGroup: "B" as const,
          },
        ]
      : defaultItems;

    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ifu = "0201910839213";
    const simulatedUid = `FV-${ifu.slice(-6)}-${dateStr}-${randomSuffix}`;
    const simulatedNim = `MCF-BOH-${ifu.slice(0, 4)}-01`;
    const simulatedCodeMECeF = `EMCF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let totalHt = 0;
    let totalVat = 0;
    items.forEach((it: any) => {
      const lineTotal = it.price * it.quantity;
      const ht = Math.round(lineTotal / 1.18);
      const vat = lineTotal - ht;
      totalHt += ht;
      totalVat += vat;
    });
    const totalTtc = totalHt + totalVat;

    const normalizedData: any = {
      uid: simulatedUid,
      nim: simulatedNim,
      ts: now.toISOString(),
      codeMECeF: simulatedCodeMECeF,
      qrCode: `https://facture.dgi.bj/v?ifu=${ifu}&uid=${simulatedUid}&ttc=${totalTtc}`,
      totalHtXof: totalHt,
      totalVatXof: totalVat,
      totalTtcXof: totalTtc,
      taxBreakdown: [
        {
          group: "B",
          groupLabel: "TVA Standard (18%)",
          rate: 0.18,
          taxableAmount: totalHt,
          vatAmount: totalVat,
        },
      ],
      isSimulated: true,
    };

    const invoiceData = {
      reference: customOrder?.orderNumber || `FAC-VIG-${now.getFullYear()}-0089`,
      propertyName: customOrder?.propertyName || "Hôtel Le Vignoble - Bohicon (Siège)",
      propertyCity: "Bohicon / Carrefour Zakpo, Bénin",
      propertyPhone: "+229 97 22 33 44",
      ifu,
      client: {
        name: customOrder?.clientName || "Société Béninoise des Énergies (SBEE)",
        ifu: "3201800192834",
        contact: customOrder?.clientPhone || "+229 97 00 22 33",
        address: "Cotonou / Direction Générale",
      },
      operatorName: activeUser?.fullName || "Marcelin AGBIDINOUKOUN (DAF)",
      items,
      paymentMethod: customOrder?.origin === "SERVEUSE" ? "ESPECES" : "MOMO",
      createdAt: now.toISOString(),
    };

    setActiveFiscalInvoice({ invoiceData, normalizedData });
    setFiscalModalOpen(true);
  };

  const filteredAttendances = attendances.filter((att) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        att.userName.toLowerCase().includes(q) ||
        att.userRole.toLowerCase().includes(q) ||
        (att.notes && att.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (presenceSiteFilter !== "ALL" && att.propertyId !== presenceSiteFilter) return false;
    if (presenceShiftFilter !== "ALL" && att.shift !== presenceShiftFilter) return false;
    if (presenceStatusFilter !== "ALL" && att.status !== presenceStatusFilter) return false;
    return true;
  });

  const filteredStocks = stocks.filter((s) => {
    if (isManager && managerPropertyId && s.propertyId !== managerPropertyId) return false;
    if (stockPropertyFilter !== "ALL" && s.propertyId !== stockPropertyFilter) return false;
    if (stockCategoryFilter !== "ALL" && s.category !== stockCategoryFilter) return false;
    if (stockAlertFilter === "ALERTS_ONLY" && s.currentQuantity > s.alertThreshold) return false;
    if (stockSearchQuery) {
      const q = stockSearchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.sku.toLowerCase().includes(q) ||
        s.propertyName.toLowerCase().includes(q) ||
        s.storageLocation.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalStockValueXof = filteredStocks.reduce((sum, s) => sum + s.currentQuantity * s.unitCostXof, 0);
  const totalStockAlertsCount = filteredStocks.filter((s) => s.currentQuantity <= s.alertThreshold).length;
  const totalStockCriticalCount = filteredStocks.filter((s) => s.currentQuantity <= s.securityThreshold).length;

  const filteredStaffRoles = staffRoleAssignments.filter((sr) => {
    if (isManager && managerPropertyId && sr.propertyId !== managerPropertyId) return false;
    if (rolePropertyFilter !== "ALL" && sr.propertyId !== rolePropertyFilter) return false;
    if (roleCodeFilter !== "ALL" && sr.roleCode !== roleCodeFilter) return false;
    if (roleSearchQuery) {
      const q = roleSearchQuery.toLowerCase();
      const match =
        sr.fullName.toLowerCase().includes(q) ||
        sr.email.toLowerCase().includes(q) ||
        sr.roleName.toLowerCase().includes(q) ||
        sr.propertyName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* =========================================================================
          VIEW 1: VUE D'ENSEMBLE (COCKPIT ANALYTIQUE COINTRAIL-GRADE)
         ========================================================================= */}
      {currentView === "cockpit" && (
        <div className="space-y-6 text-stone-100">
          {/* Top Multi-Angle Filter Bar (À la Cointrail) */}
          <div className="bg-[#0b0f17] border border-[#1a2335] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Angle 1: Établissement Scope */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#d4af37]" /> Établissement :
              </span>
              {[
                { id: "ALL", label: "Consolidé (4 Agences)" },
                { id: "BOH", label: "Bohicon (Siège)" },
                { id: "ABM", label: "Abomey (Cité)" },
                { id: "ABC", label: "Abomey-Calavi" },
                { id: "ZOG", label: "Zogbodomey" },
              ].map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => setAgencyAngle(ag.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    agencyAngle === ag.id
                      ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shadow-sm"
                      : "bg-[#131926] text-stone-400 hover:text-white border border-[#1e273a]"
                  }`}
                >
                  {ag.label}
                </button>
              ))}
            </div>

            {/* Angle 2 & 3: Pôles & Timeframe */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Pôle Selector */}
              <div className="flex items-center gap-1.5 bg-[#131926] border border-[#1e273a] rounded-xl px-2.5 py-1 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" />
                <select
                  value={poleAngle}
                  onChange={(e) => setPoleAngle(e.target.value as any)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#0b0f17]">Tous les Flux & Pôles</option>
                  <option value="ROOMS" className="bg-[#0b0f17]">Hébergement & Suites</option>
                  <option value="FOOD" className="bg-[#0b0f17]">Restauration & Bar</option>
                  <option value="WINE" className="bg-[#0b0f17]">Cave à Vins & Champagnes</option>
                  <option value="RENTAL" className="bg-[#0b0f17]">Location Véhicules VIP</option>
                  <option value="CATERING" className="bg-[#0b0f17]">Service Traiteur & Banquets</option>
                </select>
              </div>

              {/* Timeframe Toggles */}
              <div className="bg-[#131926] border border-[#1e273a] p-1 rounded-xl flex items-center text-xs font-bold">
                {[
                  { id: "1D", label: "1J" },
                  { id: "7D", label: "7J" },
                  { id: "30D", label: "30J" },
                  { id: "1Y", label: "1A" },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id as any)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      timeframe === tf.id
                        ? "bg-[#10b981] text-stone-950 shadow-md font-black"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stat Readouts (Trader-grade KPIs with sparklines & micro deltas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: CA Consolidé */}
            <div className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Volume d&apos;Affaires Consolidé
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +18.4%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                4 850 000 <span className="text-xs text-stone-400 font-sans font-medium">XOF</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-2 flex items-center justify-between">
                <span>RevPAR moyen : <strong className="text-white">38 500 XOF</strong></span>
                <span className="text-[#10b981]">Record 2026</span>
              </div>
            </div>

            {/* KPI 2: Taux d'Occupation */}
            <div className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Taux d&apos;Occupation Global
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +5.2%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                78.2% <span className="text-xs text-stone-400 font-sans font-medium">(39/50 ch.)</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-2 flex items-center justify-between">
                <span>Dossiers actifs : <strong className="text-white">28 réservations</strong></span>
                <span className="text-[#d4af37]">Fluide</span>
              </div>
            </div>

            {/* KPI 3: Dépenses & Sorties */}
            <div className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Dépenses d&apos;Exploitation
                </span>
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> -8.2%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-red-400 tracking-tight">
                1 920 000 <span className="text-xs text-stone-400 font-sans font-medium">XOF</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-2 flex items-center justify-between">
                <span>Marché vivres, gasoil, pressing</span>
                <span className="text-stone-400">Maîtrisé</span>
              </div>
            </div>

            {/* KPI 4: Marge Nette */}
            <div className="bg-[#0e131f] border border-[#1c2638] rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Marge Nette d&apos;Exploitation
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold">
                  EBITDA +60.4%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#10b981] tracking-tight">
                +2 930 000 <span className="text-xs text-stone-400 font-sans font-medium">XOF</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-2 flex items-center justify-between">
                <span>Trésorerie disponible :</span>
                <strong className="text-[#d4af37] font-mono">{totalTreasuryBalance.toLocaleString("fr-FR")} XOF</strong>
              </div>
            </div>
          </div>

          {/* Main 2-Column Cointrail Layout: Wide Analytics Column (Left) + Right Rail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* WIDE ANALYTICS COLUMN (2 COLS) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Composite Area Chart with Mint-Green Fill, Gold Trend Line & Volume Bars */}
              <div className="bg-[#0e131f] border border-[#1c2638] rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">Courbe des Flux Financiers & Volumes</span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-800 text-[10px] font-mono text-stone-300">
                        {agencyAngle === "ALL" ? "Consolidé Bénin" : `Site ${agencyAngle}`}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Recettes directes (ligne menthe), cible RevPAR (courbe or) et barres de volume quotidiennes
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-[#10b981]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Recettes Réalisées
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-[#d4af37]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" /> Cible RevPAR
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-red-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Pics de Charges
                    </span>
                  </div>
                </div>

                {/* SVG Area Chart with Volume Bars (Cointrail-Grade) */}
                <div className="h-72 w-full pt-2">
                  <svg viewBox="0 0 700 250" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="cointrailMintGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="70%" stopColor="#10b981" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#0e131f" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid */}
                    <line x1="40" y1="30" x2="680" y2="30" stroke="#1c2638" strokeDasharray="3 3" />
                    <line x1="40" y1="80" x2="680" y2="80" stroke="#1c2638" strokeDasharray="3 3" />
                    <line x1="40" y1="130" x2="680" y2="130" stroke="#1c2638" strokeDasharray="3 3" />
                    <line x1="40" y1="180" x2="680" y2="180" stroke="#1c2638" />

                    {/* Y Axis text */}
                    <text x="5" y="34" fill="#64748b" fontSize="10" fontFamily="monospace">2.5M</text>
                    <text x="5" y="84" fill="#64748b" fontSize="10" fontFamily="monospace">1.8M</text>
                    <text x="5" y="134" fill="#64748b" fontSize="10" fontFamily="monospace">1.0M</text>
                    <text x="5" y="184" fill="#64748b" fontSize="10" fontFamily="monospace">0.2M</text>

                    {/* Area polygon */}
                    <polygon
                      points="60,150 140,110 220,135 300,75 380,60 460,95 540,45 620,35 660,65 660,180 60,180"
                      fill="url(#cointrailMintGrad)"
                    />

                    {/* Mint Green Line */}
                    <polyline
                      points="60,150 140,110 220,135 300,75 380,60 460,95 540,45 620,35 660,65"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Yellow/Gold Target Line (RevPAR Target) */}
                    <polyline
                      points="60,130 140,120 220,110 300,90 380,85 460,80 540,70 620,60 660,55"
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Red Loss / Peak Expense Marker Points */}
                    <circle cx="220" cy="135" r="4.5" fill="#f43f5e" stroke="#0e131f" strokeWidth="2" />
                    <circle cx="460" cy="95" r="4.5" fill="#f43f5e" stroke="#0e131f" strokeWidth="2" />

                    {/* Volume bars below line 180 */}
                    {[
                      { x: 60, h: 25, label: "Lun", tx: "24" },
                      { x: 140, h: 35, label: "Mar", tx: "38" },
                      { x: 220, h: 30, label: "Mer", tx: "32" },
                      { x: 300, h: 48, label: "Jeu", tx: "54" },
                      { x: 380, h: 55, label: "Ven", tx: "68" },
                      { x: 460, h: 40, label: "Sam", tx: "45" },
                      { x: 540, h: 60, label: "Dim", tx: "72" },
                      { x: 620, h: 62, label: "Auj", tx: "80" },
                    ].map((vb, i) => (
                      <g key={i}>
                        {/* Sub-bar */}
                        <rect
                          x={vb.x - 12}
                          y={240 - vb.h}
                          width="24"
                          height={vb.h}
                          rx="3"
                          fill="#1e293b"
                          className="hover:fill-[#10b981] transition-colors cursor-pointer"
                        />
                        <text
                          x={vb.x}
                          y="248"
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {vb.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-[#1c2638] mt-2">
                  <span className="font-mono text-[11px]">80 transactions directes validées aujourd&apos;hui</span>
                  <span className="text-[#10b981] font-semibold">Tendance haussière confirmée (+18.4%)</span>
                </div>
              </div>

              {/* Fund-Flow / Performance Bar Chart across the 4 Establishments */}
              <div className="bg-[#0e131f] border border-[#1c2638] rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      Répartition des Flux & Performance par Établissement
                    </h3>
                    <p className="text-xs text-stone-400">
                      Comparaison simultanée des 4 hôtels : Chiffre d&apos;affaires, occupation et chambres actives
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#d4af37] bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                    4 Sites Actifs
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {[
                    {
                      code: "BOH",
                      name: "Bohicon (Siège Opérationnel)",
                      revenue: "1 850 000 XOF",
                      pct: 83,
                      occupied: "15/18 ch.",
                      color: "bg-[#10b981]",
                    },
                    {
                      code: "ABM",
                      name: "Abomey (Cité Royale)",
                      revenue: "1 120 000 XOF",
                      pct: 75,
                      occupied: "9/12 ch.",
                      color: "bg-[#d4af37]",
                    },
                    {
                      code: "ABC",
                      name: "Abomey-Calavi (Akassato)",
                      revenue: "1 280 000 XOF",
                      pct: 83,
                      occupied: "10/12 ch.",
                      color: "bg-blue-500",
                    },
                    {
                      code: "ZOG",
                      name: "Zogbodomey (Relais)",
                      revenue: "600 000 XOF",
                      pct: 63,
                      occupied: "5/8 ch.",
                      color: "bg-purple-500",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-[#090d14] border border-[#1a2335]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-200 text-[10px] font-mono font-bold">
                            {item.code}
                          </span>
                          <span className="font-bold text-white">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-stone-400">{item.occupied}</span>
                          <span className="font-bold text-[#10b981]">{item.revenue}</span>
                          <span className="font-bold text-white bg-stone-800 px-2 py-0.5 rounded text-[10px]">
                            {item.pct}% occ.
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#1c2638] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT RAIL (1 COL) — Live VIP Signal Feed & Economic Calendar */}
            <div className="space-y-6">
              {/* Whale Signals / Live Operations Feed */}
              <div className="bg-[#0e131f] border border-[#1c2638] rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#d4af37]" />
                    <span className="font-bold text-white text-sm">Flux VIP & Signaux Critiques</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {[
                    { id: "ALL", label: "Tous" },
                    { id: "VIP", label: "Suites VIP" },
                    { id: "CAVE", label: "Cave à Vin" },
                    { id: "TRAITEUR", label: "Traiteur" },
                    { id: "ALERTS", label: "Alertes" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setSignalFilter(chip.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        signalFilter === chip.id
                          ? "bg-[#10b981] text-stone-950"
                          : "bg-[#131926] text-stone-400 hover:text-white border border-[#1e273a]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Feed Items */}
                <div className="space-y-3 pt-1 text-xs">
                  <div className="p-3 rounded-2xl bg-[#090d14] border border-[#1c2638] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        CHECK-IN VIP
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">14:32</span>
                    </div>
                    <div className="font-bold text-white">M. Mathieu Dossou • Suite Royale</div>
                    <div className="text-[11px] text-stone-400">Bohicon (Ch. 101) • 85 000 XOF réglé KkiaPay</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#090d14] border border-[#1c2638] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold">
                        COMMANDE CAVE
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">13:10</span>
                    </div>
                    <div className="font-bold text-white">2x Dom Pérignon Vintage 2013</div>
                    <div className="text-[11px] text-stone-400">Total : 420 000 XOF • Sommelier Bohicon</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#090d14] border border-[#1c2638] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                        DEVIS TRAITEUR
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">11:45</span>
                    </div>
                    <div className="font-bold text-white">Banquet Royal d&apos;Abomey 80 pers.</div>
                    <div className="text-[11px] text-stone-400">Acompte 350 000 XOF encaissé BOA Bénin</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#090d14] border border-red-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                        ALERTE STOCK
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">09:15</span>
                    </div>
                    <div className="font-bold text-white">Chablis Premier Cru sous le seuil</div>
                    <div className="text-[11px] text-stone-400">3 bouteilles restantes à Abomey (Seuil: 5)</div>
                  </div>
                </div>
              </div>

              {/* Economic Operational Calendar List (Cointrail-Grade) */}
              <div className="bg-[#0e131f] border border-[#1c2638] rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#10b981]" />
                  <span className="font-bold text-white text-sm">Calendrier Opérationnel du Domaine</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-[#090d14] border border-[#1c2638] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Clôture Journalière (Night Audit)</div>
                      <div className="text-[11px] text-stone-400">Automatisation SYSCOHADA</div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-stone-800 text-stone-300 font-mono text-[10px] font-bold">
                      23h30
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#090d14] border border-[#1c2638] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Arrivée Délégation UAC</div>
                      <div className="text-[11px] text-stone-400">6 Suites à Abomey-Calavi</div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-stone-800 text-stone-300 font-mono text-[10px] font-bold">
                      Demain
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#090d14] border border-[#1c2638] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Réception Gala 150 convives</div>
                      <div className="text-[11px] text-stone-400">Buffet Terroir & Chaises Napoléon</div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-[#d4af37]/20 text-[#d4af37] font-mono text-[10px] font-bold">
                      Samedi
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Treasury Card */}
              <div className="bg-gradient-to-br from-[#0e131f] to-[#121c2d] border border-[#1c2638] rounded-3xl p-5 shadow-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Avoirs Liquides Consolidés
                </span>
                <div className="text-2xl font-black font-mono text-[#d4af37]">
                  {totalTreasuryBalance.toLocaleString("fr-FR")} XOF
                </div>
                <div className="text-xs text-stone-400 space-y-1 pt-2 border-t border-[#1c2638]">
                  <div className="flex justify-between">
                    <span>BOA Bénin :</span>
                    <span className="font-mono text-white">8 450 000 XOF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Caisse Centrale :</span>
                    <span className="font-mono text-white">1 250 000 XOF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KkiaPay Mobile Money :</span>
                    <span className="font-mono text-[#10b981]">2 750 000 XOF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CHAMBRES (CRUD COMPLET AVEC PHOTOS & PRIX)
         ========================================================================= */}
      {currentView === "chambres" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Gestion des Chambres & Suites ({rooms.length})
              </h2>
              <p className="text-xs text-stone-500">
                Filtrez par agence, statut (libres, occupées, réservées), type, ajustez les prix par nuit et mettez à jour les photos.
              </p>
            </div>
            <button
              onClick={() => {
                const defaultProp = isManager && managerPropertyId
                  ? SEED_PROPERTIES.find((p) => p.id === managerPropertyId) || SEED_PROPERTIES[0]
                  : SEED_PROPERTIES[0];
                setEditingRoom(null);
                setRoomForm({
                  number: `${rooms.length + 101}`,
                  name: "Nouvelle Suite",
                  propertyId: defaultProp.id,
                  type: "SUPERIEURE",
                  basePriceXof: 45000,
                  capacity: 2,
                  amenities: ["Climatisation", "Wi-Fi Dédié"],
                  status: "DISPONIBLE",
                  imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                });
                setRoomModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une Chambre</span>
            </button>
          </div>

          {/* Top Filter Toolbar for Chambres */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filter 1: Agence */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-[#184f28]" /> Établissement / Agence
                </label>
                <select
                  value={roomAgencyFilter}
                  onChange={(e) => setRoomAgencyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28]"
                >
                  <option value="ALL">Toutes les Agences (Consolidé)</option>
                  <option value="prop-bohicon-001">Hôtel Le Vignoble - Bohicon (Siège)</option>
                  <option value="prop-abomey-002">Hôtel Le Vignoble - Abomey (Cité)</option>
                  <option value="prop-calavi-003">Hôtel Le Vignoble - Abomey-Calavi</option>
                  <option value="prop-zogbo-004">Hôtel Le Vignoble - Zogbodomey</option>
                </select>
              </div>

              {/* Filter 2: Statut de la Chambre */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#184f28]" /> Statut d&apos;Occupation
                </label>
                <select
                  value={roomStatusFilter}
                  onChange={(e) => setRoomStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28]"
                >
                  <option value="ALL">Tous les Statuts</option>
                  <option value="DISPONIBLE">🟢 Libres / Disponibles</option>
                  <option value="OCCUPEE">🟠 Occupées</option>
                  <option value="RESERVEE">🔵 Réservées</option>
                  <option value="NETTOYAGE">🟣 En Nettoyage</option>
                  <option value="MAINTENANCE">⚪ En Maintenance</option>
                </select>
              </div>

              {/* Filter 3: Catégorie / Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-[#184f28]" /> Gamme de Chambre
                </label>
                <select
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28]"
                >
                  <option value="ALL">Tous les Types</option>
                  <option value="STANDARD">Chambre Standard Confort</option>
                  <option value="SUPERIEURE">Suite Supérieure</option>
                  <option value="SUITE_ROYALE">Suite Royale Le Vignoble</option>
                  <option value="PAVILLON">Pavillon VIP & Jardin</option>
                </select>
              </div>

              {/* Filter 4: Recherche textuelle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-[#184f28]" /> Recherche Rapide
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="N° ou nom de chambre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#184f28]"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Quick KPI Stat Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
                Aperçu instantané :
              </span>
              <button
                onClick={() => setRoomStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roomStatusFilter === "ALL"
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Total : {rooms.length}
              </button>
              <button
                onClick={() => setRoomStatusFilter("DISPONIBLE")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roomStatusFilter === "DISPONIBLE"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                🟢 Libres : {rooms.filter((r) => r.status === "DISPONIBLE").length}
              </button>
              <button
                onClick={() => setRoomStatusFilter("OCCUPEE")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roomStatusFilter === "OCCUPEE"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                🟠 Occupées : {rooms.filter((r) => r.status === "OCCUPEE").length}
              </button>
              <button
                onClick={() => setRoomStatusFilter("RESERVEE")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roomStatusFilter === "RESERVEE"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                🔵 Réservées : {rooms.filter((r) => r.status === "RESERVEE").length}
              </button>
              <button
                onClick={() => setRoomStatusFilter("NETTOYAGE")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roomStatusFilter === "NETTOYAGE"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                🟣 Nettoyage : {rooms.filter((r) => r.status === "NETTOYAGE").length}
              </button>
              <button
                onClick={() => setRoomStatusFilter("MAINTENANCE")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roomStatusFilter === "MAINTENANCE"
                    ? "bg-stone-700 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                ⚪ Maintenance : {rooms.filter((r) => r.status === "MAINTENANCE").length}
              </button>
            </div>
          </div>

          {/* Grid of Rooms with Photo */}
          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <Bed className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">Aucune chambre ne correspond à ces filtres</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Modifiez l&apos;agence sélectionnée, le statut ou réinitialisez les critères de recherche pour afficher les hébergements.
              </p>
              <button
                onClick={() => {
                  setRoomAgencyFilter("ALL");
                  setRoomStatusFilter("ALL");
                  setRoomTypeFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#184f28] transition-all group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={room.imageUrl}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                          Chambre N° {room.number}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                            room.status === "DISPONIBLE"
                              ? "bg-emerald-600/90 text-white"
                              : room.status === "OCCUPEE"
                              ? "bg-amber-600/90 text-white"
                              : room.status === "RESERVEE"
                              ? "bg-blue-600/90 text-white"
                              : room.status === "NETTOYAGE"
                              ? "bg-purple-600/90 text-white"
                              : "bg-stone-800/90 text-stone-200"
                          }`}
                        >
                          {room.status === "DISPONIBLE"
                            ? "Libre / Dispo"
                            : room.status === "OCCUPEE"
                            ? "Occupée"
                            : room.status === "RESERVEE"
                            ? "Réservée"
                            : room.status === "NETTOYAGE"
                            ? "Nettoyage"
                            : "Maintenance"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          {room.propertyName}
                        </span>
                        <h4 className="text-base font-bold text-stone-900">{room.name}</h4>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs text-stone-500">Tarif / Nuitée :</span>
                        <span className="text-lg font-black text-[#184f28]">
                          {room.basePriceXof.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-medium py-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                          <Bed className="w-3.5 h-3.5 text-[#184f28]" />
                          {room.bedConfiguration || `${room.bedPlaces || room.capacity} places de lit`}
                        </span>
                        <span>•</span>
                        <span>👥 Capacité : {room.capacity} pers. max</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
                        {room.amenities.map((am, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setEditingRoom(room);
                        setRoomForm(room);
                        setRoomModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    {!isManager && (
                      <button
                        onClick={() => {
                          if (confirm("Supprimer cette chambre ?")) {
                            setRooms((prev) => prev.filter((r) => r.id !== room.id));
                          }
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                        title="Supprimer la chambre (Promoteur/DAF)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: CAVE A VIN & STOCKS
         ========================================================================= */}
      {currentView === "cave" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Cave à Vin, Champagnes & Gestion des Stocks ({wines.length} Références)
              </h2>
              <p className="text-xs text-stone-500">
                Filtrez par catégorie, tranche de prix ou état de stock. Réapprovisionnez en un clic (+6, +12, +24) et ajoutez de nouvelles bouteilles avec photos.
              </p>
            </div>
            {(!isManager || isBohiconManager) && (
              <button
                onClick={() => {
                  setEditingWine(null);
                  setWineForm({
                    name: "",
                    category: "ROUGE",
                    origin: "France / Terroir",
                    millesime: "2020",
                    priceXof: 35000,
                    stockBottles: 12,
                    minStockAlert: 5,
                    pairings: "Viandes braisées, fromages",
                    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
                  });
                  setWineModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8c101c] hover:bg-[#6e0d16] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Cru / Boisson</span>
              </button>
            )}
          </div>

          {isManager && !isBohiconManager && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Boutique Centrale & Cave de Bohicon</p>
                <p className="text-amber-700 mt-0.5">
                  La cave à vin physique et boutique centrale est hébergée au siège de Bohicon. La gestion et l&apos;approvisionnement des stocks sont administrés par le Gérant de Bohicon et la Direction Générale. Votre site a accès au catalogue pour le room service et le restaurant.
                </p>
              </div>
            </div>
          )}

          {/* Top Filter Toolbar for Cave à Vin */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filter 1: Catégorie */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Wine className="w-3.5 h-3.5 text-[#8c101c]" /> Catégorie de Boisson
                </label>
                <select
                  value={wineCategoryFilter}
                  onChange={(e) => setWineCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#8c101c]"
                >
                  <option value="ALL">Toutes les Catégories</option>
                  <option value="ROUGE">🍷 Vins Rouges de Garde</option>
                  <option value="CHAMPAGNE">🍾 Champagnes de Prestige</option>
                  <option value="BLANC_ROSE">🥂 Vins Blancs & Rosés</option>
                  <option value="SPIRITUEUX">🥃 Spiritueux & Digestifs</option>
                  <option value="BOISSON_TERROIR">🌴 Nectars & Terroir Béninois</option>
                </select>
              </div>

              {/* Filter 2: Tranche de Prix */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#8c101c]" /> Tranche de Prix
                </label>
                <select
                  value={winePriceFilter}
                  onChange={(e) => setWinePriceFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#8c101c]"
                >
                  <option value="ALL">Tous les Prix</option>
                  <option value="LESS_25K">&lt; 25 000 XOF (Entrée de cave)</option>
                  <option value="25K_75K">25 000 à 75 000 XOF (Grands Crus)</option>
                  <option value="MORE_75K">&gt; 75 000 XOF (Millésimes & Prestige)</option>
                </select>
              </div>

              {/* Filter 3: État des Stocks */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#8c101c]" /> État des Stocks
                </label>
                <select
                  value={wineStockFilter}
                  onChange={(e) => setWineStockFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#8c101c]"
                >
                  <option value="ALL">Tous les Stocks</option>
                  <option value="IN_STOCK">🟢 En Stock Suffisant</option>
                  <option value="LOW_STOCK">⚠️ Alerte Réassort Faible</option>
                  <option value="OUT_OF_STOCK">🔴 Rupture de Stock (0)</option>
                </select>
              </div>

              {/* Filter 4: Tri */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#8c101c]" /> Tri & Classement
                </label>
                <select
                  value={wineSortFilter}
                  onChange={(e) => setWineSortFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#8c101c]"
                >
                  <option value="DEFAULT">Tri par défaut</option>
                  <option value="PRICE_ASC">Prix : Moins cher au plus cher</option>
                  <option value="PRICE_DESC">Prix : Plus cher au moins cher</option>
                  <option value="STOCK_ASC">Stock : Faible au plus élevé</option>
                  <option value="STOCK_DESC">Stock : Élevé au plus faible</option>
                </select>
              </div>
            </div>

            {/* Quick KPI Stat Chips for Cave */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
                Bilan Cave :
              </span>
              <span className="px-3 py-1 rounded-lg bg-stone-100 text-stone-700 font-semibold">
                Références : {wines.length}
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#8c101c]/10 text-[#8c101c] font-semibold">
                Bouteilles en cave : {wines.reduce((acc, curr) => acc + curr.stockBottles, 0)}
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold">
                Valeur stock :{" "}
                {wines
                  .reduce((acc, curr) => acc + curr.priceXof * curr.stockBottles, 0)
                  .toLocaleString("fr-FR")}{" "}
                XOF
              </span>
              <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold">
                Alertes réassort : {wines.filter((w) => w.stockBottles <= w.minStockAlert).length}
              </span>
            </div>
          </div>

          {/* Grid of Wines */}
          {filteredWines.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <Wine className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">Aucune référence de vin ou boisson trouvée</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Ajustez vos filtres de prix, de catégorie ou d&apos;état de stock pour afficher les bouteilles.
              </p>
              <button
                onClick={() => {
                  setWineCategoryFilter("ALL");
                  setWinePriceFilter("ALL");
                  setWineStockFilter("ALL");
                  setWineSortFilter("DEFAULT");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Réinitialiser les filtres de la cave
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWines.map((wine) => (
                <div
                  key={wine.id}
                  className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#8c101c] transition-all group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={wine.imageUrl}
                        alt={wine.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                          {wine.category === "ROUGE"
                            ? "Vin Rouge"
                            : wine.category === "CHAMPAGNE"
                            ? "Champagne"
                            : wine.category === "BLANC_ROSE"
                            ? "Blanc / Rosé"
                            : wine.category === "SPIRITUEUX"
                            ? "Spiritueux"
                            : "Terroir"}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md ${
                            wine.stockBottles === 0
                              ? "bg-red-700 text-white font-black"
                              : wine.stockBottles <= wine.minStockAlert
                              ? "bg-red-600 text-white animate-pulse"
                              : "bg-emerald-600/90 text-white"
                          }`}
                        >
                          {wine.stockBottles === 0 ? "RUPTURE" : `${wine.stockBottles} bouteilles`}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>{wine.origin}</span>
                          <span className="font-semibold text-stone-600">Millésime {wine.millesime}</span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900 mt-1">{wine.name}</h4>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs text-stone-500">Prix Bouteille :</span>
                        <span className="text-lg font-black text-[#8c101c]">
                          {wine.priceXof.toLocaleString("fr-FR")} XOF
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 text-[11px] text-stone-600">
                        <strong>Accords :</strong> {wine.pairings}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                      <span>Réapprovisionner Stock :</span>
                      <div className="flex gap-1.5">
                        {[6, 12, 24].map((delta) => (
                          <button
                            key={delta}
                            onClick={() => {
                              setWines((prev) =>
                                prev.map((w) =>
                                  w.id === wine.id ? { ...w, stockBottles: w.stockBottles + delta } : w
                                )
                              );
                            }}
                            className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-[11px] hover:bg-[#8c101c] hover:text-white transition-colors"
                          >
                            +{delta}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/60">
                      <button
                        onClick={() => {
                          setEditingWine(wine);
                          setWineForm(wine);
                          setWineModalOpen(true);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Supprimer cette bouteille ?")) {
                            setWines((prev) => prev.filter((w) => w.id !== wine.id));
                          }
                        }}
                        className="p-1.5 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                        title="Supprimer le produit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 4: REPAS & CARTE
         ========================================================================= */}
      {currentView === "repas" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Carte du Restaurant & Accompagnements ({meals.length} Mets)
              </h2>
              <p className="text-xs text-stone-500">
                Créez les plats traditionnels béninois, les accompagnements (Amiwo, Djenkoumé, Alloco...), fixez les prix et photos.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMeal(null);
                setMealForm({
                  name: "",
                  category: "PLAT_TRADITIONNEL",
                  priceXof: 7500,
                  prepTimeMinutes: 20,
                  accompaniments: ["Alloco", "Piment frais"],
                  description: "",
                  available: true,
                  imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
                });
                setMealModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Plat / Accompagnement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-600 transition-all group"
              >
                <div>
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                        {meal.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-md text-white px-2 py-1 rounded-full text-[10px] font-semibold">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{meal.prepTimeMinutes} min</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h4 className="text-base font-bold text-stone-900">{meal.name}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {meal.description}
                    </p>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs text-stone-500">Prix Public :</span>
                      <span className="text-lg font-black text-amber-700">
                        {meal.priceXof.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                        Accompagnements :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {meal.accompaniments.map((acc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-semibold border border-amber-200/60"
                          >
                            {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingMeal(meal);
                      setMealForm(meal);
                      setMealModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier Plat</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer ce plat ?")) {
                        setMeals((prev) => prev.filter((m) => m.id !== meal.id));
                      }
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                    title="Supprimer le plat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: LOCATION (VEHICULES, MATERIEL, SALLES & HANGARS)
         ========================================================================= */}
      {currentView === "location" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Location d&apos;Équipements, Véhicules VIP & Salles ({rentals.length} Articles)
              </h2>
              <p className="text-xs text-stone-500">
                Voitures VIP, chafing dishes, couverts dorés, tables banquet, chaises, salles de fête, salles de réunion, salles d&apos;atelier et bâches/hangars.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRental(null);
                setRentalForm({
                  name: "",
                  type: "VOITURES",
                  dailyPriceXof: 75000,
                  depositXof: 100000,
                  totalQuantity: 1,
                  availableQuantity: 1,
                  specs: "",
                  imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
                });
                setRentalModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Article / Salle</span>
            </button>
          </div>

          {/* Top Category Filter Pills for Location */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Filtrer par Type d&apos;Équipement ou Espace :
              </span>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: "ALL", label: "Toutes Catégories", count: rentals.length },
                { id: "VOITURES", label: "🚗 Voitures VIP", count: rentals.filter((r) => r.type === "VOITURES").length },
                { id: "DISH", label: "🍲 Dish & Chauffe-plats", count: rentals.filter((r) => r.type === "DISH").length },
                { id: "COUVERTS", label: "🍴 Couverts & Verrerie", count: rentals.filter((r) => r.type === "COUVERTS").length },
                { id: "TABLES", label: "🪵 Tables Banquet", count: rentals.filter((r) => r.type === "TABLES").length },
                { id: "CHAISES", label: "🪑 Chaises Napoléon", count: rentals.filter((r) => r.type === "CHAISES").length },
                { id: "SALLES_FETE", label: "🎉 Salles de Fête", count: rentals.filter((r) => r.type === "SALLES_FETE").length },
                { id: "SALLE_REUNION", label: "💼 Salles de Réunion", count: rentals.filter((r) => r.type === "SALLE_REUNION").length },
                { id: "SALLE_ATELIER", label: "🎓 Salles d'Atelier", count: rentals.filter((r) => r.type === "SALLE_ATELIER").length },
                { id: "BACHE_HANGAR", label: "🎪 Bâches & Hangars", count: rentals.filter((r) => r.type === "BACHE_HANGAR").length },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setRentalCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    rentalCategoryFilter === cat.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      rentalCategoryFilter === cat.id
                        ? "bg-blue-700 text-blue-100"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Rentals */}
          {filteredRentals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <Layers className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">Aucun matériel ou espace dans cette catégorie</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Sélectionnez une autre catégorie ou cliquez ci-dessous pour afficher l&apos;intégralité de l&apos;inventaire.
              </p>
              <button
                onClick={() => {
                  setRentalCategoryFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Afficher tous les articles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRentals.map((rental) => {
                const categoryLabels: Record<RentalCategory, { label: string; color: string }> = {
                  VOITURES: { label: "Voiture VIP", color: "bg-blue-600" },
                  DISH: { label: "Chafing Dish", color: "bg-amber-600" },
                  COUVERTS: { label: "Couverts & Verrerie", color: "bg-emerald-600" },
                  TABLES: { label: "Table Banquet", color: "bg-indigo-600" },
                  CHAISES: { label: "Chaise Napoléon", color: "bg-purple-600" },
                  SALLES_FETE: { label: "Salle de Fête", color: "bg-rose-600" },
                  SALLE_REUNION: { label: "Salle de Réunion", color: "bg-teal-600" },
                  SALLE_ATELIER: { label: "Salle d'Atelier", color: "bg-sky-600" },
                  BACHE_HANGAR: { label: "Bâche & Hangar", color: "bg-stone-700" },
                };
                const catMeta = categoryLabels[rental.type] || { label: rental.type, color: "bg-stone-700" };

                return (
                  <div
                    key={rental.id}
                    className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-600 transition-all group"
                  >
                    <div>
                      <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                        <img
                          src={rental.imageUrl}
                          alt={rental.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${catMeta.color}/90`}
                          >
                            {catMeta.label}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full bg-stone-900/80 text-white text-[10px] font-bold backdrop-blur-md">
                            {rental.availableQuantity} / {rental.totalQuantity} dispo
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h4 className="text-base font-bold text-stone-900">{rental.name}</h4>
                        <p className="text-xs text-stone-500 line-clamp-2">{rental.specs}</p>

                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-xs text-stone-500">Tarif Journalier :</span>
                          <span className="text-lg font-black text-blue-600">
                            {rental.dailyPriceXof.toLocaleString("fr-FR")} XOF
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                          <span>Caution requise :</span>
                          <span className="font-semibold text-stone-800">
                            {rental.depositXof.toLocaleString("fr-FR")} XOF
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setEditingRental(rental);
                          setRentalForm(rental);
                          setRentalModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Supprimer cette location ?")) {
                            setRentals((prev) => prev.filter((r) => r.id !== rental.id));
                          }
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                        title="Supprimer la location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 6: TRAITEUR
         ========================================================================= */}
      {currentView === "traiteur" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Service Traiteur & Banquets Clé en Main ({cateringFormulas.length})
              </h2>
              <p className="text-xs text-stone-500">
                Configurez les forfaits de banquets, mariages et galas avec prix par personne et photos.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCatering(null);
                setCateringForm({
                  name: "",
                  pricePerPersonXof: 15000,
                  minGuests: 30,
                  inclusions: ["Cocktail d'accueil", "Entrée", "Plat principal", "Dessert"],
                  serviceLevel: "Personnel en tenue, chauffe-plats et nappage inclus",
                  imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
                });
                setCateringModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Forfait Traiteur</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cateringFormulas.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-purple-600 transition-all group"
              >
                <div>
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                        Dès {cat.minGuests} convives
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h4 className="text-base font-bold text-stone-900">{cat.name}</h4>
                    <p className="text-xs text-stone-500">{cat.serviceLevel}</p>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs text-stone-500">Prix / Convive :</span>
                      <span className="text-lg font-black text-purple-600">
                        {cat.pricePerPersonXof.toLocaleString("fr-FR")} XOF
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                        Mets & Inclusions :
                      </span>
                      <ul className="space-y-1 text-[11px] text-stone-600">
                        {cat.inclusions.map((inc, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingCatering(cat);
                      setCateringForm(cat);
                      setCateringModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer cette formule ?")) {
                        setCateringFormulas((prev) => prev.filter((c) => c.id !== cat.id));
                      }
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                    title="Supprimer la formule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 7: PERSONNEL (20 COMPTES)
         ========================================================================= */}
      {currentView === "personnel" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Gestion des Collaborateurs & Accès RBAC ({staffList.length} Comptes)
              </h2>
              <p className="text-xs text-stone-500">
                Ajoutez un collaborateur, modifiez son agence ou son rôle, gérez ses remises et enlevez des accès.
              </p>
            </div>
            <button
              onClick={() => {
                const defaultProp = isManager && managerPropertyId
                  ? SEED_PROPERTIES.find((p) => p.id === managerPropertyId) || SEED_PROPERTIES[0]
                  : SEED_PROPERTIES[0];
                setEditingStaff(null);
                setStaffForm({
                  fullName: "",
                  email: "",
                  roleName: "Réceptionniste",
                  roleCode: "RECEPTIONIST",
                  propertyName: defaultProp.name,
                  propertyId: defaultProp.id,
                  maxDiscount: "10",
                  phone: "+229 97 00 00 00",
                  status: "ACTIF",
                  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                });
                setStaffModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Collaborateur</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 uppercase tracking-wider text-[11px] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Collaborateur</th>
                    <th className="py-3 px-4">Rôle & Attribution</th>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Plafond Remise</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {staffList.map((stf) => (
                    <tr key={stf.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={stf.avatarUrl}
                            alt={stf.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-stone-200"
                          />
                          <div>
                            <div className="font-bold text-stone-900 text-sm">{stf.fullName}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{stf.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-semibold text-[10px]">
                          {stf.roleName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-medium">
                        {stf.propertyName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#184f28]">
                        {stf.maxDiscount}% max
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {stf.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingStaff(stf);
                              setStaffForm(stf);
                              setStaffModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                          >
                            Modifier
                          </button>
                          {!isManager && (
                            <button
                              onClick={() => {
                                if (confirm("Enlever ce collaborateur et révoquer ses accès ?")) {
                                  setStaffList((prev) => prev.filter((s) => s.id !== stf.id));
                                }
                              }}
                              className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                              title="Enlever le collaborateur (Promoteur/DAF)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 7b: PERMANENCE & PRESENCE (ROTATIONS, POINTAGES, RETARDS, ABSENCES)
         ========================================================================= */}
      {currentView === "presence" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Permanence, Présences & Rotations du Personnel ({attendances.length} Collaborateurs)
              </h2>
              <p className="text-xs text-stone-500">
                Contrôle en direct des pointages par agence, suivi automatique des retards et absences, planification des permanences & gardes de nuit.
              </p>
            </div>
            <button
              onClick={() => {
                setDutyForm({
                  title: "",
                  propertyId: "prop-bohicon-001",
                  shift: "NUIT",
                  date: new Date().toISOString().split("T")[0],
                  assignedStaff: [],
                  instructions: "",
                  status: "PLANIFIE",
                });
                setDutyModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Planifier une Permanence / Garde</span>
            </button>
          </div>

          {/* Top Filter Toolbar for Permanence & Présence */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filter 1: Établissement / Site */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-[#184f28]" /> Établissement / Site
                </label>
                <select
                  value={presenceSiteFilter}
                  onChange={(e) => setPresenceSiteFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28]"
                >
                  <option value="ALL">Tous les Établissements (Consolidé)</option>
                  <option value="prop-bohicon-001">Hôtel Le Vignoble - Bohicon (Siège)</option>
                  <option value="prop-abomey-002">Hôtel Le Vignoble - Abomey (Cité)</option>
                  <option value="prop-calavi-003">Hôtel Le Vignoble - Abomey-Calavi</option>
                  <option value="prop-zogbo-004">Hôtel Le Vignoble - Zogbodomey</option>
                </select>
              </div>

              {/* Filter 2: Quart / Rotation */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#184f28]" /> Quart / Rotation
                </label>
                <select
                  value={presenceShiftFilter}
                  onChange={(e) => setPresenceShiftFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28]"
                >
                  <option value="ALL">Toutes les Rotations</option>
                  <option value="MATIN">🌅 Quart Matin (07h00 - 15h00)</option>
                  <option value="SOIR">🌇 Quart Soir (15h00 - 23h00)</option>
                  <option value="NUIT">🌙 Garde de Nuit (23h00 - 07h00)</option>
                  <option value="ASTREINTE">🚨 Astreinte & Urgence (24h/24)</option>
                </select>
              </div>

              {/* Filter 3: Statut de Présence */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#184f28]" /> Statut de Pointage
                </label>
                <select
                  value={presenceStatusFilter}
                  onChange={(e) => setPresenceStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28]"
                >
                  <option value="ALL">Tous les Statuts</option>
                  <option value="PRESENT">🟢 Présent à l&apos;heure</option>
                  <option value="RETARD">🟠 Retard constaté</option>
                  <option value="ABSENT_JUSTIFIE">🔵 Absence justifiée (Mission / Maladie)</option>
                  <option value="ABSENT_INJUSTIFIE">🔴 Absence non justifiée</option>
                  <option value="EN_GARDE">🟣 En garde / Permanence active</option>
                  <option value="CONGE">⚪ Congé autorisé</option>
                </select>
              </div>

              {/* Filter 4: Recherche textuelle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-[#184f28]" /> Collaborateur / Rôle
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom, rôle ou observation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#184f28]"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Quick KPI Stat Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1">
                Bilan du Jour :
              </span>
              <button
                onClick={() => setPresenceStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  presenceStatusFilter === "ALL"
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Total Effectif : {attendances.length}
              </button>
              <button
                onClick={() => setPresenceStatusFilter("PRESENT")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  presenceStatusFilter === "PRESENT"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                🟢 Présents : {attendances.filter((a) => a.status === "PRESENT").length}
              </button>
              <button
                onClick={() => setPresenceStatusFilter("RETARD")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  presenceStatusFilter === "RETARD"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                🟠 Retards : {attendances.filter((a) => a.status === "RETARD").length}
              </button>
              <button
                onClick={() => setPresenceStatusFilter("ABSENT_JUSTIFIE")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  presenceStatusFilter === "ABSENT_JUSTIFIE"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                🔵 Absences Justifiées : {attendances.filter((a) => a.status === "ABSENT_JUSTIFIE").length}
              </button>
              <button
                onClick={() => setPresenceStatusFilter("EN_GARDE")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  presenceStatusFilter === "EN_GARDE"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                🟣 De Garde : {attendances.filter((a) => a.status === "EN_GARDE").length}
              </button>
              <button
                onClick={() => setPresenceStatusFilter("CONGE")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  presenceStatusFilter === "CONGE"
                    ? "bg-stone-700 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                ⚪ En Congé : {attendances.filter((a) => a.status === "CONGE").length}
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Taux de Ponctualité</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {Math.round(
                  (attendances.filter((a) => a.status === "PRESENT").length / attendances.length) * 100
                )}%
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                {attendances.filter((a) => a.status === "PRESENT").length} pointages à l&apos;heure
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Retards Cumulés</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                {attendances
                  .filter((a) => a.status === "RETARD")
                  .reduce((acc, curr) => acc + (curr.delayMinutes || 0), 0)}{" "}
                <span className="text-xs font-semibold text-stone-500">minutes</span>
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">
                {attendances.filter((a) => a.status === "RETARD").length} collaborateurs en retard
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Absences & Missions</span>
                <AlertTriangle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-600">
                {attendances.filter((a) => a.status.includes("ABSENT") || a.status === "CONGE").length}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                1 mission officielle, 1 congé annuel
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Permanences Planifiées</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-600">
                {dutyRosters.length}{" "}
                <span className="text-xs font-semibold text-stone-500">créneaux</span>
              </div>
              <div className="text-[11px] text-purple-700 font-semibold mt-1">
                Garde nuit Bohicon, Soir Abomey, Calavi
              </div>
            </div>
          </div>

          {/* Section 1: Tableau des Pointages & Présences en direct */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Registre des Pointages & Présences en Direct
                </h3>
                <p className="text-xs text-stone-500">
                  Statut d&apos;arrivée et d&apos;activité des équipes pour la journée en cours
                </p>
              </div>
              <span className="text-xs font-mono text-stone-400 bg-stone-100 px-2.5 py-1 rounded-lg">
                Mise à jour temps réel • {new Date().toLocaleDateString("fr-FR")}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 uppercase tracking-wider text-[11px] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Collaborateur</th>
                    <th className="py-3 px-4">Site / Agence</th>
                    <th className="py-3 px-4">Quart</th>
                    <th className="py-3 px-4">Pointage</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Observations</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAttendances.map((att) => (
                    <tr key={att.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#184f28]/10 text-[#184f28] font-black text-xs flex items-center justify-center">
                            {att.userName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-sm">{att.userName}</div>
                            <div className="text-[11px] text-stone-500">{att.userRole}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        {att.propertyName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-semibold text-[10px]">
                          {att.shift === "MATIN"
                            ? "🌅 Matin (07h-15h)"
                            : att.shift === "SOIR"
                            ? "🌇 Soir (15h-23h)"
                            : att.shift === "NUIT"
                            ? "🌙 Nuit (23h-07h)"
                            : "🚨 Astreinte (24h)"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                        {att.checkInTime ? att.checkInTime : <span className="text-stone-400 font-normal">Non pointé</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            att.status === "PRESENT"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : att.status === "RETARD"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : att.status === "ABSENT_JUSTIFIE"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : att.status === "ABSENT_INJUSTIFIE"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : att.status === "EN_GARDE"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {att.status === "PRESENT" && "🟢 Présent"}
                          {att.status === "RETARD" && `🟠 Retard (+${att.delayMinutes} min)`}
                          {att.status === "ABSENT_JUSTIFIE" && "🔵 Abs. Justifiée"}
                          {att.status === "ABSENT_INJUSTIFIE" && "🔴 Abs. Non Justifiée"}
                          {att.status === "EN_GARDE" && "🟣 De Garde"}
                          {att.status === "CONGE" && "⚪ Congé"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate">
                        {att.notes || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {att.status !== "PRESENT" && (
                            <button
                              onClick={() => {
                                const timeStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                                setAttendances((prev) =>
                                  prev.map((a) =>
                                    a.id === att.id ? { ...a, status: "PRESENT", checkInTime: timeStr, delayMinutes: 0 } : a
                                  )
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors"
                              title="Valider la présence"
                            >
                              Pointer
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const note = prompt("Ajouter une observation ou motif de justification :", att.notes || "");
                              if (note !== null) {
                                setAttendances((prev) =>
                                  prev.map((a) =>
                                    a.id === att.id ? { ...a, notes: note, status: a.status === "ABSENT_INJUSTIFIE" ? "ABSENT_JUSTIFIE" : a.status } : a
                                  )
                                );
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
                          >
                            Justifier
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Planning des Permanences & Gardes d'Astreinte (Rotations) */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Planning des Permanences & Gardes d&apos;Astreinte
                </h3>
                <p className="text-xs text-stone-500">
                  Rotations organisées pour assurer la continuité de service 24h/24 dans les hôtels du groupe
                </p>
              </div>
              <button
                onClick={() => {
                  setDutyForm({
                    title: "",
                    propertyId: "prop-bohicon-001",
                    shift: "NUIT",
                    date: new Date().toISOString().split("T")[0],
                    assignedStaff: [],
                    instructions: "",
                    status: "PLANIFIE",
                  });
                  setDutyModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un Créneau de Permanence</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dutyRosters.map((dr) => (
                <div
                  key={dr.id}
                  className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        {dr.shift === "NUIT"
                          ? "🌙 Garde de Nuit"
                          : dr.shift === "SOIR"
                          ? "🌇 Permanence Soir"
                          : "🚨 Astreinte"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          dr.status === "EN_COURS"
                            ? "bg-emerald-100 text-emerald-800 animate-pulse"
                            : dr.status === "PLANIFIE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {dr.status === "EN_COURS"
                          ? "En cours"
                          : dr.status === "PLANIFIE"
                          ? "Planifié"
                          : "Terminé"}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm">{dr.title}</h4>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-stone-400" />
                      <span>{dr.propertyName}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>Date : {dr.date}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Collaborateur(s) affecté(s) :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dr.assignedStaff.map((staff, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-800 text-[11px] font-semibold"
                          >
                            👤 {staff.userName} ({staff.roleName})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200/80">
                      <strong>Consignes :</strong> {dr.instructions}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200">
                    {dr.status !== "TERMINE" ? (
                      <button
                        onClick={() => {
                          setDutyRosters((prev) =>
                            prev.map((d) => (d.id === dr.id ? { ...d, status: "TERMINE" } : d))
                          );
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold text-center transition-colors"
                      >
                        Marquer Terminé
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400 font-semibold italic">Garde clôturée</span>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Supprimer cette planification de permanence ?")) {
                          setDutyRosters((prev) => prev.filter((d) => d.id !== dr.id));
                        }
                      }}
                      className="p-1.5 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                      title="Supprimer la permanence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 8: TRESORERIE & COMPTES
         ========================================================================= */}
      {currentView === "tresorerie" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Situation des Comptes & Trésorerie
              </h2>
              <p className="text-xs text-stone-500">
                Suivi consolidé des avoirs bancaires (BOA), caisses physiques et soldes agrégateurs Mobile Money (KkiaPay).
              </p>
            </div>
            <button
              onClick={() => setTreasuryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer une Opération de Caisse</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {treasuryAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {acc.type}
                  </span>
                  <Wallet className="w-4 h-4 text-[#184f28]" />
                </div>
                <h4 className="font-bold text-stone-900 text-sm">{acc.label}</h4>
                <div className="text-2xl font-black text-[#184f28]">
                  {acc.balanceXof.toLocaleString("fr-FR")}{" "}
                  <span className="text-xs text-stone-500 font-medium">XOF</span>
                </div>
                <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <div>{acc.institution}</div>
                  <div className="font-mono text-stone-400 text-[10px] mt-0.5">{acc.accountNumber}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              Journal Récent des Flux Financiers
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 uppercase tracking-wider text-[11px] text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Date / Heure</th>
                    <th className="py-3 px-4">Libellé de l&apos;Opération</th>
                    <th className="py-3 px-4">Compte Impacté</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4 text-right">Montant (XOF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCashTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4 text-stone-400 font-medium">{tx.date}</td>
                      <td className="py-3.5 px-4 font-bold text-stone-900">{tx.label}</td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">{tx.accountLabel}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm">
                        {tx.type === "ENTREE" ? (
                          <span className="text-emerald-700">
                            +{tx.amountXof.toLocaleString("fr-FR")} XOF
                          </span>
                        ) : (
                          <span className="text-red-600">
                            -{tx.amountXof.toLocaleString("fr-FR")} XOF
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 9: ABONNEMENT LOGICIEL (CHARIOW)
         ========================================================================= */}
      {currentView === "abonnement" && (
        <div className="max-w-2xl mx-auto bg-stone-900 text-white rounded-3xl border border-stone-800 p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                CH
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-white">
                  Abonnement Logiciel HotelGest
                </h3>
                <p className="text-xs text-stone-400">
                  Géré et prélevé de manière sécurisée via <strong>Chariow</strong> pour l&apos;éditeur de la plateforme.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
              Actif
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between text-stone-300">
              <span>Formule :</span>
              <span className="font-bold text-white">HotelGest Enterprise Multi-Sites (4 Agences)</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>Montant :</span>
              <span className="font-bold text-[#d4af37]">100 000 XOF / mois</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>Passerelle d&apos;abonnement :</span>
              <span className="font-semibold text-blue-400">Chariow (MoMo / Carte)</span>
            </div>
          </div>

          <a
            href="https://checkout.chariow.com/pay/chariow_chk_vignoble"
            target="_blank"
            rel="noreferrer"
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-center font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/40"
          >
            Payer / Renouveler l&apos;Abonnement via Chariow (100 000 XOF)
          </a>
        </div>
      )}

      {/* =========================================================================
          VIEW 10: COMMANDES (FLUX DES COMMANDES PAR SERVICE & ETABLISSEMENT)
         ========================================================================= */}
      {currentView === "commandes" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                  {isManager ? "Cockpit Établissement" : "Flux Centralisé Multi-Sites"}
                </span>
                <span className="text-xs text-stone-400">• Direct Serveuses & Réception</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                {isManager ? "Commandes de l'Établissement" : "Flux Consolidé de Toutes les Commandes"} ({filteredOrders.length})
              </h2>
              <p className="text-xs text-stone-500">
                Répertoire continu des commandes : réservations de chambres, repas & boissons, cave à vin, locations de matériel/véhicules et services traiteur.
              </p>
            </div>
            <button
              onClick={() => {
                setOrderForm({
                  orderType: "REPAS_BOISSON",
                  propertyId: isManager && managerPropertyId ? managerPropertyId : "prop-bohicon-001",
                  clientName: "",
                  clientPhone: "",
                  itemsSummary: "",
                  totalAmountXof: 15000,
                  status: "EN_ATTENTE",
                  origin: "SERVEUSE",
                });
                setOrderModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Enregistrer une Commande</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Total Commandes</span>
              <div className="text-2xl font-black text-stone-900 mt-1">{filteredOrders.length}</div>
              <span className="text-[10px] text-blue-600 font-medium">Flux actif</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Volume d&apos;Affaires</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {filteredOrders.reduce((sum, o) => sum + o.totalAmountXof, 0).toLocaleString("fr-FR")} <span className="text-xs font-normal">XOF</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Consolidé</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">En Attente / Préparation</span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {filteredOrders.filter((o) => o.status === "EN_ATTENTE" || o.status === "EN_PREPARATION").length}
              </div>
              <span className="text-[10px] text-amber-600 font-medium">À traiter en cuisine / régie</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Payées & Encaissées</span>
              <div className="text-2xl font-black text-[#184f28] mt-1">
                {filteredOrders.filter((o) => o.status === "PAYEE" || o.status === "LIVREE").length}
              </div>
              <span className="text-[10px] text-[#184f28] font-medium">Règlements validés</span>
            </div>
          </div>

          {/* Filter Toolbar for Commandes */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Site filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-blue-700" /> Établissement
                </label>
                <select
                  disabled={isManager}
                  value={orderSiteFilter}
                  onChange={(e) => setOrderSiteFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-blue-700 disabled:opacity-75"
                >
                  <option value="ALL">Tous les Établissements</option>
                  <option value="prop-bohicon-001">Hôtel Le Vignoble - Bohicon</option>
                  <option value="prop-abomey-002">Hôtel Le Vignoble - Abomey</option>
                  <option value="prop-calavi-003">Hôtel Le Vignoble - Abomey-Calavi</option>
                  <option value="prop-zogbo-004">Hôtel Le Vignoble - Zogbodomey</option>
                </select>
              </div>

              {/* Service Type filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-blue-700" /> Nature de Prestation
                </label>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-blue-700"
                >
                  <option value="ALL">Tous les Services</option>
                  <option value="RESERVATION_CHAMBRE">Hébergement / Chambres</option>
                  <option value="REPAS_BOISSON">Restauration & Bar</option>
                  <option value="CAVE_A_VIN">Cave à Vin & Spiritueux</option>
                  <option value="LOCATION_MATERIEL">Location Matériel & Véhicules</option>
                  <option value="SERVICE_TRAITEUR">Service Traiteur & Banquets</option>
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-blue-700" /> Statut Commande
                </label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-blue-700"
                >
                  <option value="ALL">Tous les Statuts</option>
                  <option value="EN_ATTENTE">🟡 En Attente</option>
                  <option value="VALIDEE">🔵 Validée</option>
                  <option value="EN_PREPARATION">🟠 En Préparation</option>
                  <option value="LIVREE">🟣 Livrée</option>
                  <option value="PAYEE">🟢 Payée / Encaissée</option>
                  <option value="ANNULEE">⚪ Annulée</option>
                </select>
              </div>

              {/* Search input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-blue-700" /> Recherche
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="N° commande, client, articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-blue-700"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Table of Orders */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-4">Réf & Émission</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Prestation & Détails</th>
                    <th className="py-3 px-4">Montant Net</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions Opérationnelles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        Aucune commande trouvée pour ces critères de filtrage.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-stone-900">{ord.orderNumber}</div>
                          <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {ord.createdAt}
                          </div>
                          <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono text-[9px]">
                            {ord.origin}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-900">{ord.clientName}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{ord.clientPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 font-medium">
                          {ord.propertyName}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                            ord.orderType === "RESERVATION_CHAMBRE"
                              ? "bg-purple-100 text-purple-700"
                              : ord.orderType === "REPAS_BOISSON"
                              ? "bg-emerald-100 text-emerald-700"
                              : ord.orderType === "CAVE_A_VIN"
                              ? "bg-rose-100 text-rose-700"
                              : ord.orderType === "LOCATION_MATERIEL"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {ord.orderType.replace(/_/g, " ")}
                          </span>
                          <div className="text-stone-700 truncate font-medium">{ord.itemsSummary}</div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-stone-900 whitespace-nowrap">
                          {ord.totalAmountXof.toLocaleString("fr-FR")} XOF
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === "PAYEE"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "LIVREE"
                              ? "bg-teal-100 text-teal-800"
                              : ord.status === "VALIDEE"
                              ? "bg-blue-100 text-blue-800"
                              : ord.status === "EN_PREPARATION"
                              ? "bg-amber-100 text-amber-800"
                              : ord.status === "EN_ATTENTE"
                              ? "bg-stone-100 text-stone-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {ord.status === "PAYEE" && <Check className="w-3 h-3 text-emerald-600" />}
                            {ord.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status === "EN_ATTENTE" && (
                              <button
                                onClick={() => {
                                  setOrders((prev) =>
                                    prev.map((o) => (o.id === ord.id ? { ...o, status: "VALIDEE" } : o))
                                  );
                                }}
                                className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                              >
                                Valider
                              </button>
                            )}
                            {ord.status === "VALIDEE" && (
                              <button
                                onClick={() => {
                                  setOrders((prev) =>
                                    prev.map((o) => (o.id === ord.id ? { ...o, status: "EN_PREPARATION" } : o))
                                  );
                                }}
                                className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition-colors"
                              >
                                En Cuisine/Régie
                              </button>
                            )}
                            {(ord.status === "EN_PREPARATION" || ord.status === "VALIDEE") && (
                              <button
                                onClick={() => {
                                  setOrders((prev) =>
                                    prev.map((o) => (o.id === ord.id ? { ...o, status: "LIVREE" } : o))
                                  );
                                }}
                                className="px-2 py-1 rounded-lg bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition-colors"
                              >
                                Livrer
                              </button>
                            )}
                            {ord.status !== "PAYEE" && (
                              <button
                                onClick={() => {
                                  setOrders((prev) =>
                                    prev.map((o) => (o.id === ord.id ? { ...o, status: "PAYEE" } : o))
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                              >
                                Encaisser
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 11: EVENEMENTS ET RENDEZ-VOUS (BRUNCHS, SOIREES, SEMINAIRES)
         ========================================================================= */}
      {currentView === "events" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                  Agenda Prestigieux & Évènements
                </span>
                <span className="text-xs text-stone-400">• Vitrine Landing & Organisation</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                {isManager ? "Évènements & Rendez-vous du Site" : "Gestion des Évènements & Célébrations"} ({filteredEvents.length})
              </h2>
              <p className="text-xs text-stone-500">
                Programmez les brunchs dominicaux, soirées dégustation, réunions exécutives, séminaires, ateliers et mariages. Diffusé en direct sur le carrousel de la page d&apos;accueil.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventForm({
                  title: "",
                  category: "BRUNCH",
                  propertyId: isManager && managerPropertyId ? managerPropertyId : "prop-bohicon-001",
                  date: new Date().toISOString().split("T")[0],
                  startTime: "12:00",
                  endTime: "17:00",
                  expectedGuests: 50,
                  pricePerPersonXof: 20000,
                  description: "",
                  imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
                  tags: ["#LeVignobleEvents"],
                  status: "PLANIFIE",
                });
                setEventModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Programmer un Évènement</span>
            </button>
          </div>

          {/* Filters for Events */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-purple-700" /> Établissement
                </label>
                <select
                  disabled={isManager}
                  value={eventSiteFilter}
                  onChange={(e) => setEventSiteFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-purple-700 disabled:opacity-75"
                >
                  <option value="ALL">Tous les Établissements</option>
                  <option value="prop-bohicon-001">Hôtel Le Vignoble - Bohicon</option>
                  <option value="prop-abomey-002">Hôtel Le Vignoble - Abomey</option>
                  <option value="prop-calavi-003">Hôtel Le Vignoble - Abomey-Calavi</option>
                  <option value="prop-zogbo-004">Hôtel Le Vignoble - Zogbodomey</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-purple-700" /> Catégorie d&apos;Évènement
                </label>
                <select
                  value={eventCategoryFilter}
                  onChange={(e) => setEventCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-purple-700"
                >
                  <option value="ALL">Toutes les Catégories</option>
                  <option value="BRUNCH">Brunchs Gastronomiques</option>
                  <option value="SOIREE_PRESTIGE">Soirées Prestige & Dégustation</option>
                  <option value="SEMINAIRE">Séminaires Exécutifs</option>
                  <option value="ATELIER">Ateliers de Travail</option>
                  <option value="MARIAGE">Mariages & Cérémonies Privées</option>
                  <option value="GALA">Galas & Réceptions Officielles</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-purple-700" /> Recherche
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Titre, descriptif..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-purple-700"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Events Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-purple-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                      {evt.category.replace(/_/g, " ")}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-mono">
                      {evt.date}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                      {evt.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      {evt.propertyName} • {evt.startTime} - {evt.endTime}
                    </span>
                    <h4 className="text-base font-bold text-stone-900">{evt.title}</h4>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1">{evt.description}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Tarif / Couvert :</span>
                      <span className="font-bold text-purple-900 text-sm">
                        {evt.pricePerPersonXof > 0 ? `${evt.pricePerPersonXof.toLocaleString("fr-FR")} XOF` : "Accès Libre / Sur Devis"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Capacité attendue :</span>
                      <span className="font-semibold text-stone-700">{evt.expectedGuests} invités</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {evt.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(evt);
                      setEventForm(evt);
                      setEventModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer cet évènement ?")) {
                        setHotelEvents((prev) => prev.filter((e) => e.id !== evt.id));
                      }
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                    title="Supprimer l'évènement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 12: MUTATION DU PERSONNEL (PRIVILEGE EXCLUSIF DAF & PROMOTEUR)
         ========================================================================= */}
      {currentView === "mutations" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* RBAC check for site manager: Only DAF & Promoter */}
          {isManager ? (
            <div className="max-w-2xl mx-auto bg-stone-900 border border-stone-800 text-white rounded-3xl p-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white">
                Accès Restreint : Prérogative Exclusive DAF & Promoteur
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed max-w-lg mx-auto">
                La mutation et la réaffectation inter-agences ou inter-postes des collaborateurs relèvent exclusivement des pouvoirs de la Direction Générale (Promoteur M. Eddy GNACADJA et Directeur Administratif & Financier).
              </p>
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-400 text-left space-y-2">
                <div className="font-semibold text-rose-300">Procédure pour le Gérant de site :</div>
                <p>1. Transmettre votre demande de renfort ou permutation par la Messagerie Interne à la Direction Générale.</p>
                <p>2. La décision de mutation sera officialisée par le DAF et notifiera automatiquement votre site et l&apos;agent concerné.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
                      Privilège Exclusif DAF & Promoteur
                    </span>
                    <span className="text-xs text-stone-400">• Gouvernance RH Groupe</span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Mutations & Affectations du Personnel ({mutations.length})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Mutez un collaborateur d&apos;une agence à une autre ou d&apos;un poste à un autre. La décision met à jour automatiquement la base RH et notifie le collaborateur, le DAF et les gérants concernés.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMutationForm({
                      staffId: staffList[0]?.id || "",
                      toPropertyId: "prop-bohicon-001",
                      toRoleName: "Gérant d'Agence",
                      effectiveDate: new Date().toISOString().split("T")[0],
                      reason: "Renfort opérationnel et réorganisation stratégique",
                    });
                    setMutationModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>+ Muter un Collaborateur</span>
                </button>
              </div>

              {/* Quick KPIs on Mutations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Mutations Enregistrées</span>
                  <div className="text-2xl font-black text-stone-900 mt-1">{mutations.length}</div>
                  <span className="text-[10px] text-emerald-600 font-medium">Historique complet RH</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Agences Concernées</span>
                  <div className="text-2xl font-black text-rose-700 mt-1">4 Établissements</div>
                  <span className="text-[10px] text-stone-500 font-medium">Bohicon, Abomey, Calavi, Zogbo</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Autorités de Décision</span>
                  <div className="text-2xl font-black text-[#184f28] mt-1">Promoteur & DAF</div>
                  <span className="text-[10px] text-[#184f28] font-medium">Validation stricte</span>
                </div>
              </div>

              {/* Mutations Table */}
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold text-[10px]">
                        <th className="py-3 px-4">Date Prise d&apos;Effet</th>
                        <th className="py-3 px-4">Collaborateur</th>
                        <th className="py-3 px-4">Agence d&apos;Origine</th>
                        <th className="py-3 px-4">Nouvelle Agence Affectée</th>
                        <th className="py-3 px-4">Évolution de Fonction</th>
                        <th className="py-3 px-4">Motif & Décisionnaire</th>
                        <th className="py-3 px-4">Statut & Notification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredMutations.map((m) => (
                        <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                            {m.effectiveDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-900">{m.staffName}</div>
                            <span className="text-[10px] text-stone-400 font-mono">ID: {m.staffId}</span>
                          </td>
                          <td className="py-3.5 px-4 text-stone-600 font-medium">
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                              {m.fromPropertyName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-rose-800">
                            <div className="flex items-center gap-1.5">
                              <ArrowLeftRight className="w-3.5 h-3.5 text-rose-600" />
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                                {m.toPropertyName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-stone-400 line-through text-[11px]">{m.fromRoleName}</div>
                            <div className="font-bold text-stone-900 text-xs">{m.toRoleName}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="text-stone-800 font-medium">{m.reason}</div>
                            <div className="text-[10px] text-stone-400 mt-0.5">Par : {m.decisionMaker}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {m.status}
                            </span>
                            <div className="text-[10px] text-emerald-700 font-medium">✓ Notifié Promoteur, Agent, DAF</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 13: NOTATION DU PERSONNEL (AVIS CLIENTS & ALERTES MULTI-ROLES)
         ========================================================================= */}
      {currentView === "notations" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                  Transparence & Qualité de Service
                </span>
                <span className="text-xs text-stone-400">• Alertes instantanées aux 4 parties</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                {isManager ? "Avis Clients sur le Personnel du Site" : "Notation du Personnel par les Clients"} ({filteredRatings.length})
              </h2>
              <p className="text-xs text-stone-500">
                Chaque note attribuée par un hôte alerte en direct : le <strong>Promoteur</strong>, l&apos;<strong>Agent concerné</strong>, le <strong>DAF</strong> et le <strong>Gérant du site</strong>.
              </p>
            </div>
            <button
              onClick={() => {
                setRatingForm({
                  staffId: filteredStaff[0]?.id || "",
                  clientName: "",
                  clientEmail: "",
                  serviceCategory: "ACCUEIL_RECEPTION",
                  rating: 5,
                  comment: "",
                });
                setRatingModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>+ Enregistrer / Simuler un Avis</span>
            </button>
          </div>

          {/* Overall Satisfaction Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-serif">4.85</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">/ 5 ★</span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-white ml-2">Excellence Hôtelière 97%</span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">Indice de Satisfaction & Accueil</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Basé sur les évaluations vérifiées de l&apos;ensemble de nos hôtes résidents et convives au restaurant.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-xl font-bold text-emerald-400">100%</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">Traçabilité</div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-xl font-bold text-[#d4af37]">4 Acteurs</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">Notifiés</div>
              </div>
            </div>
          </div>

          {/* Filters for Notations */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-amber-600" /> Établissement
                </label>
                <select
                  disabled={isManager}
                  value={ratingSiteFilter}
                  onChange={(e) => setRatingSiteFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-amber-600 disabled:opacity-75"
                >
                  <option value="ALL">Tous les Établissements</option>
                  <option value="prop-bohicon-001">Hôtel Le Vignoble - Bohicon</option>
                  <option value="prop-abomey-002">Hôtel Le Vignoble - Abomey</option>
                  <option value="prop-calavi-003">Hôtel Le Vignoble - Abomey-Calavi</option>
                  <option value="prop-zogbo-004">Hôtel Le Vignoble - Zogbodomey</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-amber-600" /> Pôle de Service
                </label>
                <select
                  value={ratingCategoryFilter}
                  onChange={(e) => setRatingCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-amber-600"
                >
                  <option value="ALL">Tous les Services</option>
                  <option value="ACCUEIL_RECEPTION">Accueil & Réception</option>
                  <option value="SERVICE_CHAMBRE">Service de Chambre / Étage</option>
                  <option value="RESTAURATION_BAR">Restauration & Bar</option>
                  <option value="CHAUFFEUR_VIP">Chauffeur Privé & Navette</option>
                  <option value="SERVICE_TRAITEUR">Service Traiteur</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-600" /> Étoiles Min.
                </label>
                <select
                  value={ratingMinStars}
                  onChange={(e) => setRatingMinStars(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-amber-600"
                >
                  <option value="0">Toutes les notes</option>
                  <option value="5">5 Étoiles uniquement ★★★★★</option>
                  <option value="4">4 Étoiles et plus ★★★★☆</option>
                  <option value="3">3 Étoiles et plus ★★★☆☆</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-amber-600" /> Recherche
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom collaborateur, client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-600"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Cards of Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRatings.map((rt) => (
              <div
                key={rt.id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-sm">
                      {rt.staffName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">{rt.staffName}</div>
                      <div className="text-[11px] text-stone-500">{rt.staffRole} • {rt.propertyName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    <span className="font-black text-amber-800 text-sm">{rt.rating}.0</span>
                    <div className="flex">
                      {[...Array(rt.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-800">Client : {rt.clientName}</span>
                    <span className="text-stone-400 font-mono">{rt.date}</span>
                  </div>
                  <p className="text-xs text-stone-600 italic">« {rt.comment} »</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-100 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold uppercase">
                    {rt.serviceCategory.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Notifié : Promoteur • Agent • DAF • Gérant {rt.propertyName.split(" - ")[1]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 14: STOCKS MULTI-SITES (CAVE, BAR, VIVRES CUISINE, LINGERIE, ENTRETIEN)
         ========================================================================= */}
      {currentView === "stocks" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  Économat & Approvisionnement Groupe
                </span>
                <span className="text-xs text-stone-400">• Surveillance des seuils de sécurité</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                Gestion des Stocks Multi-Sites ({filteredStocks.length} articles)
              </h2>
              <p className="text-xs text-stone-500">
                Cave à vin, Boissons bar/restaurant, Vivres bruts de cuisine (pour confection des repas à la minute), Lingerie de chambres et Produits d&apos;entretien.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Toggle Mode Quantité vs Valeur */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStockDisplayMode("QUANTITY")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    stockDisplayMode === "QUANTITY"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  📊 En Quantité
                </button>
                <button
                  type="button"
                  onClick={() => setStockDisplayMode("VALUE")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    stockDisplayMode === "VALUE"
                      ? "bg-white text-[#184f28] shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  💰 En Valeur (XOF)
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingStock(null);
                  setStockForm({
                    sku: `STK-${Date.now().toString().slice(-4)}`,
                    name: "",
                    category: "VIVRES_CUISINE",
                    propertyId: isManager && managerPropertyId ? managerPropertyId : "prop-bohicon-001",
                    unitMeasure: "Kg",
                    currentQuantity: 20,
                    alertThreshold: 8,
                    securityThreshold: 3,
                    unitCostXof: 3500,
                    storageLocation: "Économat Principal",
                    supplierName: "",
                  });
                  setStockModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#d4af37]" />
                <span>+ Entrée / Nouvel Article Stock</span>
              </button>
            </div>
          </div>

          {/* Kitchen Vivres Note */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
            <Package className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[11px] uppercase tracking-wider text-amber-900 block">
                Organisation du Stock Cuisine & Restauration
              </span>
              <p className="text-stone-700 leading-relaxed">
                Les repas servis en salle ne font l&apos;objet d&apos;aucun stockage direct car ils sont cuisinés minute à la commande. Ce module recense et valorise les <strong>matières premières et vivres bruts</strong> (volailles fermières, viandes de mouton, poissons frais, sacs de riz, bananes plantains, huiles, féculents et condiments) qui entrent dans leur fabrication.
              </p>
            </div>
          </div>

          {/* Top KPI Readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Valeur Totale Stock
              </span>
              <div className="text-2xl font-black text-stone-900 font-serif">
                {totalStockValueXof.toLocaleString("fr-FR")} XOF
              </div>
              <div className="text-[10px] text-stone-400 mt-1">
                Actif circulant valorisé au coût d&apos;achat
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Articles Référencés
              </span>
              <div className="text-2xl font-black text-stone-900">
                {filteredStocks.length}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">
                5 familles de stocks suivies
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                Seuil d&apos;Alerte Réappro
              </span>
              <div className="text-2xl font-black text-amber-800">
                {totalStockAlertsCount}
              </div>
              <div className="text-[10px] text-amber-700 mt-1">
                Commande fournisseur recommandée
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                Seuil de Sécurité / Rupture
              </span>
              <div className="text-2xl font-black text-rose-800">
                {totalStockCriticalCount}
              </div>
              <div className="text-[10px] text-rose-700 mt-1 font-semibold">
                Niveau critique exigeant livraison express
              </div>
            </div>
          </div>

          {/* Filters Toolbar for Stocks */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filter 1: Établissement */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-[#184f28]" /> Établissement
                </label>
                <select
                  disabled={isManager}
                  value={stockPropertyFilter}
                  onChange={(e) => setStockPropertyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28] disabled:opacity-75"
                >
                  <option value="ALL">Toutes les Agences (Groupe)</option>
                  <option value="prop-bohicon-001">Hôtel Le Vignoble - Bohicon (Siège)</option>
                  <option value="prop-abomey-002">Hôtel Le Vignoble - Abomey</option>
                  <option value="prop-calavi-003">Hôtel Le Vignoble - Abomey-Calavi</option>
                  <option value="prop-zogbo-004">Hôtel Le Vignoble - Zogbodomey</option>
                </select>
              </div>

              {/* Filter 2: Famille de stock */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-[#184f28]" /> Famille de Stock
                </label>
                <select
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28]"
                >
                  <option value="ALL">Toutes les Familles</option>
                  <option value="CAVE_A_VIN">🍷 Cave à Vin & Grands Crus</option>
                  <option value="BOISSON_BAR">🍺 Boissons Bar & Restaurant</option>
                  <option value="VIVRES_CUISINE">🍗 Vivres & Ingrédients Cuisine</option>
                  <option value="LINGERIE_CHAMBRE">🛏️ Lingerie, Draps & Serviettes</option>
                  <option value="PRODUIT_ENTRETIEN">🧼 Produits d&apos;Entretien & Hygiène</option>
                </select>
              </div>

              {/* Filter 3: Statut d'Alerte */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> État des Seuils
                </label>
                <select
                  value={stockAlertFilter}
                  onChange={(e) => setStockAlertFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-[#184f28]"
                >
                  <option value="ALL">Tous les Stocks</option>
                  <option value="ALERTS_ONLY">⚠️ Stocks en Alerte & Ruptures Critiques</option>
                </select>
              </div>

              {/* Filter 4: Recherche textuelle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-stone-500" /> Recherche Référence / Nom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Château, Poulet, Serviette, Drap..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#184f28]"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Stock Items Table */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Réf / SKU</th>
                    <th className="p-3.5">Article & Emplacement</th>
                    <th className="p-3.5">Famille</th>
                    <th className="p-3.5">Établissement</th>
                    <th className="p-3.5 text-right">
                      {stockDisplayMode === "QUANTITY" ? "Quantité Disponible" : "Valeur Totale (XOF)"}
                    </th>
                    <th className="p-3.5 text-center">Seuil d&apos;Alerte</th>
                    <th className="p-3.5 text-center">Seuil Sécurité</th>
                    <th className="p-3.5 text-center">État Stock</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStocks.map((item) => {
                    const isCritical = item.currentQuantity <= item.securityThreshold;
                    const isAlert = !isCritical && item.currentQuantity <= item.alertThreshold;
                    const totalValXof = item.currentQuantity * item.unitCostXof;

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] font-bold text-stone-600 whitespace-nowrap">
                          {item.sku}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900 text-xs">{item.name}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            📍 {item.storageLocation} {item.supplierName ? `• ${item.supplierName}` : ""}
                          </div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                            {item.category === "CAVE_A_VIN"
                              ? "🍷 Cave à Vin"
                              : item.category === "BOISSON_BAR"
                              ? "🍺 Boisson Bar"
                              : item.category === "VIVRES_CUISINE"
                              ? "🍗 Vivres Cuisine"
                              : item.category === "LINGERIE_CHAMBRE"
                              ? "🛏️ Lingerie & Chambres"
                              : "🧼 Produits Entretien"}
                          </span>
                        </td>
                        <td className="p-3.5 text-stone-600 text-xs whitespace-nowrap">
                          {item.propertyName.replace("Hôtel Le Vignoble - ", "")}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          {stockDisplayMode === "QUANTITY" ? (
                            <div>
                              <span className="font-black text-sm text-stone-900">
                                {item.currentQuantity}
                              </span>
                              <span className="text-[10px] text-stone-500 ml-1 font-medium">
                                {item.unitMeasure}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-black text-sm text-[#184f28] font-serif">
                                {totalValXof.toLocaleString("fr-FR")} XOF
                              </span>
                              <div className="text-[10px] text-stone-400">
                                ({item.currentQuantity} {item.unitMeasure} × {item.unitCostXof.toLocaleString("fr-FR")} XOF)
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap font-mono text-xs text-amber-700 font-semibold">
                          {item.alertThreshold} {item.unitMeasure}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap font-mono text-xs text-rose-700 font-semibold">
                          {item.securityThreshold} {item.unitMeasure}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {isCritical ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider border border-rose-300">
                              🔴 Rupture Imminente
                            </span>
                          ) : isAlert ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-300">
                              🟠 Alerte Réappro
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                              🟢 Normal
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStock(item);
                              setStockForm(item);
                              setStockModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#184f28] text-stone-700 hover:text-white text-xs font-semibold transition-colors"
                          >
                            Ajuster / Réappro
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 15: ROLES ET ATTRIBUTS DU PERSONNEL (GESTION DES DROITS & HABILITATIONS)
         ========================================================================= */}
      {currentView === "roles" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                  Gouvernance & Sécurité RBAC
                </span>
                <span className="text-xs text-stone-400">• Réservé au Promoteur et DAF</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                Attribution des Rôles et Droits du Personnel ({filteredStaffRoles.length} agents)
              </h2>
              <p className="text-xs text-stone-500">
                Attribuez les rôles hiérarchiques, les agences d&apos;affectation, les plafonds de remise autorisée et configurez les droits modulaires de chaque agent.
              </p>
            </div>
          </div>

          {/* Filters for Roles */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-blue-600" /> Établissement
                </label>
                <select
                  disabled={isManager}
                  value={rolePropertyFilter}
                  onChange={(e) => setRolePropertyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-blue-600 disabled:opacity-75"
                >
                  <option value="ALL">Toutes les Agences</option>
                  <option value="prop-bohicon-001">Hôtel Le Vignoble - Bohicon</option>
                  <option value="prop-abomey-002">Hôtel Le Vignoble - Abomey</option>
                  <option value="prop-calavi-003">Hôtel Le Vignoble - Abomey-Calavi</option>
                  <option value="prop-zogbo-004">Hôtel Le Vignoble - Zogbodomey</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Rôle Métier
                </label>
                <select
                  value={roleCodeFilter}
                  onChange={(e) => setRoleCodeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">Tous les Rôles</option>
                  <option value="RECEPTIONIST">Réceptionniste</option>
                  <option value="WAITSTAFF">Serveur / Serveuse</option>
                  <option value="BARTENDER">Barman / Sommelier</option>
                  <option value="CHEF">Chef Cuisinier</option>
                  <option value="HOUSEKEEPING">Housekeeping (Valet de chambre)</option>
                  <option value="PROPERTY_MANAGER">Gérant d&apos;Établissement</option>
                  <option value="CATERING_MANAGER">Responsable Traiteur & Matériel</option>
                  <option value="FINANCIAL_DIRECTOR">Directeur Financier (DAF)</option>
                  <option value="PROMOTER">Promoteur</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-stone-500" /> Recherche par Nom ou Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Gaston, Chantal, Marc..."
                    value={roleSearchQuery}
                    onChange={(e) => setRoleSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-blue-600"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Staff Roles Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaffRoles.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#184f28] text-white flex items-center justify-center font-bold text-lg border border-stone-200 shrink-0 shadow-xs">
                        {agent.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{agent.fullName}</h4>
                        <div className="text-[11px] text-stone-400">{agent.email}</div>
                        <div className="text-[11px] font-semibold text-[#184f28] mt-0.5">
                          📍 {agent.propertyName}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wider border border-blue-200 whitespace-nowrap">
                      {agent.roleCode}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs space-y-2 mb-3">
                    <div className="flex justify-between items-center pb-1.5 border-b border-stone-200/60">
                      <span className="text-stone-500 font-medium">Fonction Officielle :</span>
                      <strong className="text-stone-900">{agent.roleName}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 font-medium">Plafond Remise Client :</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {agent.maxDiscount}% maximum
                      </span>
                    </div>
                  </div>

                  {/* Modular Rights Badges */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                      Attributs & Droits Accordés :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agent.rights.pmsReservations && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          🏨 Chambres & PMS
                        </span>
                      )}
                      {agent.rights.posOrderTaking && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200">
                          🍽️ Commandes POS
                        </span>
                      )}
                      {agent.rights.kitchenKds && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-semibold border border-rose-200">
                          👨‍🍳 KDS Cuisine
                        </span>
                      )}
                      {agent.rights.barKds && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                          🍸 KDS Bar
                        </span>
                      )}
                      {agent.rights.cashFinance && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-semibold border border-stone-200">
                          💰 Caisse & Folios
                        </span>
                      )}
                      {agent.rights.hallBooking && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[10px] font-semibold border border-purple-200">
                          🏢 Salles & Événements
                        </span>
                      )}
                      {agent.rights.equipmentCatering && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-semibold border border-teal-200">
                          🚗 Matériel & Traiteur
                        </span>
                      )}
                      {agent.rights.reportsTreasury && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[10px] font-semibold border border-indigo-200">
                          📈 Rapports & Finance
                        </span>
                      )}
                      {agent.rights.stocksManage && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                          📦 Gestion des Stocks
                        </span>
                      )}
                      {agent.rights.intersiteMessaging && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-semibold">
                          💬 Inter-sites
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoleAssignment(agent);
                      setRoleForm(agent);
                      setRoleModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-blue-600 hover:text-white text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier Rôle et Attributs</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* VIEW 17: DOCUMENTS LÉGAUX & COOKIES */}
      {currentView === "legal" && (
        <PromoterLegalManager activeUser={activeUser} />
      )}

      {/* MODAL CHAMBRE */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingRoom ? "Modifier la Chambre" : "Ajouter une Nouvelle Chambre"}
              </h3>
              <button onClick={() => setRoomModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const prop = SEED_PROPERTIES.find((p) => p.id === roomForm.propertyId) || SEED_PROPERTIES[0];
                if (editingRoom) {
                  setRooms((prev) =>
                    prev.map((r) =>
                      r.id === editingRoom.id ? ({ ...r, ...roomForm, propertyName: prop.name } as RoomRecord) : r
                    )
                  );
                } else {
                  const newRoom: RoomRecord = {
                    id: `rm-${Date.now()}`,
                    number: roomForm.number || "999",
                    name: roomForm.name || "Chambre Grand Confort",
                    propertyId: prop.id,
                    propertyName: prop.name,
                    type: (roomForm.type as any) || "STANDARD",
                    basePriceXof: Number(roomForm.basePriceXof) || 30000,
                    capacity: Number(roomForm.capacity) || 2,
                    bedPlaces: Number(roomForm.bedPlaces) || 2,
                    bedConfiguration: roomForm.bedConfiguration || "1 Lit King Size (2 places)",
                    amenities: roomForm.amenities && roomForm.amenities.length > 0
                      ? roomForm.amenities
                      : ["Wi-Fi Haut Débit", "Climatisation Split", "Salle de bain privative"],
                    status: (roomForm.status as any) || "DISPONIBLE",
                    imageUrl: roomForm.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                  };
                  setRooms((prev) => [newRoom, ...prev]);
                }
                setRoomModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Numéro de Chambre</label>
                  <input
                    type="text"
                    required
                    value={roomForm.number}
                    onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Établissement</label>
                  <select
                    disabled={isManager}
                    value={roomForm.propertyId}
                    onChange={(e) => setRoomForm({ ...roomForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white disabled:opacity-75"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nom commercial</label>
                <input
                  type="text"
                  required
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  placeholder="Ex: Suite Royale Le Vignoble"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix par nuit (XOF)</label>
                  <input
                    type="number"
                    required
                    value={roomForm.basePriceXof}
                    onChange={(e) => setRoomForm({ ...roomForm, basePriceXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-[#184f28]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Capacité (personnes max)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Bed places & Bed configuration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-[#184f28]" /> Places de Lit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={roomForm.bedPlaces ?? 2}
                    onChange={(e) => setRoomForm({ ...roomForm, bedPlaces: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Configuration Literie</label>
                  <select
                    value={roomForm.bedConfiguration || "1 Lit King Size (2 places)"}
                    onChange={(e) => setRoomForm({ ...roomForm, bedConfiguration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="1 Lit King Size (2 places)">1 Lit King Size (2 places)</option>
                    <option value="1 Lit Queen Size (2 places)">1 Lit Queen Size (2 places)</option>
                    <option value="1 Lit Double Confort (2 places)">1 Lit Double Confort (2 places)</option>
                    <option value="2 Lits simples séparés (2 places)">2 Lits simples séparés (2 places)</option>
                    <option value="1 Lit King Size + 1 Lit d'appoint (3 places)">1 Lit King Size + 1 Lit d'appoint (3 places)</option>
                    <option value="Suite Familiale 2 Grands Lits (4 places)">Suite Familiale 2 Grands Lits (4 places)</option>
                    <option value="Pavillon 2 Chambres - 4 places">Pavillon 2 Chambres - 4 places</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gamme de Chambre</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="STANDARD">Chambre Standard Confort</option>
                    <option value="SUPERIEURE">Suite Supérieure</option>
                    <option value="SUITE_ROYALE">Suite Royale Le Vignoble</option>
                    <option value="PAVILLON">Pavillon VIP & Jardin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Statut d&apos;Occupation</label>
                  <select
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="DISPONIBLE">🟢 Libre / Disponible</option>
                    <option value="OCCUPEE">🟠 Occupée</option>
                    <option value="RESERVEE">🔵 Réservée</option>
                    <option value="NETTOYAGE">🟣 En Nettoyage</option>
                    <option value="MAINTENANCE">⚪ En Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes for all amenities */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Commodités & Équipements Inclus (À cocher)</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {(roomForm.amenities || []).length} cochée(s)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 max-h-44 overflow-y-auto">
                  {ALL_AMENITY_OPTIONS.map((amenity) => {
                    const isChecked = (roomForm.amenities || []).includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                          isChecked
                            ? "bg-white border-[#184f28] text-stone-900 shadow-xs font-semibold"
                            : "bg-white/60 border-stone-200/60 text-stone-600 hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const current = roomForm.amenities || [];
                            if (current.includes(amenity)) {
                              setRoomForm({ ...roomForm, amenities: current.filter((a) => a !== amenity) });
                            } else {
                              setRoomForm({ ...roomForm, amenities: [...current, amenity] });
                            }
                          }}
                          className="rounded text-[#184f28] focus:ring-[#184f28]"
                        />
                        <span className="truncate">{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo HD (URL avec prévisualisation)</label>
                <input
                  type="url"
                  required
                  value={roomForm.imageUrl}
                  onChange={(e) => setRoomForm({ ...roomForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
                {roomForm.imageUrl && (
                  <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img src={roomForm.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] font-semibold text-white shadow-md"
                >
                  Enregistrer la Chambre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CAVE */}
      {wineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingWine ? "Modifier la Bouteille" : "Ajouter un Cru à la Cave"}
              </h3>
              <button onClick={() => setWineModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingWine) {
                  setWines((prev) =>
                    prev.map((w) => (w.id === editingWine.id ? ({ ...w, ...wineForm } as WineRecord) : w))
                  );
                } else {
                  const newWine: WineRecord = {
                    id: `w-${Date.now()}`,
                    name: wineForm.name || "Nouveau Cru",
                    category: (wineForm.category as any) || "ROUGE",
                    origin: wineForm.origin || "Appellation Protégée",
                    millesime: wineForm.millesime || "NV",
                    priceXof: Number(wineForm.priceXof) || 25000,
                    stockBottles: Number(wineForm.stockBottles) || 10,
                    minStockAlert: Number(wineForm.minStockAlert) || 4,
                    pairings: wineForm.pairings || "Repas gastronomique",
                    imageUrl: wineForm.imageUrl || "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
                  };
                  setWines((prev) => [newWine, ...prev]);
                }
                setWineModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nom du Cru / Bouteille</label>
                <input
                  type="text"
                  required
                  value={wineForm.name}
                  onChange={(e) => setWineForm({ ...wineForm, name: e.target.value })}
                  placeholder="Ex: Château Vignoble Réserve"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={wineForm.category}
                    onChange={(e) => setWineForm({ ...wineForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="ROUGE">Vin Rouge de Garde</option>
                    <option value="CHAMPAGNE">Champagne de Prestige</option>
                    <option value="BLANC_ROSE">Vin Blanc / Rosé</option>
                    <option value="SPIRITUEUX">Spiritueux & Digestif</option>
                    <option value="BOISSON_TERROIR">Boisson / Nectar Terroir</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Millésime</label>
                  <input
                    type="text"
                    value={wineForm.millesime}
                    onChange={(e) => setWineForm({ ...wineForm, millesime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix de Vente (XOF)</label>
                  <input
                    type="number"
                    required
                    value={wineForm.priceXof}
                    onChange={(e) => setWineForm({ ...wineForm, priceXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-[#8c101c]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Initial (bouteilles)</label>
                  <input
                    type="number"
                    required
                    value={wineForm.stockBottles}
                    onChange={(e) => setWineForm({ ...wineForm, stockBottles: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo de la Bouteille (URL)</label>
                <input
                  type="url"
                  required
                  value={wineForm.imageUrl}
                  onChange={(e) => setWineForm({ ...wineForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
                {wineForm.imageUrl && (
                  <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img src={wineForm.imageUrl} alt="Aperçu bouteille" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setWineModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#8c101c] hover:bg-[#6e0d16] font-semibold text-white shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REPAS */}
      {mealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingMeal ? "Modifier le Plat" : "Créer un Nouveau Plat"}
              </h3>
              <button onClick={() => setMealModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingMeal) {
                  setMeals((prev) =>
                    prev.map((m) => (m.id === editingMeal.id ? ({ ...m, ...mealForm } as MealRecord) : m))
                  );
                } else {
                  const newMeal: MealRecord = {
                    id: `m-${Date.now()}`,
                    name: mealForm.name || "Nouveau Plat",
                    category: (mealForm.category as any) || "PLAT_TRADITIONNEL",
                    priceXof: Number(mealForm.priceXof) || 5000,
                    prepTimeMinutes: Number(mealForm.prepTimeMinutes) || 15,
                    accompaniments: mealForm.accompaniments || ["Alloco"],
                    description: mealForm.description || "Spécialité gastronomique.",
                    available: true,
                    imageUrl: mealForm.imageUrl || "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
                  };
                  setMeals((prev) => [newMeal, ...prev]);
                }
                setMealModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nom du Plat ou Accompagnement</label>
                <input
                  type="text"
                  required
                  value={mealForm.name}
                  onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                  placeholder="Ex: Amiwo Royal au Poulet"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={mealForm.category}
                    onChange={(e) => setMealForm({ ...mealForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="PLAT_TRADITIONNEL">Plat Traditionnel Béninois</option>
                    <option value="GRILLADE">Grillade & Carpe</option>
                    <option value="ACCOMPAGNEMENT">Accompagnement (Alloco, Igname...)</option>
                    <option value="ENTREE">Entrée Gastronomique</option>
                    <option value="DESSERT">Dessert Maison</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix de Vente (XOF)</label>
                  <input
                    type="number"
                    required
                    value={mealForm.priceXof}
                    onChange={(e) => setMealForm({ ...mealForm, priceXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo du Plat (URL)</label>
                <input
                  type="url"
                  required
                  value={mealForm.imageUrl}
                  onChange={(e) => setMealForm({ ...mealForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
                {mealForm.imageUrl && (
                  <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img src={mealForm.imageUrl} alt="Aperçu plat" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setMealModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 font-semibold text-white shadow-md"
                >
                  Enregistrer le Plat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOCATION */}
      {rentalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingRental ? "Modifier la Location" : "Ajouter un Véhicule / Matériel"}
              </h3>
              <button onClick={() => setRentalModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingRental) {
                  setRentals((prev) =>
                    prev.map((r) => (r.id === editingRental.id ? ({ ...r, ...rentalForm } as RentalRecord) : r))
                  );
                } else {
                  const newRental: RentalRecord = {
                    id: `r-${Date.now()}`,
                    name: rentalForm.name || "Nouveau Véhicule",
                    type: (rentalForm.type as any) || "VEHICULE_VIP",
                    dailyPriceXof: Number(rentalForm.dailyPriceXof) || 50000,
                    depositXof: Number(rentalForm.depositXof) || 50000,
                    totalQuantity: Number(rentalForm.totalQuantity) || 1,
                    availableQuantity: Number(rentalForm.availableQuantity) || 1,
                    specs: rentalForm.specs || "Haut standing",
                    imageUrl: rentalForm.imageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
                  };
                  setRentals((prev) => [newRental, ...prev]);
                }
                setRentalModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Désignation du véhicule ou équipement</label>
                <input
                  type="text"
                  required
                  value={rentalForm.name}
                  onChange={(e) => setRentalForm({ ...rentalForm, name: e.target.value })}
                  placeholder="Ex: Toyota Prado TXL ou Chaises Napoléon"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={rentalForm.type}
                    onChange={(e) => setRentalForm({ ...rentalForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="VOITURES">🚗 Voitures & Navettes VIP avec Chauffeur</option>
                    <option value="DISH">🍲 Chafing Dish / Chauffe-plats Inox</option>
                    <option value="COUVERTS">🍴 Couverts Dorés & Verrerie Cristal</option>
                    <option value="TABLES">🪵 Tables Banquet Rondes / Conférence</option>
                    <option value="CHAISES">🪑 Chaises Napoléon Chiavari / Conférence</option>
                    <option value="SALLES_FETE">🎉 Grande Salle de Fête & Banquet (500 pl.)</option>
                    <option value="SALLE_REUNION">💼 Salle de Réunion VIP (25 pl.)</option>
                    <option value="SALLE_ATELIER">🎓 Salle d&apos;Atelier & Formation (60 pl.)</option>
                    <option value="BACHE_HANGAR">🎪 Chapiteau Stretch Nomade / Bâches / Hangars</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tarif Journalier (XOF)</label>
                  <input
                    type="number"
                    required
                    value={rentalForm.dailyPriceXof}
                    onChange={(e) => setRentalForm({ ...rentalForm, dailyPriceXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Caution (XOF)</label>
                  <input
                    type="number"
                    value={rentalForm.depositXof}
                    onChange={(e) => setRentalForm({ ...rentalForm, depositXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantité Totale</label>
                  <input
                    type="number"
                    min="1"
                    value={rentalForm.totalQuantity}
                    onChange={(e) => setRentalForm({ ...rentalForm, totalQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantité Dispo</label>
                  <input
                    type="number"
                    min="0"
                    value={rentalForm.availableQuantity}
                    onChange={(e) => setRentalForm({ ...rentalForm, availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Fiche technique / Détails</label>
                <textarea
                  rows={2}
                  value={rentalForm.specs || ""}
                  onChange={(e) => setRentalForm({ ...rentalForm, specs: e.target.value })}
                  placeholder="Capacité, options incluses, état..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo du Véhicule / Matériel (URL)</label>
                <input
                  type="url"
                  required
                  value={rentalForm.imageUrl}
                  onChange={(e) => setRentalForm({ ...rentalForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
                {rentalForm.imageUrl && (
                  <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img src={rentalForm.imageUrl} alt="Aperçu location" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRentalModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRAITEUR */}
      {cateringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingCatering ? "Modifier le Forfait Traiteur" : "Créer un Forfait Traiteur"}
              </h3>
              <button onClick={() => setCateringModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingCatering) {
                  setCateringFormulas((prev) =>
                    prev.map((c) => (c.id === editingCatering.id ? ({ ...c, ...cateringForm } as CateringRecord) : c))
                  );
                } else {
                  const newCat: CateringRecord = {
                    id: `cat-${Date.now()}`,
                    name: cateringForm.name || "Nouvelle Formule",
                    pricePerPersonXof: Number(cateringForm.pricePerPersonXof) || 12000,
                    minGuests: Number(cateringForm.minGuests) || 25,
                    inclusions: cateringForm.inclusions || ["Buffet complet"],
                    serviceLevel: cateringForm.serviceLevel || "Clé en main",
                    imageUrl: cateringForm.imageUrl || "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
                  };
                  setCateringFormulas((prev) => [newCat, ...prev]);
                }
                setCateringModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nom de la formule traiteur</label>
                <input
                  type="text"
                  required
                  value={cateringForm.name}
                  onChange={(e) => setCateringForm({ ...cateringForm, name: e.target.value })}
                  placeholder="Ex: Buffet Royal Terroir"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix par personne (XOF)</label>
                  <input
                    type="number"
                    required
                    value={cateringForm.pricePerPersonXof}
                    onChange={(e) => setCateringForm({ ...cateringForm, pricePerPersonXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Minimum de convives</label>
                  <input
                    type="number"
                    value={cateringForm.minGuests}
                    onChange={(e) => setCateringForm({ ...cateringForm, minGuests: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo du Buffet / Traiteur (URL)</label>
                <input
                  type="url"
                  required
                  value={cateringForm.imageUrl}
                  onChange={(e) => setCateringForm({ ...cateringForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
                {cateringForm.imageUrl && (
                  <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img src={cateringForm.imageUrl} alt="Aperçu traiteur" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCateringModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-white shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERSONNEL */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingStaff ? "Modifier le Collaborateur" : "Nouveau Collaborateur"}
              </h3>
              <button onClick={() => setStaffModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const prop = SEED_PROPERTIES.find((p) => p.id === staffForm.propertyId) || SEED_PROPERTIES[0];
                if (editingStaff) {
                  setStaffList((prev) =>
                    prev.map((s) => (s.id === editingStaff.id ? ({ ...s, ...staffForm, propertyName: prop.name } as StaffRecord) : s))
                  );
                } else {
                  const newStaff: StaffRecord = {
                    id: `stf-${Date.now()}`,
                    fullName: staffForm.fullName || "Collaborateur",
                    email: staffForm.email || `agent.${Date.now()}@hotel-levignoble.bj`,
                    roleName: staffForm.roleName || "Réceptionniste",
                    roleCode: staffForm.roleCode || "RECEPTIONIST",
                    propertyName: prop.name,
                    propertyId: prop.id,
                    maxDiscount: staffForm.maxDiscount || "10",
                    phone: staffForm.phone || "+229 97 00 00 00",
                    status: "ACTIF",
                    avatarUrl: staffForm.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                  };
                  setStaffList((prev) => [newStaff, ...prev]);
                }
                setStaffModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nom & Prénom</label>
                  <input
                    type="text"
                    required
                    value={staffForm.fullName}
                    onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                    placeholder="M. Gaston Dossou"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    required
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Rôle</label>
                  <select
                    value={staffForm.roleCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const name =
                        code === "PROPERTY_MANAGER"
                          ? "Gérant d'Agence"
                          : code === "CASHIER"
                          ? "Caissier"
                          : code === "WAITSTAFF"
                          ? "Serveuse"
                          : code === "CHEF"
                          ? "Chef Cuisinier"
                          : "Réceptionniste";
                      setStaffForm({ ...staffForm, roleCode: code, roleName: name });
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="RECEPTIONIST">Réceptionniste</option>
                    <option value="PROPERTY_MANAGER">Gérant d&apos;Agence</option>
                    <option value="CASHIER">Caissier</option>
                    <option value="WAITSTAFF">Serveuse / Serveur</option>
                    <option value="CHEF">Chef Cuisinier</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Agence Affectée</label>
                  <select
                    disabled={isManager}
                    value={staffForm.propertyId || ""}
                    onChange={(e) => setStaffForm({ ...staffForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white disabled:opacity-75"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo / Avatar (URL)</label>
                <input
                  type="url"
                  required
                  value={staffForm.avatarUrl}
                  onChange={(e) => setStaffForm({ ...staffForm, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] font-semibold text-white shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRESORERIE */}
      {treasuryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                Enregistrer un Mouvement de Trésorerie
              </h3>
              <button onClick={() => setTreasuryModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const targetAcc = treasuryAccounts.find((a) => a.id === treasuryForm.accountId) || treasuryAccounts[0];
                const delta = treasuryForm.type === "ENTREE" ? treasuryForm.amountXof : -treasuryForm.amountXof;
                setTreasuryAccounts((prev) =>
                  prev.map((a) => (a.id === targetAcc.id ? { ...a, balanceXof: a.balanceXof + delta } : a))
                );
                const newTx: CashTransaction = {
                  id: `tx-${Date.now()}`,
                  date: "À l'instant",
                  label: treasuryForm.label || "Mouvement de trésorerie",
                  type: treasuryForm.type,
                  amountXof: treasuryForm.amountXof,
                  accountId: targetAcc.id,
                  accountLabel: targetAcc.label,
                  category: treasuryForm.category,
                };
                setCashTransactions((prev) => [newTx, ...prev]);
                setTreasuryModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Sens de l&apos;opération</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTreasuryForm({ ...treasuryForm, type: "ENTREE" })}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      treasuryForm.type === "ENTREE"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-stone-50 border-stone-200 text-stone-600"
                    }`}
                  >
                    + Entrée (Recette)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTreasuryForm({ ...treasuryForm, type: "SORTIE" })}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      treasuryForm.type === "SORTIE"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-stone-50 border-stone-200 text-stone-600"
                    }`}
                  >
                    - Sortie (Dépense)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Montant (XOF)</label>
                <input
                  type="number"
                  required
                  value={treasuryForm.amountXof}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, amountXof: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-black text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Compte concerné</label>
                <select
                  value={treasuryForm.accountId}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  {treasuryAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} ({a.balanceXof.toLocaleString("fr-FR")} XOF)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Motif / Libellé</label>
                <input
                  type="text"
                  required
                  value={treasuryForm.label}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, label: e.target.value })}
                  placeholder="Ex: Achat carburant ou acompte réservation"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setTreasuryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 font-semibold text-white shadow-md"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERMANENCE / GARDE D'ASTREINTE */}
      {dutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                Planifier une Permanence ou Garde de Nuit
              </h3>
              <button onClick={() => setDutyModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const prop = SEED_PROPERTIES.find((p) => p.id === dutyForm.propertyId) || SEED_PROPERTIES[0];
                const selectedStaffId = (dutyForm as any).selectedStaffId || staffList[0]?.id;
                const assignedStaffMember = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

                const newRoster: DutyRosterRecord = {
                  id: `dr-${Date.now()}`,
                  title: dutyForm.title || "Permanence Opérationnelle",
                  propertyId: prop.id,
                  propertyName: prop.name,
                  shift: (dutyForm.shift as any) || "NUIT",
                  date: dutyForm.date || new Date().toISOString().split("T")[0],
                  assignedStaff: assignedStaffMember
                    ? [
                        {
                          userId: assignedStaffMember.id,
                          userName: assignedStaffMember.fullName,
                          roleName: assignedStaffMember.roleName,
                        },
                      ]
                    : [],
                  instructions: dutyForm.instructions || "Assurer la sécurité et l'accueil en continu.",
                  status: (dutyForm.status as any) || "PLANIFIE",
                };

                setDutyRosters((prev) => [newRoster, ...prev]);

                // Also update or add attendance entry for this staff
                if (assignedStaffMember) {
                  setAttendances((prev) => [
                    {
                      id: `att-${Date.now()}`,
                      userId: assignedStaffMember.id,
                      userName: assignedStaffMember.fullName,
                      userRole: assignedStaffMember.roleName,
                      propertyId: prop.id,
                      propertyName: prop.name,
                      shift: newRoster.shift,
                      date: newRoster.date,
                      status: "EN_GARDE",
                      notes: `Planifié sur la permanence : ${newRoster.title}`,
                    },
                    ...prev,
                  ]);
                }

                setDutyModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Intitulé de la Garde / Permanence</label>
                <input
                  type="text"
                  required
                  value={dutyForm.title}
                  onChange={(e) => setDutyForm({ ...dutyForm, title: e.target.value })}
                  placeholder="Ex: Garde Nuit & Accueil VIP Bohicon"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Établissement / Site</label>
                  <select
                    value={dutyForm.propertyId}
                    onChange={(e) => setDutyForm({ ...dutyForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quart / Rotation</label>
                  <select
                    value={dutyForm.shift}
                    onChange={(e) => setDutyForm({ ...dutyForm, shift: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="MATIN">🌅 Quart Matin (07h-15h)</option>
                    <option value="SOIR">🌇 Quart Soir (15h-23h)</option>
                    <option value="NUIT">🌙 Garde de Nuit (23h-07h)</option>
                    <option value="ASTREINTE">🚨 Astreinte & Urgence (24h/24)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dutyForm.date}
                    onChange={(e) => setDutyForm({ ...dutyForm, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Collaborateur de garde</label>
                  <select
                    value={(dutyForm as any).selectedStaffId || staffList[0]?.id || ""}
                    onChange={(e) => setDutyForm({ ...dutyForm, selectedStaffId: e.target.value } as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {staffList.map((stf) => (
                      <option key={stf.id} value={stf.id}>
                        {stf.fullName} ({stf.roleName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Consignes & Instructions Opérationnelles</label>
                <textarea
                  rows={3}
                  required
                  value={dutyForm.instructions}
                  onChange={(e) => setDutyForm({ ...dutyForm, instructions: e.target.value })}
                  placeholder="Ex: Accueil arrivées tardives, vérification extinction éclairages extérieurs, surveillance clé passe-partout..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDutyModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] font-semibold text-white shadow-md"
                >
                  Enregistrer la Permanence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COMMANDE */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                Enregistrer une Nouvelle Commande
              </h3>
              <button onClick={() => setOrderModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const prop = SEED_PROPERTIES.find((p) => p.id === orderForm.propertyId) || SEED_PROPERTIES[0];
                const newOrder: OrderRecord = {
                  id: `ord-${Date.now()}`,
                  orderNumber: `CMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  propertyId: prop.id,
                  propertyName: prop.name,
                  orderType: (orderForm.orderType as any) || "REPAS_BOISSON",
                  clientName: orderForm.clientName || "Client Comptoir",
                  clientPhone: orderForm.clientPhone || "+229 97 00 00 00",
                  itemsSummary: orderForm.itemsSummary || "Consommation directe",
                  totalAmountXof: Number(orderForm.totalAmountXof) || 10000,
                  status: (orderForm.status as any) || "EN_ATTENTE",
                  origin: (orderForm.origin as any) || "SERVEUSE",
                  createdAt: "À l'instant",
                };
                setOrders((prev) => [newOrder, ...prev]);
                setOrderModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prestation</label>
                  <select
                    value={orderForm.orderType}
                    onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="REPAS_BOISSON">Restauration & Bar</option>
                    <option value="RESERVATION_CHAMBRE">Hébergement / Chambre</option>
                    <option value="CAVE_A_VIN">Cave à Vin & Spiritueux</option>
                    <option value="LOCATION_MATERIEL">Location Matériel/Véhicule</option>
                    <option value="SERVICE_TRAITEUR">Service Traiteur</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Établissement</label>
                  <select
                    disabled={isManager}
                    value={orderForm.propertyId}
                    onChange={(e) => setOrderForm({ ...orderForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white disabled:opacity-75"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nom du Client / Hôte</label>
                  <input
                    type="text"
                    required
                    value={orderForm.clientName}
                    onChange={(e) => setOrderForm({ ...orderForm, clientName: e.target.value })}
                    placeholder="M. Bio KANHO"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Téléphone Client</label>
                  <input
                    type="tel"
                    required
                    value={orderForm.clientPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, clientPhone: e.target.value })}
                    placeholder="+229 97 12 34 56"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Détails des Articles / Prestations</label>
                <textarea
                  rows={2}
                  required
                  value={orderForm.itemsSummary}
                  onChange={(e) => setOrderForm({ ...orderForm, itemsSummary: e.target.value })}
                  placeholder="Ex: 2x Pintade braisée royale, 1x Bouteille Château Margaux, 2x Eau minérale Possotomè"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Montant Total (XOF)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={orderForm.totalAmountXof}
                    onChange={(e) => setOrderForm({ ...orderForm, totalAmountXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Statut Initial</label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="VALIDEE">Validée</option>
                    <option value="EN_PREPARATION">En préparation</option>
                    <option value="LIVREE">Livrée</option>
                    <option value="PAYEE">Payée</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Canal Émetteur</label>
                  <select
                    value={orderForm.origin}
                    onChange={(e) => setOrderForm({ ...orderForm, origin: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="SERVEUSE">Serveuse</option>
                    <option value="RECEPTION">Réception</option>
                    <option value="CLIENT_SITE_WEB">Client Web</option>
                    <option value="ROOM_SERVICE">Room Service</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 font-semibold text-white shadow-md"
                >
                  Valider la Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EVENEMENT */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingEvent ? "Modifier l'Évènement" : "Programmer un Nouvel Évènement"}
              </h3>
              <button onClick={() => setEventModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const prop = SEED_PROPERTIES.find((p) => p.id === eventForm.propertyId) || SEED_PROPERTIES[0];
                if (editingEvent) {
                  setHotelEvents((prev) =>
                    prev.map((ev) =>
                      ev.id === editingEvent.id
                        ? ({ ...ev, ...eventForm, propertyName: prop.name } as HotelEventRecord)
                        : ev
                    )
                  );
                } else {
                  const newEvent: HotelEventRecord = {
                    id: `evt-${Date.now()}`,
                    title: eventForm.title || "Soirée Prestige Le Vignoble",
                    category: (eventForm.category as any) || "BRUNCH",
                    propertyId: prop.id,
                    propertyName: prop.name,
                    date: eventForm.date || new Date().toISOString().split("T")[0],
                    startTime: eventForm.startTime || "12:00",
                    endTime: eventForm.endTime || "17:00",
                    expectedGuests: Number(eventForm.expectedGuests) || 40,
                    pricePerPersonXof: Number(eventForm.pricePerPersonXof) || 18000,
                    description: eventForm.description || "Évènement gastronomique et convivial au cœur de notre établissement.",
                    imageUrl: eventForm.imageUrl || "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
                    tags: Array.isArray(eventForm.tags) ? eventForm.tags : ["#LeVignobleEvents"],
                    status: (eventForm.status as any) || "PLANIFIE",
                  };
                  setHotelEvents((prev) => [newEvent, ...prev]);
                }
                setEventModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Titre de l&apos;Évènement</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Ex: Grand Brunch Royal du Dimanche"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="BRUNCH">Brunch Gastronomique</option>
                    <option value="SOIREE_PRESTIGE">Soirée Prestige</option>
                    <option value="SEMINAIRE">Séminaire Exécutif</option>
                    <option value="ATELIER">Atelier / Workshop</option>
                    <option value="MARIAGE">Mariage & Cérémonie</option>
                    <option value="GALA">Gala Officiel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Établissement Hôte</label>
                  <select
                    disabled={isManager}
                    value={eventForm.propertyId}
                    onChange={(e) => setEventForm({ ...eventForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white disabled:opacity-75"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Heure Début</label>
                  <input
                    type="time"
                    required
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Heure Fin</label>
                  <input
                    type="time"
                    required
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tarif / Personne (XOF)</label>
                  <input
                    type="number"
                    min={0}
                    value={eventForm.pricePerPersonXof}
                    onChange={(e) => setEventForm({ ...eventForm, pricePerPersonXof: Number(e.target.value) })}
                    placeholder="0 si libre / sur devis"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Capacité Invités</label>
                  <input
                    type="number"
                    min={5}
                    value={eventForm.expectedGuests}
                    onChange={(e) => setEventForm({ ...eventForm, expectedGuests: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo d&apos;Illustration (URL)</label>
                <input
                  type="url"
                  required
                  value={eventForm.imageUrl}
                  onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description Détaillée</label>
                <textarea
                  rows={3}
                  required
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Présentation du menu, animations, intervenants ou modalités d'accès..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 font-semibold text-white shadow-md"
                >
                  {editingEvent ? "Sauvegarder" : "Publier l'Évènement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MUTATION (DAF & PROMOTEUR) */}
      {mutationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Muter un Collaborateur</h3>
                  <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                    Privilège Exclusif DAF & Promoteur
                  </span>
                </div>
              </div>
              <button onClick={() => setMutationModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const staffTarget = staffList.find((s) => s.id === mutationForm.staffId) || staffList[0];
                const targetProp = SEED_PROPERTIES.find((p) => p.id === mutationForm.toPropertyId) || SEED_PROPERTIES[0];

                // 1. Update staffList in place
                setStaffList((prev) =>
                  prev.map((s) =>
                    s.id === staffTarget.id
                      ? {
                          ...s,
                          propertyId: targetProp.id,
                          propertyName: targetProp.name,
                          roleName: mutationForm.toRoleName || s.roleName,
                        }
                      : s
                  )
                );

                // 2. Add record to mutations
                const newMutation: StaffMutationRecord = {
                  id: `mut-${Date.now()}`,
                  staffId: staffTarget.id,
                  staffName: staffTarget.fullName,
                  fromPropertyId: staffTarget.propertyId || "prop-bohicon-001",
                  fromPropertyName: staffTarget.propertyName,
                  toPropertyId: targetProp.id,
                  toPropertyName: targetProp.name,
                  fromRoleName: staffTarget.roleName,
                  toRoleName: mutationForm.toRoleName || staffTarget.roleName,
                  effectiveDate: mutationForm.effectiveDate || new Date().toISOString().split("T")[0],
                  decisionMaker: activeUser?.fullName ? `${activeUser.fullName} (${activeUser.roleCode === "PROMOTER" ? "Promoteur" : "DAF"})` : "Direction Générale (Eddy GNACADJA)",
                  reason: mutationForm.reason || "Optimisation des compétences régionales",
                  status: "EFFECTIVE",
                };
                setMutations((prev) => [newMutation, ...prev]);
                setMutationModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Collaborateur à muter</label>
                <select
                  value={mutationForm.staffId}
                  onChange={(e) => setMutationForm({ ...mutationForm, staffId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.fullName} — {stf.roleName} ({stf.propertyName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nouvel Établissement</label>
                  <select
                    value={mutationForm.toPropertyId}
                    onChange={(e) => setMutationForm({ ...mutationForm, toPropertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nouvelle Fonction / Poste</label>
                  <input
                    type="text"
                    required
                    value={mutationForm.toRoleName}
                    onChange={(e) => setMutationForm({ ...mutationForm, toRoleName: e.target.value })}
                    placeholder="Ex: Gérant d'Agence, Chef de Réception..."
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Date d&apos;Effet</label>
                <input
                  type="date"
                  required
                  value={mutationForm.effectiveDate}
                  onChange={(e) => setMutationForm({ ...mutationForm, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Motif Stratégique de la Mutation</label>
                <textarea
                  rows={3}
                  required
                  value={mutationForm.reason}
                  onChange={(e) => setMutationForm({ ...mutationForm, reason: e.target.value })}
                  placeholder="Justification RH : Renfort de l'équipe de Bohicon, promotion, permutation de postes..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-[11px] space-y-1">
                <div className="font-bold">Effet immédiat de la validation :</div>
                <p>• Mise à jour instantanée du profil collaborateur dans le système.</p>
                <p>• Notification officielle expédiée à l&apos;agent, aux deux gérants de site et au DAF.</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setMutationModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 font-semibold text-white shadow-md"
                >
                  Valider la Mutation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOTATION DU PERSONNEL PAR LE CLIENT */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Avis Client & Notation de l&apos;Agent</h3>
                  <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                    Diffusion Multi-Rôles Instantanée
                  </span>
                </div>
              </div>
              <button onClick={() => setRatingModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const staffTarget = staffList.find((s) => s.id === ratingForm.staffId) || staffList[0];
                const newRating: StaffRatingRecord = {
                  id: `rat-${Date.now()}`,
                  staffId: staffTarget.id,
                  staffName: staffTarget.fullName,
                  staffRole: staffTarget.roleName,
                  propertyId: staffTarget.propertyId || "prop-bohicon-001",
                  propertyName: staffTarget.propertyName,
                  clientName: ratingForm.clientName || "Hôte Résident",
                  clientEmail: ratingForm.clientEmail || "client@hotelgest.bj",
                  serviceCategory: ratingForm.serviceCategory || "ACCUEIL_RECEPTION",
                  rating: Number(ratingForm.rating) || 5,
                  comment: ratingForm.comment || "Service irréprochable et grande politesse.",
                  date: "À l'instant",
                  notifiedRoles: ["Promoteur", "DAF", `Gérant ${staffTarget.propertyName.split(" - ")[1]}`, staffTarget.fullName],
                };
                setRatings((prev) => [newRating, ...prev]);
                setRatingModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Collaborateur Évalué</label>
                <select
                  value={ratingForm.staffId}
                  onChange={(e) => setRatingForm({ ...ratingForm, staffId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
                >
                  {filteredStaff.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.fullName} — {stf.roleName} ({stf.propertyName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Département / Service Évalué</label>
                  <select
                    value={ratingForm.serviceCategory}
                    onChange={(e) => setRatingForm({ ...ratingForm, serviceCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="ACCUEIL_RECEPTION">Accueil & Réception</option>
                    <option value="SERVICE_CHAMBRE">Service de Chambre / Étage</option>
                    <option value="RESTAURATION_BAR">Restauration & Bar</option>
                    <option value="CHAUFFEUR_VIP">Chauffeur Privé & Navette</option>
                    <option value="SERVICE_TRAITEUR">Service Traiteur</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Note Attribuée (Étoiles)</label>
                  <select
                    value={ratingForm.rating}
                    onChange={(e) => setRatingForm({ ...ratingForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-bold text-amber-700"
                  >
                    <option value="5">★★★★★ (5/5) — Exceptionnel</option>
                    <option value="4">★★★★☆ (4/5) — Très Bien</option>
                    <option value="3">★★★☆☆ (3/5) — Moyen</option>
                    <option value="2">★★☆☆☆ (2/5) — Décevant</option>
                    <option value="1">★☆☆☆☆ (1/5) — Inacceptable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nom du Client</label>
                  <input
                    type="text"
                    required
                    value={ratingForm.clientName}
                    onChange={(e) => setRatingForm({ ...ratingForm, clientName: e.target.value })}
                    placeholder="M. Laurent DOSSOU"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Client (Optionnel)</label>
                  <input
                    type="email"
                    value={ratingForm.clientEmail}
                    onChange={(e) => setRatingForm({ ...ratingForm, clientEmail: e.target.value })}
                    placeholder="laurent.d@gmail.com"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Témoignage / Commentaire de l&apos;Hôte</label>
                <textarea
                  rows={3}
                  required
                  value={ratingForm.comment}
                  onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                  placeholder="Partagez vos impressions sur le service, l'amabilité, la propreté, la ponctualité..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-600" /> Dispatch automatique des alertes :
                </div>
                <p>1. <strong>Promoteur</strong> (Eddy GNACADJA) : Alerte cockpit en direct.</p>
                <p>2. <strong>Collaborateur</strong> : Avis visible sur son tableau de bord personnel.</p>
                <p>3. <strong>DAF</strong> : Pris en compte pour les primes de performance mensuelles.</p>
                <p>4. <strong>Gérant du site</strong> : Suivi qualité immédiat pour l&apos;agence concernée.</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRatingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 font-semibold text-white shadow-md"
                >
                  Enregistrer l&apos;Avis & Notifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTION DES STOCKS MULTI-SITES (PROMOTEUR & GÉRANT) */}
      {stockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingStock ? "Ajuster / Réapprovisionner Stock" : "Nouvel Article de Stock Multi-Sites"}
              </h3>
              <button onClick={() => setStockModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const prop = SEED_PROPERTIES.find((p) => p.id === stockForm.propertyId) || SEED_PROPERTIES[0];
                if (editingStock) {
                  setStocks((prev) =>
                    prev.map((s) =>
                      s.id === editingStock.id
                        ? ({ ...s, ...stockForm, propertyName: prop.name } as StockItemRecord)
                        : s
                    )
                  );
                } else {
                  const newStock: StockItemRecord = {
                    id: `stk-${Date.now()}`,
                    sku: stockForm.sku || `STK-${Date.now().toString().slice(-4)}`,
                    name: stockForm.name || "Nouvel Article Stock",
                    category: (stockForm.category as any) || "VIVRES_CUISINE",
                    propertyId: prop.id,
                    propertyName: prop.name,
                    unitMeasure: stockForm.unitMeasure || "Kg",
                    currentQuantity: Number(stockForm.currentQuantity) || 10,
                    alertThreshold: Number(stockForm.alertThreshold) || 5,
                    securityThreshold: Number(stockForm.securityThreshold) || 2,
                    unitCostXof: Number(stockForm.unitCostXof) || 5000,
                    storageLocation: stockForm.storageLocation || "Économat Principal",
                    supplierName: stockForm.supplierName || "Fournisseur Agréé",
                  };
                  setStocks((prev) => [newStock, ...prev]);
                }
                setStockModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Code SKU / Référence</label>
                  <input
                    type="text"
                    required
                    value={stockForm.sku}
                    onChange={(e) => setStockForm({ ...stockForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Établissement / Site</label>
                  <select
                    disabled={isManager}
                    value={stockForm.propertyId}
                    onChange={(e) => setStockForm({ ...stockForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white disabled:opacity-75"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Désignation de l&apos;Article</label>
                <input
                  type="text"
                  required
                  value={stockForm.name}
                  onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                  placeholder="Ex: Riz Parfumé Long Grain 25kg, Serviettes Éponge Blanches..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie de Stock</label>
                  <select
                    value={stockForm.category}
                    onChange={(e) => setStockForm({ ...stockForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="CAVE_A_VIN">🍷 Cave à Vin & Crus</option>
                    <option value="BOISSON_BAR">🍹 Boissons Bar & Restaurant</option>
                    <option value="VIVRES_CUISINE">🍗 Vivres & Denrées Cuisine</option>
                    <option value="LINGERIE_CHAMBRE">🛏️ Lingerie & Matériel Chambres</option>
                    <option value="PRODUIT_ENTRETIEN">🧼 Produits d&apos;Entretien & Hygiène</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unité de Mesure</label>
                  <select
                    value={stockForm.unitMeasure}
                    onChange={(e) => setStockForm({ ...stockForm, unitMeasure: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Kg">Kg (Kilogrammes)</option>
                    <option value="Bouteilles">Bouteilles</option>
                    <option value="Cartons">Cartons</option>
                    <option value="Sacs 25kg">Sacs 25kg</option>
                    <option value="Litres">Litres / Bidons</option>
                    <option value="Pièces">Pièces / Unités</option>
                    <option value="Rouleaux">Rouleaux</option>
                    <option value="Lots">Lots</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantité Actuelle</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={stockForm.currentQuantity}
                    onChange={(e) => setStockForm({ ...stockForm, currentQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-700 mb-1">Seuil Alerte 🟠</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={stockForm.alertThreshold}
                    onChange={(e) => setStockForm({ ...stockForm, alertThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-amber-50/50 font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-rose-700 mb-1">Seuil Sécurité 🔴</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={stockForm.securityThreshold}
                    onChange={(e) => setStockForm({ ...stockForm, securityThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-rose-300 rounded-xl bg-rose-50/50 font-bold text-rose-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Coût Unitaire (XOF)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockForm.unitCostXof}
                    onChange={(e) => setStockForm({ ...stockForm, unitCostXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-[#184f28]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Lieu de Stockage</label>
                  <input
                    type="text"
                    value={stockForm.storageLocation}
                    onChange={(e) => setStockForm({ ...stockForm, storageLocation: e.target.value })}
                    placeholder="Ex: Économat Principal, Cave..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Fournisseur Référencé (Optionnel)</label>
                <input
                  type="text"
                  value={stockForm.supplierName || ""}
                  onChange={(e) => setStockForm({ ...stockForm, supplierName: e.target.value })}
                  placeholder="Ex: Ferme Avicole du Zou, Brasserie Sobebra..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] font-semibold text-white shadow-md"
                >
                  {editingStock ? "Mettre à jour le Stock" : "Enregistrer l'Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ATTRIBUTION DES RÔLES ET ATTRIBUTS DU PERSONNEL */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Modifier Rôle et Habilitations
                </h3>
                <p className="text-xs text-stone-500">
                  {roleForm.fullName} ({roleForm.email})
                </p>
              </div>
              <button onClick={() => setRoleModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const prop = SEED_PROPERTIES.find((p) => p.id === roleForm.propertyId) || SEED_PROPERTIES[0];
                if (editingRoleAssignment) {
                  setStaffRoleAssignments((prev) =>
                    prev.map((a) =>
                      a.id === editingRoleAssignment.id
                        ? ({
                            ...a,
                            ...roleForm,
                            propertyName: prop.name,
                          } as StaffRoleRecord)
                        : a
                    )
                  );
                }
                setRoleModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Poste & Rôle Attribué</label>
                  <select
                    value={roleForm.roleCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      let roleName = "Collaborateur";
                      if (code === "PROMOTER") roleName = "Promoteur";
                      else if (code === "FINANCIAL_DIRECTOR") roleName = "Directeur Administratif & Financier (DAF)";
                      else if (code === "PROPERTY_MANAGER") roleName = "Gérant d'Agence";
                      else if (code === "RECEPTIONIST") roleName = "Chef de Réception";
                      else if (code === "WAITSTAFF") roleName = "Serveur(se) Restaurant & Bar";
                      else if (code === "BARMAN") roleName = "Barman / Chef Bar";
                      else if (code === "CHEF_CUISINE") roleName = "Chef de Cuisine";
                      else if (code === "HOUSEKEEPING") roleName = "Gouvernante / Valet";
                      else if (code === "DRIVER_LOGISTICS") roleName = "Chauffeur & Logistique";

                      setRoleForm({
                        ...roleForm,
                        roleCode: code,
                        roleName,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-semibold"
                  >
                    <option value="PROMOTER">Promoteur (Groupe)</option>
                    <option value="FINANCIAL_DIRECTOR">DAF (Finance & Audit)</option>
                    <option value="PROPERTY_MANAGER">Gérant d&apos;Agence</option>
                    <option value="RECEPTIONIST">Réceptionniste</option>
                    <option value="WAITSTAFF">Serveur(se) Restaurant & Bar</option>
                    <option value="BARMAN">Barman / Caviste</option>
                    <option value="CHEF_CUISINE">Chef de Cuisine</option>
                    <option value="HOUSEKEEPING">Gouvernante / Étage</option>
                    <option value="DRIVER_LOGISTICS">Chauffeur / Navette VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Établissement d&apos;Affectation</label>
                  <select
                    value={roleForm.propertyId}
                    onChange={(e) => setRoleForm({ ...roleForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Plafond de Remise Commerciale Autorisée (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={roleForm.maxDiscount ?? 0}
                  onChange={(e) => setRoleForm({ ...roleForm, maxDiscount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-stone-800"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Remise maximale accordée sur factures sans visa obligatoire de la direction.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-2">
                  Habilitations & Accès Modulaires
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                  {[
                    { key: "pmsReservations", label: "PMS Chambres & Planning" },
                    { key: "posOrderTaking", label: "Prise de Commandes POS" },
                    { key: "kitchenKds", label: "Écran KDS Cuisine" },
                    { key: "barKds", label: "Écran KDS Bar" },
                    { key: "cashFinance", label: "Encaissements & Caisse" },
                    { key: "hallBooking", label: "Salles Conférences & Fêtes" },
                    { key: "equipmentCatering", label: "Matériel & Traiteur" },
                    { key: "reportsTreasury", label: "Rapports & Audit Trésorerie" },
                    { key: "stocksManage", label: "Gestion des Stocks Multi-sites" },
                    { key: "intersiteMessaging", label: "Messagerie Inter-agences" },
                  ].map(({ key, label }) => {
                    const currentRights = roleForm.rights || {
                      pmsReservations: false,
                      posOrderTaking: false,
                      kitchenKds: false,
                      barKds: false,
                      cashFinance: false,
                      hallBooking: false,
                      equipmentCatering: false,
                      reportsTreasury: false,
                      intersiteMessaging: false,
                      stocksManage: false,
                    };
                    const isChecked = !!(currentRights as any)[key];
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all ${
                          isChecked
                            ? "bg-white border-blue-500 text-stone-900 shadow-xs font-semibold"
                            : "bg-white/60 border-stone-200/60 text-stone-500 hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setRoleForm({
                              ...roleForm,
                              rights: {
                                ...currentRights,
                                [key]: !isChecked,
                              },
                            });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md"
                >
                  Enregistrer les Habilitations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkspaceDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-stone-400">
          <div className="w-8 h-8 border-4 border-[#184f28] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Chargement du cockpit analytique...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
