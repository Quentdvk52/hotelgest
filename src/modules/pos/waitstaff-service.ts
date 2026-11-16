import {
  WaitstaffProduct,
  WaitstaffTable,
  WaitstaffShift,
  WaitstaffActiveOrder,
  WaitstaffOrderItem,
  WaitstaffPayment,
  ServerCashRemittance,
  WaitstaffRemittanceSnapshot,
  WaitstaffRatingFeedback,
  PaymentMethod,
  MobileMoneyOperator,
  PaymentTenderBreakdown,
} from "./waitstaff-types";
import { SEED_PROPERTIES } from "../../lib/db/seed";

export const WAITSTAFF_EXCHANGE_RATES: Record<"EUR" | "USD", { rate: number; label: string }> = {
  EUR: { rate: 655.957, label: "1 EUR = 655,957 XOF (Parité fixe BCEAO/CFA)" },
  USD: { rate: 610.0, label: "1 USD = 610,000 XOF (Taux de référence hôtel)" },
};

// Full dual-family catalog for Hôtel Le Vignoble
export const WAITSTAFF_CATALOG: WaitstaffProduct[] = [
  // 1. BOISSONS & BAR (BEVERAGE)
  {
    id: "prod-boi-01",
    name: "Bière La Béninoise 65cl (Glacée)",
    priceXof: 1500,
    unit: "BEVERAGE",
    category: "Bières du Terroir",
    targetStationCode: "BAR",
    availableStock: 120,
    imageUrl: "https://images.unsplash.com/photo-1608270191763-7e447b9370cb?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-02",
    name: "Bière Beaufort Lager 50cl",
    priceXof: 1800,
    unit: "BEVERAGE",
    category: "Bières Pression & Bouteilles",
    targetStationCode: "BAR",
    availableStock: 96,
    imageUrl: "https://images.unsplash.com/photo-1608270191763-7e447b9370cb?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-03",
    name: "Guinness Foreign Extra Stout 33cl",
    priceXof: 2000,
    unit: "BEVERAGE",
    category: "Bières & Stouts",
    targetStationCode: "BAR",
    availableStock: 72,
    imageUrl: "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-04",
    name: "Bière Castel Beer 65cl",
    priceXof: 1600,
    unit: "BEVERAGE",
    category: "Bières du Terroir",
    targetStationCode: "BAR",
    availableStock: 80,
    imageUrl: "https://images.unsplash.com/photo-1608270191763-7e447b9370cb?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-05",
    name: "Cocktail Le Vignoble Tropical (Maison)",
    priceXof: 3500,
    unit: "BEVERAGE",
    category: "Cocktails Signatures",
    targetStationCode: "BAR",
    availableStock: 50,
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-06",
    name: "Château Vignoble Réserve Prestige (Bouteille)",
    priceXof: 25000,
    unit: "WINE",
    category: "Vins de Cave Climatisée",
    targetStationCode: "CAVE",
    availableStock: 24,
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-07",
    name: "Champagne Moët & Chandon Brut Impérial",
    priceXof: 55000,
    unit: "WINE",
    category: "Champagnes de Prestige",
    targetStationCode: "CAVE",
    availableStock: 12,
    imageUrl: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-cav-01",
    name: "Grand Cru Saint-Émilion Château Le Vignoble (75cl)",
    priceXof: 45000,
    unit: "WINE",
    category: "Grands Crus & Vins Rouges de Garde",
    targetStationCode: "CAVE",
    availableStock: 18,
    imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-cav-02",
    name: "Champagne Veuve Clicquot Ponsardin Brut (75cl)",
    priceXof: 65000,
    unit: "WINE",
    category: "Champagnes de Prestige",
    targetStationCode: "CAVE",
    availableStock: 15,
    imageUrl: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-cav-03",
    name: "Chablis Premier Cru Domaine du Vignoble (Blanc 75cl)",
    priceXof: 38000,
    unit: "WINE",
    category: "Vins Blancs Fins & Moelleux",
    targetStationCode: "CAVE",
    availableStock: 20,
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-cav-04",
    name: "Baron de Lestac Bordeaux Rouge Supérieur (75cl)",
    priceXof: 18000,
    unit: "WINE",
    category: "Vins de Cave Climatisée",
    targetStationCode: "CAVE",
    availableStock: 30,
    imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-cav-05",
    name: "Cognac Hennessy V.S.O.P Privilège (Bouteille)",
    priceXof: 75000,
    unit: "WINE",
    category: "Spiritueux & Digestifs de Cave",
    targetStationCode: "CAVE",
    availableStock: 10,
    imageUrl: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-cav-06",
    name: "Vin Rosé Minuty Prestige Côtes de Provence (75cl)",
    priceXof: 22000,
    unit: "WINE",
    category: "Vins Rosés de Cave",
    targetStationCode: "CAVE",
    availableStock: 25,
    imageUrl: "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-08",
    name: "Eau Minérale Possotomé 1.5L",
    priceXof: 1000,
    unit: "BEVERAGE",
    category: "Eaux & Softs Frais",
    targetStationCode: "BAR",
    availableStock: 150,
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-09",
    name: "Jus d'Ananas d'Allada Pur Frais Pressé",
    priceXof: 1200,
    unit: "BEVERAGE",
    category: "Eaux & Softs Frais",
    targetStationCode: "BAR",
    availableStock: 40,
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-boi-10",
    name: "Coca-Cola 33cl Bouteille Verre",
    priceXof: 800,
    unit: "BEVERAGE",
    category: "Eaux & Softs Frais",
    targetStationCode: "BAR",
    availableStock: 100,
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80",
  },

  // 2. PLATS & CUISINE (MEAL)
  {
    id: "prod-rep-01",
    name: "Amiwo au Poulet Bicyclette Braisé",
    priceXof: 5500,
    unit: "MEAL",
    category: "Plats Terroir & Spécialités",
    targetStationCode: "CUISINE",
    availableStock: 30,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-rep-02",
    name: "Sauce Crincrin au Mouton Tendre & Akassa",
    priceXof: 4500,
    unit: "MEAL",
    category: "Plats Terroir & Spécialités",
    targetStationCode: "CUISINE",
    availableStock: 25,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-rep-03",
    name: "Tchep Royal au Mérou Braisé du Lac Nokoué",
    priceXof: 6000,
    unit: "MEAL",
    category: "Plats Terroir & Spécialités",
    targetStationCode: "CUISINE",
    availableStock: 20,
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-rep-04",
    name: "Brochettes de Filet de Bœuf Mariné aux Épices",
    priceXof: 4000,
    unit: "MEAL",
    category: "Grillades & Rôtisseries",
    targetStationCode: "CUISINE",
    availableStock: 40,
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-rep-05",
    name: "Poisson Braisé Entier (Capitaine) sauce Tomate",
    priceXof: 7000,
    unit: "MEAL",
    category: "Grillades & Rôtisseries",
    targetStationCode: "CUISINE",
    availableStock: 15,
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80",
  },
];

