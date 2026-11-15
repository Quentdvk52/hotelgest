"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  status: "DISPONIBLE" | "OCCUPEE" | "NETTOYAGE" | "MAINTENANCE";
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

export interface RentalRecord {
  id: string;
  name: string;
  type: "VEHICULE_VIP" | "MATERIEL_EVENEMENT";
  dailyPriceXof: number;
  depositXof: number;
  totalQuantity: number;
  availableQuantity: number;
  specs: string;
  imageUrl: string;
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

export default function PromoterDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "COCKPIT" | "CHAMBRES" | "CAVE" | "REPAS" | "LOCATION" | "TRAITEUR" | "PERSONNEL" | "TRESORERIE" | "CHARIOW"
  >("COCKPIT");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // =========================================================================
  // 1. STATE: CHAMBRES
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
      id: "rm-301",
      number: "301",
      name: "Pavillon Familial Jardin",
      propertyId: "prop-calavi-003",
      propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
      type: "PAVILLON",
      basePriceXof: 65000,
      capacity: 4,
      amenities: ["2 Chambres communicantes", "Terrasse privative", "Coin salon"],
      status: "NETTOYAGE",
      imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  // Modal Room state
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
  // 2. STATE: CAVE A VIN
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

  // Modal Wine state
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
  // 3. STATE: REPAS (RESTAURANT & ACCOMPAGNEMENTS)
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

  // Modal Meal state
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
  // 4. STATE: LOCATION (VEHICULES & MATERIEL)
  // =========================================================================
  const [rentals, setRentals] = useState<RentalRecord[]>([
    {
      id: "r-01",
      name: "Toyota Prado TXL 4x4 Climatisé",
      type: "VEHICULE_VIP",
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
      type: "VEHICULE_VIP",
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
      type: "VEHICULE_VIP",
      dailyPriceXof: 85000,
      depositXof: 100000,
      totalQuantity: 2,
      availableQuantity: 2,
      specs: "Idéal délégations, séminaires et mariages, climatisation double zone, chauffeur expérimenté",
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-04",
      name: "Lot 100 Chaises Napoléon Dorées / Cristal",
      type: "MATERIEL_EVENEMENT",
      dailyPriceXof: 75000,
      depositXof: 50000,
      totalQuantity: 5,
      availableQuantity: 3,
      specs: "Coussins velours blanc immaculé, haute résistance, prestige pour galas et réceptions",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "r-05",
      name: "Chapiteau Stretch Nomade 200m²",
      type: "MATERIEL_EVENEMENT",
      dailyPriceXof: 250000,
      depositXof: 150000,
      totalQuantity: 2,
      availableQuantity: 1,
      specs: "Toile imperméable ignifugée haute couture, mâts en bois massif, montage et démontage inclus",
      imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  // Modal Rental state
  const [rentalModalOpen, setRentalModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalRecord | null>(null);
  const [rentalForm, setRentalForm] = useState<Partial<RentalRecord>>({
    name: "",
    type: "VEHICULE_VIP",
    dailyPriceXof: 75000,
    depositXof: 100000,
    totalQuantity: 1,
    availableQuantity: 1,
    specs: "",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  });

  // =========================================================================
  // 5. STATE: SERVICE TRAITEUR
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

  // Modal Catering state
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
  // 6. STATE: PERSONNEL & DROITS (20 COLLABORATEURS)
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
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
      };
    })
  );

