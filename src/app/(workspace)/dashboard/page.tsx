"use client";

import React, { useState, Suspense } from "react";
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
} from "lucide-react";
import {
  SEED_PROPERTIES,
  SEED_USERS,
} from "@/lib/db/seed";

// Types
export interface RoomRecord {
  id: string;
  number: string;
  name: string;
  propertyId: string;
  propertyName: string;
  type: "STANDARD" | "SUPERIEURE" | "SUITE_ROYALE" | "PAVILLON";
  basePriceXof: number;
  capacity: number;
  amenities: string[];
  status: "DISPONIBLE" | "OCCUPEE" | "RESERVEE" | "NETTOYAGE" | "MAINTENANCE";
  imageUrl: string;
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
      amenities: ["Lit King-Size", "Jacuzzi Privé", "Salon VIP", "Climatisation", "Wi-Fi Dédié"],
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
      amenities: ["Balcon vue piscine", "Mini-bar", "Bureau de travail", "Wi-Fi Fibre"],
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
      amenities: ["Lit Queen-Size", "Vue Jardin", "Room Service 24h"],
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
      amenities: ["Climatisation", "Douche italienne"],
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
      amenities: ["Climatisation", "TV Canal+", "Douche à l'italienne"],
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
      amenities: ["Mobilier artisanal royal", "Salon privé", "Terrasse panoramique"],
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
      amenities: ["Vue sur la Place Goho", "Climatisation inverter"],
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
      amenities: ["Ventilation & Climatisation", "Wi-Fi"],
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
      amenities: ["2 Chambres communicantes", "Terrasse privative", "Coin salon"],
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
      amenities: ["Bureau de travail ergonomique", "Wi-Fi Très Haut Débit"],
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
      amenities: ["Vue sur la cocoteraie", "Bordure de piscine", "Calme absolu"],
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
      amenities: ["Climatisation", "Smart TV", "Literie orthopédique"],
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
    amenities: ["Climatisation", "Wi-Fi"],
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

  // Filtered lists for individual views
  const filteredRooms = rooms.filter((r) => {
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
                setEditingRoom(null);
                setRoomForm({
                  number: `${rooms.length + 101}`,
                  name: "Nouvelle Suite",
                  propertyId: "prop-bohicon-001",
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
                    <button
                      onClick={() => {
                        if (confirm("Supprimer cette chambre ?")) {
                          setRooms((prev) => prev.filter((r) => r.id !== room.id));
                        }
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                      title="Supprimer la chambre"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
          </div>

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
                setEditingStaff(null);
                setStaffForm({
                  fullName: "",
                  email: "",
                  roleName: "Réceptionniste",
                  roleCode: "RECEPTIONIST",
                  propertyName: "Hôtel Le Vignoble - Bohicon",
                  propertyId: "prop-bohicon-001",
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
                          <button
                            onClick={() => {
                              if (confirm("Enlever ce collaborateur et révoquer ses accès ?")) {
                                setStaffList((prev) => prev.filter((s) => s.id !== stf.id));
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                            title="Enlever le collaborateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                  {cashTransactions.map((tx) => (
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
          SHARED MODALS (CHAMBRE, CAVE, REPAS, LOCATION, TRAITEUR, STAFF, TRESORERIE)
         ========================================================================= */}

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
                    amenities: roomForm.amenities || ["Climatisation", "Wi-Fi"],
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
                    value={roomForm.propertyId}
                    onChange={(e) => setRoomForm({ ...roomForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
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
                  <label className="block font-semibold text-stone-700 mb-1">Capacité (personnes)</label>
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
                    value={staffForm.propertyId || ""}
                    onChange={(e) => setStaffForm({ ...staffForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
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