export const BENIN_MEAL_ACCOMPANIMENTS = [
  "Alloco fondant (Plantains frits)",
  "Frites maison croustillantes",
  "Riz blanc parfumé",
  "Riz gras rouge terroir",
  "Igname pilée traditionnelle (Agoun)",
  "Attiéké fin de Grand-Popo",
  "Légumes sautés vapeur",
  "Aucun accompagnement",
];

// Tables per establishment
export const WAITSTAFF_TABLES: WaitstaffTable[] = [
  // Bohicon (BOH)
  { id: "tbl-boh-01", propertyId: "prop-bohicon-001", label: "Table 1", zone: "Terrasse Jardin", capacity: 4, status: "FREE" },
  { id: "tbl-boh-02", propertyId: "prop-bohicon-001", label: "Table 2", zone: "Terrasse Jardin", capacity: 4, status: "OCCUPIED", assignedWaitstaffId: "user-srv-boh" },
  { id: "tbl-boh-03", propertyId: "prop-bohicon-001", label: "Table 3", zone: "Salle Restaurant", capacity: 6, status: "OCCUPIED", assignedWaitstaffId: "user-srv-boh" },
  { id: "tbl-boh-04", propertyId: "prop-bohicon-001", label: "Table 4", zone: "Salle Restaurant", capacity: 4, status: "FREE" },
  { id: "tbl-boh-vip", propertyId: "prop-bohicon-001", label: "Salon VIP", zone: "Espace Prestige VIP", capacity: 8, status: "RESERVED" },
  { id: "tbl-boh-paille", propertyId: "prop-bohicon-001", label: "Paillote 1", zone: "Paillote Extérieure", capacity: 6, status: "FREE" },

  // Abomey (ABM)
  { id: "tbl-abm-01", propertyId: "prop-abomey-002", label: "Table 1", zone: "Cour Royale", capacity: 4, status: "OCCUPIED", assignedWaitstaffId: "user-srv-abm" },
  { id: "tbl-abm-02", propertyId: "prop-abomey-002", label: "Table 2", zone: "Terrasse Ombragée", capacity: 6, status: "FREE" },
  { id: "tbl-abm-03", propertyId: "prop-abomey-002", label: "Table 3", zone: "Salle Restaurant", capacity: 4, status: "FREE" },

  // Abomey-Calavi (ABC)
  { id: "tbl-abc-01", propertyId: "prop-calavi-003", label: "Table 1", zone: "Vue Lagune", capacity: 4, status: "OCCUPIED", assignedWaitstaffId: "user-srv-abc" },
  { id: "tbl-abc-02", propertyId: "prop-calavi-003", label: "Table 2", zone: "Terrasse Piscine", capacity: 6, status: "FREE" },
  { id: "tbl-abc-03", propertyId: "prop-calavi-003", label: "Table 3", zone: "Salle Panoramique", capacity: 4, status: "FREE" },

  // Zogbodomey (ZOG)
  { id: "tbl-zog-01", propertyId: "prop-zogbo-004", label: "Table 1", zone: "Buvette Plein Air", capacity: 4, status: "OCCUPIED", assignedWaitstaffId: "user-srv-zog" },
  { id: "tbl-zog-02", propertyId: "prop-zogbo-004", label: "Table 2", zone: "Terrasse", capacity: 4, status: "FREE" },
];