  // Modal Staff state
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
  // 7. STATE: TRESORERIE & COMPTES
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
    {
      id: "tx-04",
      date: "Hier, 18:00",
      label: "Acompte Devis Traiteur Séminaire UAC (TRT-004)",
      type: "ENTREE",
      amountXof: 350000,
      accountId: "acc-boa-01",
      accountLabel: "BOA Bénin",
      category: "Service Traiteur",
    },
  ]);

  // Modal Treasury state
  const [treasuryModalOpen, setTreasuryModalOpen] = useState(false);
  const [treasuryForm, setTreasuryForm] = useState({
    label: "",
    type: "ENTREE" as "ENTREE" | "SORTIE",
    amountXof: 50000,
    accountId: "acc-cash-central",
    category: "Recette",
  });

  // Calculate total treasury
  const totalTreasuryBalance = treasuryAccounts.reduce((acc, curr) => acc + curr.balanceXof, 0);

  // =========================================================================
  // HANDLERS: CHAMBRES CRUD
  // =========================================================================
  const handleOpenCreateRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      number: `${rooms.length + 101}`,
      name: "Nouvelle Suite Supérieure",
      propertyId: "prop-bohicon-001",
      type: "SUPERIEURE",
      basePriceXof: 45000,
      capacity: 2,
      amenities: ["Climatisation", "Wi-Fi Dédié", "Douche italienne"],
      status: "DISPONIBLE",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    });
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: RoomRecord) => {
    setEditingRoom(room);
    setRoomForm(room);
    setRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = SEED_PROPERTIES.find((p) => p.id === roomForm.propertyId) || SEED_PROPERTIES[0];

    if (editingRoom) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === editingRoom.id
            ? ({
                ...r,
                ...roomForm,
                propertyName: prop.name,
              } as RoomRecord)
            : r
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
        imageUrl:
          roomForm.imageUrl ||
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      };
      setRooms((prev) => [newRoom, ...prev]);
    }
    setRoomModalOpen(false);
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm("Confirmez-vous la suppression définitive de cette chambre ?")) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // =========================================================================
  // HANDLERS: CAVE CRUD & REPLENISH
  // =========================================================================
  const handleOpenCreateWine = () => {
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
  };

  const handleOpenEditWine = (wine: WineRecord) => {
    setEditingWine(wine);
    setWineForm(wine);
    setWineModalOpen(true);
  };

  const handleSaveWine = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWine) {
      setWines((prev) =>
        prev.map((w) =>
          w.id === editingWine.id ? ({ ...w, ...wineForm } as WineRecord) : w
        )
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
        imageUrl:
          wineForm.imageUrl ||
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
      };
      setWines((prev) => [newWine, ...prev]);
    }
    setWineModalOpen(false);
  };

  const handleReplenishWineStock = (id: string, delta: number) => {
    setWines((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, stockBottles: Math.max(0, w.stockBottles + delta) } : w
      )
    );
  };

  const handleDeleteWine = (id: string) => {
    if (confirm("Supprimer cette bouteille de la carte de la cave à vin ?")) {
      setWines((prev) => prev.filter((w) => w.id !== id));
    }
  };

  // =========================================================================
  // HANDLERS: REPAS CRUD
  // =========================================================================
  const handleOpenCreateMeal = () => {
    setEditingMeal(null);
    setMealForm({
      name: "",
      category: "PLAT_TRADITIONNEL",
      priceXof: 7500,
      prepTimeMinutes: 20,
      accompaniments: ["Alloco", "Piment frais", "Sauce tomate"],
      description: "",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    });
    setMealModalOpen(true);
  };

  const handleOpenEditMeal = (meal: MealRecord) => {
    setEditingMeal(meal);
    setMealForm(meal);
    setMealModalOpen(true);
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeal) {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === editingMeal.id ? ({ ...m, ...mealForm } as MealRecord) : m
        )
      );
    } else {
      const newMeal: MealRecord = {
        id: `m-${Date.now()}`,
        name: mealForm.name || "Nouveau Plat",
        category: (mealForm.category as any) || "PLAT_TRADITIONNEL",
        priceXof: Number(mealForm.priceXof) || 5000,
        prepTimeMinutes: Number(mealForm.prepTimeMinutes) || 15,
        accompaniments: mealForm.accompaniments || ["Alloco"],
        description: mealForm.description || "Spécialité culinaire du terroir.",
        available: true,
        imageUrl:
          mealForm.imageUrl ||
          "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
      };
      setMeals((prev) => [newMeal, ...prev]);
    }
    setMealModalOpen(false);
  };

  const handleDeleteMeal = (id: string) => {
    if (confirm("Supprimer ce plat de la carte du restaurant ?")) {
      setMeals((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // =========================================================================
  // HANDLERS: LOCATION CRUD
  // =========================================================================
  const handleOpenCreateRental = () => {
    setEditingRental(null);
    setRentalForm({
      name: "",
      type: "VEHICULE_VIP",
      dailyPriceXof: 75000,
      depositXof: 100000,
      totalQuantity: 1,
      availableQuantity: 1,
      specs: "",
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    });
    setRentalModalOpen(true);
  };

  const handleOpenEditRental = (rental: RentalRecord) => {
    setEditingRental(rental);
    setRentalForm(rental);
    setRentalModalOpen(true);
  };

  const handleSaveRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRental) {
      setRentals((prev) =>
        prev.map((r) =>
          r.id === editingRental.id ? ({ ...r, ...rentalForm } as RentalRecord) : r
        )
      );
    } else {
      const newRental: RentalRecord = {
        id: `r-${Date.now()}`,
        name: rentalForm.name || "Nouveau Véhicule ou Matériel",
        type: (rentalForm.type as any) || "VEHICULE_VIP",
        dailyPriceXof: Number(rentalForm.dailyPriceXof) || 50000,
        depositXof: Number(rentalForm.depositXof) || 50000,
        totalQuantity: Number(rentalForm.totalQuantity) || 1,
        availableQuantity: Number(rentalForm.availableQuantity) || 1,
        specs: rentalForm.specs || "Équipement haut standing",
        imageUrl:
          rentalForm.imageUrl ||
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      };
      setRentals((prev) => [newRental, ...prev]);
    }
    setRentalModalOpen(false);
  };

  const handleDeleteRental = (id: string) => {
    if (confirm("Supprimer ce bien du catalogue de location ?")) {
      setRentals((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // =========================================================================
  // HANDLERS: TRAITEUR CRUD
  // =========================================================================
  const handleOpenCreateCatering = () => {
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
  };

  const handleOpenEditCatering = (cat: CateringRecord) => {
    setEditingCatering(cat);
    setCateringForm(cat);
    setCateringModalOpen(true);
  };

  const handleSaveCatering = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCatering) {
      setCateringFormulas((prev) =>
        prev.map((c) =>
          c.id === editingCatering.id ? ({ ...c, ...cateringForm } as CateringRecord) : c
        )
      );
    } else {
      const newCat: CateringRecord = {
        id: `cat-${Date.now()}`,
        name: cateringForm.name || "Nouvelle Formule Traiteur",
        pricePerPersonXof: Number(cateringForm.pricePerPersonXof) || 12000,
        minGuests: Number(cateringForm.minGuests) || 25,
        inclusions: cateringForm.inclusions || ["Buffet complet"],
        serviceLevel: cateringForm.serviceLevel || "Clé en main",
        imageUrl:
          cateringForm.imageUrl ||
          "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
      };
      setCateringFormulas((prev) => [newCat, ...prev]);
    }
    setCateringModalOpen(false);
  };

  const handleDeleteCatering = (id: string) => {
    if (confirm("Supprimer cette formule du service traiteur ?")) {
      setCateringFormulas((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // =========================================================================
  // HANDLERS: PERSONNEL CRUD
  // =========================================================================
  const handleOpenCreateStaff = () => {
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
  };

  const handleOpenEditStaff = (stf: StaffRecord) => {
    setEditingStaff(stf);
    setStaffForm(stf);
    setStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = SEED_PROPERTIES.find((p) => p.id === staffForm.propertyId) || SEED_PROPERTIES[0];
    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? ({
                ...s,
                ...staffForm,
                propertyName: prop.name,
              } as StaffRecord)
            : s
        )
      );
    } else {
      const newStaff: StaffRecord = {
        id: `stf-${Date.now()}`,
        fullName: staffForm.fullName || "Nouveau Collaborateur",
        email: staffForm.email || `collaborateur.${Date.now()}@hotel-levignoble.bj`,
        roleName: staffForm.roleName || "Réceptionniste",
        roleCode: staffForm.roleCode || "RECEPTIONIST",
        propertyName: prop.name,
        propertyId: prop.id,
        maxDiscount: staffForm.maxDiscount || "10",
        phone: staffForm.phone || "+229 97 00 00 00",
        status: "ACTIF",
        avatarUrl:
          staffForm.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      };
      setStaffList((prev) => [newStaff, ...prev]);
    }
    setStaffModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("Enlever ce collaborateur de l'équipe et désactiver ses accès ?")) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // =========================================================================
  // HANDLERS: TRESORERIE
  // =========================================================================
  const handleSaveTreasuryTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAcc = treasuryAccounts.find((a) => a.id === treasuryForm.accountId) || treasuryAccounts[0];

    const delta = treasuryForm.type === "ENTREE" ? treasuryForm.amountXof : -treasuryForm.amountXof;

    // Update account balance
    setTreasuryAccounts((prev) =>
      prev.map((a) => (a.id === targetAcc.id ? { ...a, balanceXof: a.balanceXof + delta } : a))
    );

    // Add transaction to journal
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
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#184f28]/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl shadow-black/40 border border-white/20 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo-vignoble-transparent.png"
                alt="Logo Hôtel Le Vignoble"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">
                  Direction Générale & Promoteur
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#184f28]/60 text-emerald-300 border border-[#184f28] text-[10px] font-bold uppercase">
                  Multi-Sites Live
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
                Espace Exécutif du Promoteur
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Gestion globale des 4 établissements • Bohicon • Abomey • Abomey-Calavi • Zogbodomey
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 flex items-center gap-3 text-xs text-stone-300">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Trésorerie disponible :</span>
              <span className="text-base font-extrabold text-[#d4af37]">
                {totalTreasuryBalance.toLocaleString("fr-FR")} XOF
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-stone-200 pb-2 scrollbar-none">
        {[
          { id: "COCKPIT", label: "Vue Globale", icon: TrendingUp },
          { id: "CHAMBRES", label: "Chambres", icon: Bed, count: rooms.length },
          { id: "CAVE", label: "Cave à Vin & Stocks", icon: Wine, count: wines.length },
          { id: "REPAS", label: "Repas & Carte", icon: UtensilsCrossed, count: meals.length },
          { id: "LOCATION", label: "Location", icon: Car, count: rentals.length },
          { id: "TRAITEUR", label: "Service Traiteur", icon: Sparkles, count: cateringFormulas.length },
          { id: "PERSONNEL", label: "Personnel", icon: Users, count: staffList.length },
          { id: "TRESORERIE", label: "Trésorerie & Comptes", icon: Wallet },
          { id: "CHARIOW", label: "Abonnement Logiciel", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#184f28] text-white shadow-md shadow-[#184f28]/30 scale-[1.02]"
                  : "bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#d4af37]" : "text-stone-400"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: COCKPIT (VUE GLOBALE DU GROUPE)
         ========================================================================= */}
      {activeTab === "COCKPIT" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Occupation Totale
              </span>
              <div className="text-3xl font-black text-stone-900">78%</div>
              <p className="text-xs text-stone-500 mt-1">39 chambres occupées sur 50</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Réservations en Cours
              </span>
              <div className="text-3xl font-black text-blue-600">28 dossiers</div>
              <p className="text-xs text-blue-600 font-medium mt-1">Arrivées prévues : +8 aujourd&apos;hui</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Recettes Consolidées Jour
              </span>
              <div className="text-3xl font-black text-[#184f28]">1 555 000 XOF</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">KkiaPay + Caisse + BOA</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Trésorerie Disponible
              </span>
              <div className="text-3xl font-black text-[#d4af37]">
                {totalTreasuryBalance.toLocaleString("fr-FR")} XOF
              </div>
              <p className="text-xs text-stone-500 mt-1">3 comptes réconciliés</p>
            </div>
          </div>

          {/* Quick Navigation Cards to Key Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveTab("CHAMBRES")}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:border-[#184f28] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#184f28]/10 text-[#184f28] flex items-center justify-center">
                  <Bed className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#184f28] transition-colors" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Gérer les Chambres</h3>
              <p className="text-xs text-stone-500">
                Créer, modifier les prix, ajouter des photos et suivre les états d&apos;occupation.
              </p>
              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between text-xs font-semibold text-stone-700">
                <span>{rooms.length} chambres configurées</span>
                <span className="text-emerald-700">Photos HD incluses</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("CAVE")}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:border-[#8c101c] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#8c101c]/10 text-[#8c101c] flex items-center justify-center">
                  <Wine className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#8c101c] transition-colors" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Cave à Vin & Stocks</h3>
              <p className="text-xs text-stone-500">
                Suivre les niveaux de stock en temps réel, réapprovisionner et éditer les bouteilles.
              </p>
              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between text-xs font-semibold text-stone-700">
                <span>{wines.reduce((a, b) => a + b.stockBottles, 0)} bouteilles en stock</span>
                <span className="text-[#8c101c]">Sommelerie</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("REPAS")}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:border-amber-600 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 transition-colors" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Repas & Accompagnements</h3>
              <p className="text-xs text-stone-500">
                Carte gastronomique du restaurant, créations des plats, prix et photos des mets.
              </p>
              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between text-xs font-semibold text-stone-700">
                <span>{meals.length} plats au menu</span>
                <span className="text-amber-700">Cuisine & Terroir</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CHAMBRES (CRUD COMPLET AVEC PHOTOS & PRIX)
         ========================================================================= */}
      {activeTab === "CHAMBRES" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Gestion des Chambres & Suites ({rooms.length})
              </h2>
              <p className="text-xs text-stone-500">
                Créez, modifiez, ajustez les prix par nuit, mettez à jour les photos et supprimez des chambres.
              </p>
            </div>
            <button
              onClick={handleOpenCreateRoom}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#184f28] hover:bg-[#123c1f] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une Chambre</span>
            </button>
          </div>

          {/* Grid of Rooms with Photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#184f28] transition-all group"
              >
                <div>
                  {/* Room Photo with Badge */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
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
                            : "bg-stone-800/90 text-stone-200"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>

                  {/* Room Details */}
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

                {/* Actions */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditRoom(room)}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-2 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                    title="Supprimer la chambre"
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
          TAB 3: CAVE A VIN & STOCKS (AVEC AJOUT STOCKS, PRIX & PHOTOS)
         ========================================================================= */}
      {activeTab === "CAVE" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Cave à Vin, Champagnes & Gestion des Stocks ({wines.length} Références)
              </h2>
              <p className="text-xs text-stone-500">
                Consultez les stocks en temps réel, ajoutez des bouteilles, réapprovisionnez et éditez les photos.
              </p>
            </div>
            <button
              onClick={handleOpenCreateWine}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8c101c] hover:bg-[#6e0d16] text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Cru / Boisson</span>
            </button>
          </div>

          {/* Wine Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wines.map((wine) => (
              <div
                key={wine.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#8c101c] transition-all group"
              >
                <div>
                  {/* Photo */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={wine.imageUrl}
                      alt={wine.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                        {wine.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md ${
                          wine.stockBottles <= wine.minStockAlert
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-emerald-600/90 text-white"
                        }`}
                      >
                        {wine.stockBottles} bouteilles
                      </span>
                    </div>
                  </div>

                  {/* Wine details */}
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

                {/* Stock replenisher & actions */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span>Réapprovisionner Stock :</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleReplenishWineStock(wine.id, 6)}
                        className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-[11px] hover:bg-[#8c101c] hover:text-white transition-colors"
                      >
                        +6
                      </button>
                      <button
                        onClick={() => handleReplenishWineStock(wine.id, 12)}
                        className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-[11px] hover:bg-[#8c101c] hover:text-white transition-colors"
                      >
                        +12
                      </button>
                      <button
                        onClick={() => handleReplenishWineStock(wine.id, 24)}
                        className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-[11px] hover:bg-[#8c101c] hover:text-white transition-colors"
                      >
                        +24
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/60">
                    <button
                      onClick={() => handleOpenEditWine(wine)}
                      className="flex-1 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDeleteWine(wine.id)}
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
        </div>
      )}

      {/* =========================================================================
          TAB 4: REPAS & ACCOMPAGNEMENTS (AVEC PLATS, PRIX & PHOTOS)
         ========================================================================= */}
      {activeTab === "REPAS" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Carte du Restaurant & Accompagnements ({meals.length} Mets)
              </h2>
              <p className="text-xs text-stone-500">
                Créez les plats traditionnels, les accompagnements (Amiwo, Djenkoumé, Alloco...), fixez les prix et photos.
              </p>
            </div>
            <button
              onClick={handleOpenCreateMeal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Plat / Accompagnement</span>
            </button>
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-600 transition-all group"
              >
                <div>
                  {/* Meal Photo */}
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

                  {/* Meal Details */}
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
                        Accompagnements inclus / suggérés :
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

                {/* Actions */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditMeal(meal)}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier Plat</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
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
          TAB 5: LOCATION (VEHICULES VIP & MATERIEL AVEC PHOTOS)
         ========================================================================= */}
      {activeTab === "LOCATION" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Location de Véhicules VIP & Matériel Événementiel ({rentals.length})
              </h2>
              <p className="text-xs text-stone-500">
                Gérez la flotte de véhicules de prestige avec chauffeur, les tentes et le mobilier événementiel.
              </p>
            </div>
            <button
              onClick={handleOpenCreateRental}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Véhicule / Matériel</span>
            </button>
          </div>

          {/* Rentals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-600 transition-all group"
              >
                <div>
                  {/* Photo */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={rental.imageUrl}
                      alt={rental.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                        {rental.type === "VEHICULE_VIP" ? "Véhicule VIP" : "Matériel Événementiel"}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[10px] font-bold backdrop-blur-md">
                        {rental.availableQuantity} / {rental.totalQuantity} dispo
                      </span>
                    </div>
                  </div>

                  {/* Details */}
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

                {/* Actions */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditRental(rental)}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRental(rental.id)}
                    className="p-2 rounded-xl bg-white hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-600 transition-colors"
                    title="Supprimer la location"
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
          TAB 6: SERVICE TRAITEUR (FORMULES, PRIX PAR PERSONNE & PHOTOS)
         ========================================================================= */}
      {activeTab === "TRAITEUR" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Service Traiteur & Banquets Clé en Main ({cateringFormulas.length})
              </h2>
              <p className="text-xs text-stone-500">
                Configurez les forfaits de réceptions, mariages et galas avec prix par personne et photos.
              </p>
            </div>
            <button
              onClick={handleOpenCreateCatering}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Forfait Traiteur</span>
            </button>
          </div>

          {/* Catering Formulas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cateringFormulas.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-purple-600 transition-all group"
              >
                <div>
                  {/* Photo */}
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

                  {/* Details */}
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

                {/* Actions */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditCatering(cat)}
                    className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCatering(cat.id)}
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
          TAB 7: PERSONNEL (GESTION DES 20 COMPTES & ATTRIBUTIONS)
         ========================================================================= */}
      {activeTab === "PERSONNEL" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Gestion des Collaborateurs & Accès RBAC ({staffList.length} Comptes)
              </h2>
              <p className="text-xs text-stone-500">
                Ajoutez un collaborateur, modifiez son agence ou son rôle, gérez ses plafonds de remise et désactivez des accès.
              </p>
            </div>
            <button
              onClick={handleOpenCreateStaff}
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
                            onClick={() => handleOpenEditStaff(stf)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(stf.id)}
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
          TAB 8: TRESORERIE & COMPTES (SITUATION FINANCIERE EN DIRECT)
         ========================================================================= */}
      {activeTab === "TRESORERIE" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Situation des Comptes & Trésorerie
              </h2>
              <p className="text-xs text-stone-500">
                Suivi consolidé des avoirs bancaires, caisses physiques et soldes agrégateurs Mobile Money.
              </p>
            </div>
            <button
              onClick={() => setTreasuryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer un Mouvement de Caisse</span>
            </button>
          </div>

          {/* Account Cards */}
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

          {/* Recent Cashflow Transactions Table */}
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
          TAB 9: ABONNEMENT LOGICIEL (CHARIOW)
         ========================================================================= */}
      {activeTab === "CHARIOW" && (
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
          MODALS DE CRÉATION & MODIFICATION (AVEC PHOTOS)
         ========================================================================= */}

      {/* 1. MODAL CHAMBRE */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingRoom ? "Modifier la Chambre" : "Ajouter une Nouvelle Chambre"}
              </h3>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Numéro de Chambre
                  </label>
                  <input
                    type="text"
                    required
                    value={roomForm.number}
                    onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Établissement
                  </label>
                  <select
                    value={roomForm.propertyId}
                    onChange={(e) => setRoomForm({ ...roomForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nom commercial de la chambre
                </label>
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Prix par nuit (XOF)
                  </label>
                  <input
                    type="number"
                    required
                    value={roomForm.basePriceXof}
                    onChange={(e) => setRoomForm({ ...roomForm, basePriceXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-[#184f28]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Capacité (personnes)
                  </label>
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

              {/* Photo Input & Live Preview */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>URL de la Photo HD</span>
                  </span>
                  <span className="text-[10px] text-stone-400">Aperçu en direct</span>
                </label>
                <input
                  type="url"
                  required
                  value={roomForm.imageUrl}
                  onChange={(e) => setRoomForm({ ...roomForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />

                {roomForm.imageUrl && (
                  <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-50 relative">
                    <img
                      src={roomForm.imageUrl}
                      alt="Aperçu chambre"
                      className="w-full h-full object-cover"
                    />
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

      {/* 2. MODAL CAVE A VIN */}
      {wineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingWine ? "Modifier le Vin / Boisson" : "Ajouter un Cru à la Cave"}
              </h3>
              <button
                onClick={() => setWineModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWine} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nom de la bouteille / cru
                </label>
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Catégorie
                  </label>
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Millésime
                  </label>
                  <input
                    type="text"
                    value={wineForm.millesime}
                    onChange={(e) => setWineForm({ ...wineForm, millesime: e.target.value })}
                    placeholder="Ex: 2018 ou Brut NV"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Prix de Vente (XOF)
                  </label>
                  <input
                    type="number"
                    required
                    value={wineForm.priceXof}
                    onChange={(e) => setWineForm({ ...wineForm, priceXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-[#8c101c]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Stock Initial (bouteilles)
                  </label>
                  <input
                    type="number"
                    required
                    value={wineForm.stockBottles}
                    onChange={(e) => setWineForm({ ...wineForm, stockBottles: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Photo Input & Live Preview */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>Photo de la Bouteille (URL)</span>
                  </span>
                </label>
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
                    <img
                      src={wineForm.imageUrl}
                      alt="Aperçu bouteille"
                      className="w-full h-full object-cover"
                    />
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

      {/* 3. MODAL REPAS & ACCOMPAGNEMENTS */}
      {mealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingMeal ? "Modifier le Plat" : "Créer un Nouveau Plat / Accompagnement"}
              </h3>
              <button
                onClick={() => setMealModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nom du Plat ou Accompagnement
                </label>
                <input
                  type="text"
                  required
                  value={mealForm.name}
                  onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                  placeholder="Ex: Amiwo Royal ou Alloco Plantain"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Catégorie
                  </label>
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Prix de Vente (XOF)
                  </label>
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
                <label className="block font-semibold text-stone-700 mb-1">
                  Description du plat & ingrédients clés
                </label>
                <textarea
                  rows={2}
                  value={mealForm.description}
                  onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                  placeholder="Description appétissante pour le menu..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              {/* Photo Input & Live Preview */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>Photo du Plat (URL)</span>
                  </span>
                </label>
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
                    <img
                      src={mealForm.imageUrl}
                      alt="Aperçu plat"
                      className="w-full h-full object-cover"
                    />
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

      {/* 4. MODAL LOCATION */}
      {rentalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingRental ? "Modifier la Location" : "Ajouter un Véhicule / Matériel"}
              </h3>
              <button
                onClick={() => setRentalModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRental} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Désignation du véhicule ou équipement
                </label>
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Type
                  </label>
                  <select
                    value={rentalForm.type}
                    onChange={(e) => setRentalForm({ ...rentalForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="VEHICULE_VIP">Véhicule VIP avec Chauffeur</option>
                    <option value="MATERIEL_EVENEMENT">Matériel Événementiel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tarif Journalier (XOF)
                  </label>
                  <input
                    type="number"
                    required
                    value={rentalForm.dailyPriceXof}
                    onChange={(e) => setRentalForm({ ...rentalForm, dailyPriceXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Caution de Garantie (XOF)
                  </label>
                  <input
                    type="number"
                    value={rentalForm.depositXof}
                    onChange={(e) => setRentalForm({ ...rentalForm, depositXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Quantité Disponible
                  </label>
                  <input
                    type="number"
                    value={rentalForm.availableQuantity}
                    onChange={(e) => setRentalForm({ ...rentalForm, availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Photo Input & Live Preview */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photo du Véhicule ou Matériel (URL)
                </label>
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
                    <img
                      src={rentalForm.imageUrl}
                      alt="Aperçu location"
                      className="w-full h-full object-cover"
                    />
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

      {/* 5. MODAL TRAITEUR */}
      {cateringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingCatering ? "Modifier le Forfait Traiteur" : "Créer un Forfait Traiteur"}
              </h3>
              <button
                onClick={() => setCateringModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCatering} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nom de la formule traiteur
                </label>
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Prix par personne (XOF)
                  </label>
                  <input
                    type="number"
                    required
                    value={cateringForm.pricePerPersonXof}
                    onChange={(e) => setCateringForm({ ...cateringForm, pricePerPersonXof: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nombre minimum de convives
                  </label>
                  <input
                    type="number"
                    value={cateringForm.minGuests}
                    onChange={(e) => setCateringForm({ ...cateringForm, minGuests: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Services inclus
                </label>
                <input
                  type="text"
                  value={cateringForm.serviceLevel}
                  onChange={(e) => setCateringForm({ ...cateringForm, serviceLevel: e.target.value })}
                  placeholder="Ex: Maîtres d'hôtel, chauffe-plats, arts de la table"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              {/* Photo Input & Live Preview */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photo du Buffet / Traiteur (URL)
                </label>
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
                    <img
                      src={cateringForm.imageUrl}
                      alt="Aperçu traiteur"
                      className="w-full h-full object-cover"
                    />
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

      {/* 6. MODAL PERSONNEL */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingStaff ? "Modifier le Collaborateur" : "Nouveau Collaborateur"}
              </h3>
              <button
                onClick={() => setStaffModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nom & Prénom
                  </label>
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Professionnel
                  </label>
                  <input
                    type="email"
                    required
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="reception.boh@hotel-levignoble.bj"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Rôle
                  </label>
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Agence Affectée
                  </label>
                  <select
                    value={staffForm.propertyId || ""}
                    onChange={(e) => setStaffForm({ ...staffForm, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {SEED_PROPERTIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Plafond Remise Max (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={staffForm.maxDiscount}
                    onChange={(e) => setStaffForm({ ...staffForm, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-[#184f28]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Avatar Photo Input */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photo / Avatar du collaborateur (URL)
                </label>
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

      {/* 7. MODAL TRESORERIE */}
      {treasuryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                Enregistrer un Mouvement de Trésorerie
              </h3>
              <button
                onClick={() => setTreasuryModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTreasuryTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Sens de l&apos;opération
                </label>
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
                <label className="block font-semibold text-stone-700 mb-1">
                  Montant (XOF)
                </label>
                <input
                  type="number"
                  required
                  value={treasuryForm.amountXof}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, amountXof: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-black text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Compte concerné
                </label>
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
                <label className="block font-semibold text-stone-700 mb-1">
                  Motif / Libellé de l&apos;opération
                </label>
                <input
                  type="text"
                  required
                  value={treasuryForm.label}
                  onChange={(e) => setTreasuryForm({ ...treasuryForm, label: e.target.value })}
                  placeholder="Ex: Achat carburant groupe ou règlement traiteur"
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
    </div>
  );
}