// Seed waitstaff active shifts
const WAITSTAFF_SHIFTS: Record<string, WaitstaffShift> = {
  "user-srv-boh": {
    employeeId: "user-srv-boh",
    fullName: "Chantal Tossou",
    roleCode: "WAITSTAFF",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    serviceStartTime: "11:30",
    serviceEndTime: "23:00",
    restDayName: "Mardi",
    isActiveOnDuty: true,
  },
  "user-srv-abm": {
    employeeId: "user-srv-abm",
    fullName: "Estelle AHOUANDJINOU",
    roleCode: "WAITSTAFF",
    propertyId: "prop-abomey-002",
    propertyName: "Hôtel Le Vignoble - Abomey",
    serviceStartTime: "11:00",
    serviceEndTime: "22:30",
    restDayName: "Mercredi",
    isActiveOnDuty: true,
  },
  "user-srv-abc": {
    employeeId: "user-srv-abc",
    fullName: "Prudence HOUNTONDJI",
    roleCode: "WAITSTAFF",
    propertyId: "prop-calavi-003",
    propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
    serviceStartTime: "12:00",
    serviceEndTime: "23:30",
    restDayName: "Lundi",
    isActiveOnDuty: true,
  },
  "user-srv-zog": {
    employeeId: "user-srv-zog",
    fullName: "Viviane SOGLO",
    roleCode: "WAITSTAFF",
    propertyId: "prop-zogbo-004",
    propertyName: "Hôtel Le Vignoble - Zogbodomey",
    serviceStartTime: "10:30",
    serviceEndTime: "22:00",
    restDayName: "Jeudi",
    isActiveOnDuty: true,
  },
};

// In-memory operational store
let activeOrdersStore: WaitstaffActiveOrder[] = [
  {
    id: "ord-srv-001",
    orderNumber: "CMD-BOH-8821",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    tableLabel: "Table 2",
    zone: "Terrasse Jardin",
    waitstaffId: "user-srv-boh",
    waitstaffName: "Chantal Tossou",
    clientName: "Famille KPONOU",
    status: "READY",
    totalAmountXof: 17500,
    paidAmountXof: 0,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    notes: "Client fidèle • Piment vert séparé",
    items: [
      {
        id: "item-8821-1",
        productId: "prod-rep-01",
        productName: "Amiwo au Poulet Bicyclette Braisé",
        quantity: 2,
        unitPriceXof: 5500,
        totalPriceXof: 11000,
        fulfillmentUnit: "MEAL",
        accompaniment: "Alloco fondant (Plantains frits)",
        preparationStatus: "READY",
        targetStationCode: "CUISINE",
        preparedAt: new Date(Date.now() - 3 * 60000).toISOString(),
      },
      {
        id: "item-8821-2",
        productId: "prod-boi-01",
        productName: "Bière La Béninoise 65cl (Glacée)",
        quantity: 3,
        unitPriceXof: 1500,
        totalPriceXof: 4500,
        fulfillmentUnit: "BEVERAGE",
        preparationStatus: "READY",
        targetStationCode: "BAR",
        preparedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: "item-8821-3",
        productId: "prod-boi-09",
        productName: "Jus d'Ananas d'Allada Pur Frais Pressé",
        quantity: 2,
        unitPriceXof: 1200,
        totalPriceXof: 2400,
        fulfillmentUnit: "BEVERAGE",
        preparationStatus: "DELIVERED",
        targetStationCode: "BAR",
        preparedAt: new Date(Date.now() - 10 * 60000).toISOString(),
        deliveredAt: new Date(Date.now() - 8 * 60000).toISOString(),
      },
    ],
    payments: [],
  },
  {
    id: "ord-srv-002",
    orderNumber: "CMD-BOH-8822",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    tableLabel: "Table 3",
    zone: "Salle Restaurant",
    waitstaffId: "user-srv-boh",
    waitstaffName: "Chantal Tossou",
    clientName: "M. Paulin ADANLETE",
    status: "DELIVERED",
    totalAmountXof: 32000,
    paidAmountXof: 32000,
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    notes: "Service impeccable",
    items: [
      {
        id: "item-8822-1",
        productId: "prod-boi-06",
        productName: "Château Vignoble Réserve Prestige (Bouteille)",
        quantity: 1,
        unitPriceXof: 25000,
        totalPriceXof: 25000,
        fulfillmentUnit: "BEVERAGE",
        preparationStatus: "DELIVERED",
        targetStationCode: "CAVE",
        deliveredAt: new Date(Date.now() - 35 * 60000).toISOString(),
      },
      {
        id: "item-8822-2",
        productId: "prod-rep-05",
        productName: "Poisson Braisé Entier (Capitaine) sauce Tomate",
        quantity: 1,
        unitPriceXof: 7000,
        totalPriceXof: 7000,
        fulfillmentUnit: "MEAL",
        accompaniment: "Attiéké fin de Grand-Popo",
        preparationStatus: "DELIVERED",
        targetStationCode: "CUISINE",
        deliveredAt: new Date(Date.now() - 20 * 60000).toISOString(),
      },
    ],
    payments: [
      {
        id: "pay-8822-1",
        orderId: "ord-srv-002",
        paymentMethod: "CASH",
        cashAmountXof: 32000,
        mobileAmountXof: 0,
        totalAmountXof: 32000,
        status: "SUCCEEDED",
        fiscalNormalized: true,
        fiscalUid: "FV-0839213-20261116-8822",
        fiscalNim: "MCF-BOH-0201-01",
        fiscalQrCodeUrl: "https://facture.dgi.bj/v?uid=FV-0839213-20261116-8822",
        processedAt: new Date(Date.now() - 10 * 60000).toISOString(),
        processedBy: "Chantal Tossou",
      },
    ],
  },
];

let serverRemittancesStore: ServerCashRemittance[] = [
  {
    id: "remit-boh-prev-01",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    waitstaffId: "user-srv-boh",
    waitstaffName: "Chantal Tossou",
    shiftDate: "15/11/2026",
    totalSalesXof: 95000,
    declaredCashXof: 65000,
    declaredMobileXof: 30000,
    expectedCashXof: 65000,
    receivedCashXof: 65000,
    discrepancyType: null,
    discrepancyAmountXof: 0,
    status: "ACCEPTED",
    submittedAt: "2026-11-15T22:45:00.000Z",
    confirmedAt: "2026-11-15T22:50:00.000Z",
    confirmedBy: "Pascal AGBOSSOU (Gérant)",
    note: "Point conforme sans écart.",
  },
];

let waitstaffRatingsStore: WaitstaffRatingFeedback[] = [
  {
    id: "rate-01",
    orderNumber: "CMD-BOH-8740",
    clientName: "M. Aimé TOSSOU",
    ratingScore: 5,
    serviceQuality: "EXCELLENT",
    comment: "Service très rapide et chaleureux, les boissons étaient bien fraîches !",
    tableLabel: "Table 2 (Terrasse)",
    createdAt: "16/11/2026 13:45",
  },
  {
    id: "rate-02",
    orderNumber: "CMD-BOH-8712",
    clientName: "Mme Clarisse HOUESSOU",
    ratingScore: 5,
    serviceQuality: "EXCELLENT",
    comment: "Chantal a été très attentionnée avec nos enfants. Recommandée à 100%.",
    tableLabel: "Table VIP",
    createdAt: "15/11/2026 20:15",
  },
  {
    id: "rate-03",
    orderNumber: "CMD-BOH-8690",
    clientName: "Dr. Benoît GOMEZ",
    ratingScore: 4,
    serviceQuality: "BIEN",
    comment: "Bonne prise de commande et accompagnements respectés.",
    tableLabel: "Table 3",
    createdAt: "14/11/2026 21:00",
  },
];

export function getWaitstaffShift(userId: string): WaitstaffShift {
  if (WAITSTAFF_SHIFTS[userId]) {
    return WAITSTAFF_SHIFTS[userId];
  }
  return {
    employeeId: userId,
    fullName: "Serveuse Hôtel Le Vignoble",
    roleCode: "WAITSTAFF",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    serviceStartTime: "11:00",
    serviceEndTime: "23:00",
    restDayName: "Mardi",
    isActiveOnDuty: true,
  };
}

export function getWaitstaffTables(propertyId: string): WaitstaffTable[] {
  return WAITSTAFF_TABLES.filter((t) => t.propertyId === propertyId);
}

export function getWaitstaffOrders(waitstaffId: string, propertyId?: string): WaitstaffActiveOrder[] {
  return activeOrdersStore.filter((o) => {
    if (propertyId && o.propertyId !== propertyId) return false;
    return o.waitstaffId === waitstaffId || o.waitstaffId.includes("srv");
  });
}

export function createWaitstaffOrder(data: {
  propertyId: string;
  tableLabel: string;
  zone: string;
  waitstaffId: string;
  waitstaffName: string;
  clientName?: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    accompaniment?: string;
    specialInstructions?: string;
  }[];
}): WaitstaffActiveOrder {
  const property = SEED_PROPERTIES.find((p) => p.id === data.propertyId) || SEED_PROPERTIES[0];
  const orderNumber = `CMD-${property.code}-${Math.floor(1000 + Math.random() * 9000)}`;

  let totalAmountXof = 0;
  const orderItems: WaitstaffOrderItem[] = [];

  for (const item of data.items) {
    const product = WAITSTAFF_CATALOG.find((p) => p.id === item.productId);
    if (!product) continue;

    const lineTotal = product.priceXof * item.quantity;
    totalAmountXof += lineTotal;

    orderItems.push({
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPriceXof: product.priceXof,
      totalPriceXof: lineTotal,
      fulfillmentUnit: product.unit,
      accompaniment: product.unit === "MEAL" ? (item.accompaniment || "Aucun accompagnement") : undefined,
      preparationStatus: "PENDING",
      targetStationCode: product.targetStationCode,
    });
  }

  const newOrder: WaitstaffActiveOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    propertyId: property.id,
    propertyName: property.name,
    tableLabel: data.tableLabel || "Table 1",
    zone: data.zone || "Terrasse Jardin",
    waitstaffId: data.waitstaffId,
    waitstaffName: data.waitstaffName,
    clientName: data.clientName?.trim() || `Client ${data.tableLabel}`,
    status: "PENDING",
    totalAmountXof,
    paidAmountXof: 0,
    items: orderItems,
    payments: [],
    createdAt: new Date().toISOString(),
    notes: data.notes,
  };

  activeOrdersStore.unshift(newOrder);

  // Mark table as occupied
  const table = WAITSTAFF_TABLES.find((t) => t.propertyId === property.id && t.label === data.tableLabel);
  if (table) {
    table.status = "OCCUPIED";
    table.assignedWaitstaffId = data.waitstaffId;
  }

  return newOrder;
}

export function advanceOrderItemStatus(
  orderId: string,
  itemId: string,
  newStatus: "RECEIVED" | "DELIVERED"
): { success: boolean; order?: WaitstaffActiveOrder } {
  const order = activeOrdersStore.find((o) => o.id === orderId);
  if (!order) return { success: false };

  const item = order.items.find((i) => i.id === itemId);
  if (!item) return { success: false };

  item.preparationStatus = newStatus;
  const now = new Date().toISOString();
  if (newStatus === "RECEIVED") item.receivedAt = now;
  if (newStatus === "DELIVERED") item.deliveredAt = now;

  // Check if all items delivered
  const allDelivered = order.items.every((i) => i.preparationStatus === "DELIVERED");
  if (allDelivered && order.status !== "PAID") {
    order.status = "DELIVERED";
  } else if (order.items.some((i) => i.preparationStatus === "RECEIVED" || i.preparationStatus === "DELIVERED")) {
    order.status = "HANDED_OFF";
  }

  return { success: true, order };
}

export function settleWaitstaffOrder(data: {
  orderId: string;
  paymentMethod?: PaymentMethod;
  cashAmountXof?: number;
  mobileAmountXof?: number;
  mobileOperator?: MobileMoneyOperator;
  mobileNumber?: string;
  tpeAmountXof?: number;
  tpeReceiptRef?: string;
  deviseAmountXof?: number;
  deviseCurrency?: "EUR" | "USD";
  deviseRate?: number;
  kkiapayTransactionId?: string;
  tenders?: PaymentTenderBreakdown;
  waitstaffName: string;
}): { success: boolean; payment?: WaitstaffPayment; order?: WaitstaffActiveOrder } {
  const order = activeOrdersStore.find((o) => o.id === data.orderId);
  if (!order) return { success: false };

  const cashAmount = data.tenders ? (data.tenders.cashAmountXof || 0) : (data.cashAmountXof || 0);
  const momoAmount = data.tenders ? (data.tenders.momoAmountXof || 0) : (data.mobileAmountXof || 0);
  const tpeAmount = data.tenders ? (data.tenders.tpeAmountXof || 0) : (data.tpeAmountXof || 0);
  const deviseAmount = data.tenders ? (data.tenders.deviseAmountXof || 0) : (data.deviseAmountXof || 0);
  const totalPaid = cashAmount + momoAmount + tpeAmount + deviseAmount;

  // Determine effective payment method
  let method: PaymentMethod = data.paymentMethod || "CASH";
  const usedMethodsCount =
    (cashAmount > 0 ? 1 : 0) +
    (momoAmount > 0 ? 1 : 0) +
    (tpeAmount > 0 ? 1 : 0) +
    (deviseAmount > 0 ? 1 : 0);

  if (usedMethodsCount > 1) {
    method = "MULTI";
  } else if (cashAmount > 0) {
    method = "CASH";
  } else if (momoAmount > 0) {
    method = "MOMO";
  } else if (tpeAmount > 0) {
    method = "TPE";
  } else if (deviseAmount > 0) {
    method = "DEVISE";
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const companyIfu = "0201910839213";
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
  const fiscalUid = `FV-${companyIfu.slice(-6)}-${dateStr}-${randomSuffix}`;
  const fiscalNim = `MCF-BOH-${companyIfu.slice(0, 4)}-01`;
  const fiscalQrCodeUrl = `https://facture.dgi.bj/v?ifu=${companyIfu}&uid=${fiscalUid}&ttc=${totalPaid}`;

  const resolvedTenders: PaymentTenderBreakdown = data.tenders || {
    cashAmountXof: cashAmount,
    momoAmountXof: momoAmount,
    momoPhone: data.mobileNumber,
    momoOperator: data.mobileOperator,
    tpeAmountXof: tpeAmount,
    tpeReceiptRef: data.tpeReceiptRef,
    deviseAmountXof: deviseAmount,
    deviseCurrency: data.deviseCurrency || "EUR",
    deviseRate: data.deviseRate || WAITSTAFF_EXCHANGE_RATES[data.deviseCurrency || "EUR"].rate,
    deviseConvertedAmount: data.deviseRate
      ? deviseAmount / data.deviseRate
      : deviseAmount / WAITSTAFF_EXCHANGE_RATES[data.deviseCurrency || "EUR"].rate,
  };

  const payment: WaitstaffPayment = {
    id: `pay-${Date.now()}`,
    orderId: order.id,
    paymentMethod: method,
    cashAmountXof: cashAmount,
    mobileAmountXof: momoAmount,
    tpeAmountXof: tpeAmount,
    deviseAmountXof: deviseAmount,
    totalAmountXof: totalPaid,
    mobileOperator: resolvedTenders.momoOperator,
    mobileNumber: resolvedTenders.momoPhone,
    tpeReceiptRef: resolvedTenders.tpeReceiptRef,
    deviseCurrency: resolvedTenders.deviseCurrency,
    deviseRate: resolvedTenders.deviseRate,
    deviseConvertedAmount: resolvedTenders.deviseConvertedAmount,
    kkiapayTransactionId: data.kkiapayTransactionId,
    tenders: resolvedTenders,
    status: "SUCCEEDED",
    fiscalNormalized: true,
    fiscalUid,
    fiscalNim,
    fiscalQrCodeUrl,
    processedAt: now.toISOString(),
    processedBy: data.waitstaffName,
  };

  order.payments.push(payment);
  order.paidAmountXof += totalPaid;
  if (order.paidAmountXof >= order.totalAmountXof) {
    order.status = "PAID";
  }

  return { success: true, payment, order };
}

export function getWaitstaffRemittanceSnapshot(
  waitstaffId: string,
  propertyId: string
): WaitstaffRemittanceSnapshot {
  const waitstaffOrders = activeOrdersStore.filter(
    (o) => (o.waitstaffId === waitstaffId || o.waitstaffId.includes("srv")) && o.propertyId === propertyId
  );

  let totalSalesXof = 0;
  let cashCollectedXof = 0;
  let mobileCollectedXof = 0;
  let tpeCollectedXof = 0;
  let deviseCollectedXof = 0;

  for (const order of waitstaffOrders) {
    totalSalesXof += order.totalAmountXof;
    for (const pay of order.payments) {
      if (pay.status === "SUCCEEDED") {
        cashCollectedXof += pay.cashAmountXof || 0;
        mobileCollectedXof += pay.mobileAmountXof || 0;
        tpeCollectedXof += pay.tpeAmountXof || 0;
        deviseCollectedXof += pay.deviseAmountXof || 0;
      }
    }
  }

  // Deduct already accepted cash remittances
  const pastAcceptedCash = serverRemittancesStore
    .filter((r) => r.waitstaffId === waitstaffId && r.propertyId === propertyId && r.status === "ACCEPTED")
    .reduce((sum, r) => sum + (r.receivedCashXof ?? r.declaredCashXof), 0);

  const expectedCashInHandXof = Math.max(0, cashCollectedXof - pastAcceptedCash);
  const commissionEarnedXof = Math.round(totalSalesXof * 0.02); // 2% service commission bonus

  const pendingRemittance =
    serverRemittancesStore.find(
      (r) => r.waitstaffId === waitstaffId && r.propertyId === propertyId && r.status === "SUBMITTED"
    ) || null;

  const pastRemittances = serverRemittancesStore.filter(
    (r) => r.waitstaffId === waitstaffId && r.propertyId === propertyId
  );

  return {
    totalSalesXof,
    cashCollectedXof,
    mobileCollectedXof,
    tpeCollectedXof,
    deviseCollectedXof,
    expectedCashInHandXof,
    commissionEarnedXof,
    activeOrdersCount: waitstaffOrders.length,
    pendingRemittance,
    pastRemittances,
  };
}

export function submitServerRemittance(data: {
  propertyId: string;
  waitstaffId: string;
  waitstaffName: string;
  declaredCashXof: number;
  declaredMobileXof: number;
  expectedCashXof: number;
  note?: string;
}): ServerCashRemittance {
  const property = SEED_PROPERTIES.find((p) => p.id === data.propertyId) || SEED_PROPERTIES[0];
  const now = new Date();
  const shiftDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

  const remittance: ServerCashRemittance = {
    id: `remit-${Date.now()}`,
    propertyId: property.id,
    propertyName: property.name,
    waitstaffId: data.waitstaffId,
    waitstaffName: data.waitstaffName,
    shiftDate,
    totalSalesXof: data.declaredCashXof + data.declaredMobileXof,
    declaredCashXof: data.declaredCashXof,
    declaredMobileXof: data.declaredMobileXof,
    expectedCashXof: data.expectedCashXof,
    receivedCashXof: null,
    discrepancyType: null,
    discrepancyAmountXof: 0,
    status: "SUBMITTED",
    submittedAt: now.toISOString(),
    note: data.note || "Point de clôture de service remis au Gérant.",
  };

  serverRemittancesStore.unshift(remittance);
  return remittance;
}

export function confirmServerRemittance(data: {
  remittanceId: string;
  receivedCashXof: number;
  confirmedBy: string;
  note?: string;
}): { success: boolean; remittance?: ServerCashRemittance } {
  const remittance = serverRemittancesStore.find((r) => r.id === data.remittanceId);
  if (!remittance) return { success: false };

  const diff = remittance.expectedCashXof - data.receivedCashXof;
  remittance.receivedCashXof = data.receivedCashXof;
  remittance.confirmedAt = new Date().toISOString();
  remittance.confirmedBy = data.confirmedBy;
  remittance.status = "ACCEPTED";

  if (diff > 0) {
    remittance.discrepancyType = "SHORTAGE";
    remittance.discrepancyAmountXof = diff;
  } else if (diff < 0) {
    remittance.discrepancyType = "REMAINING_BALANCE";
    remittance.discrepancyAmountXof = Math.abs(diff);
  } else {
    remittance.discrepancyType = null;
    remittance.discrepancyAmountXof = 0;
  }

  if (data.note) remittance.note = data.note;
  return { success: true, remittance };
}

export function getWaitstaffRatings(): WaitstaffRatingFeedback[] {
  return waitstaffRatingsStore;
}
