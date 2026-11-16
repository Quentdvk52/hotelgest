export type ProductFulfillmentUnit = "BEVERAGE" | "MEAL" | "WINE";

export interface WaitstaffProduct {
  id: string;
  name: string;
  priceXof: number;
  unit: ProductFulfillmentUnit;
  category: string; // e.g., "Bières", "Vins & Champagnes", "Cocktails & Softs", "Plats Traditionnels", "Grillades"
  imageUrl?: string;
  targetStationCode: "CUISINE" | "BAR" | "CAVE";
  availableStock?: number;
}

export interface WaitstaffCartLine {
  product: WaitstaffProduct;
  quantity: number;
  fulfillmentUnit: ProductFulfillmentUnit;
  accompaniment?: string; // For meals: Alloco, Frites, Riz, Igname pilée, etc.
  specialInstructions?: string;
}

export type OrderItemPrepStatus = "PENDING" | "IN_PREPARATION" | "READY" | "RECEIVED" | "DELIVERED";

export interface WaitstaffOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceXof: number;
  totalPriceXof: number;
  fulfillmentUnit: ProductFulfillmentUnit;
  accompaniment?: string;
  specialInstructions?: string;
  preparationStatus: OrderItemPrepStatus;
  targetStationCode: "CUISINE" | "BAR" | "CAVE";
  preparedAt?: string;
  receivedAt?: string;
  deliveredAt?: string;
}

export type OrderPaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";
export type PaymentMethod = "CASH" | "MOMO" | "MIXED" | "TPE" | "DEVISE" | "MULTI";
export type MobileMoneyOperator = "MTN" | "MOOV" | "CELTIIS" | "WAVE";

export interface PaymentTenderBreakdown {
  cashAmountXof: number;
  momoAmountXof: number;
  momoPhone?: string;
  momoOperator?: MobileMoneyOperator;
  tpeAmountXof: number;
  tpeReceiptRef?: string;
  deviseAmountXof: number;
  deviseCurrency?: "EUR" | "USD";
  deviseRate?: number;
  deviseConvertedAmount?: number;
}

export interface WaitstaffPayment {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  cashAmountXof: number;
  mobileAmountXof: number;
  tpeAmountXof?: number;
  deviseAmountXof?: number;
  totalAmountXof: number;
  mobileOperator?: MobileMoneyOperator;
  mobileNumber?: string;
  tpeReceiptRef?: string;
  deviseCurrency?: "EUR" | "USD";
  deviseRate?: number;
  deviseConvertedAmount?: number;
  kkiapayTransactionId?: string;
  tenders?: PaymentTenderBreakdown;
  status: "SUCCEEDED" | "PENDING" | "FAILED";
  fiscalNormalized: boolean;
  fiscalUid?: string;
  fiscalNim?: string;
  fiscalQrCodeUrl?: string;
  processedAt: string;
  processedBy: string;
}

export interface WaitstaffActiveOrder {
  id: string;
  orderNumber: string;
  propertyId: string;
  propertyName: string;
  tableLabel: string;
  zone: string;
  waitstaffId: string;
  waitstaffName: string;
  clientName: string;
  status: "PENDING" | "IN_PREPARATION" | "READY" | "HANDED_OFF" | "DELIVERED" | "PAID";
  totalAmountXof: number;
  paidAmountXof: number;
  items: WaitstaffOrderItem[];
  payments: WaitstaffPayment[];
  createdAt: string;
  notes?: string;
}

export interface WaitstaffTable {
  id: string;
  propertyId: string;
  label: string;
  zone: string;
  capacity: number;
  status: "FREE" | "OCCUPIED" | "RESERVED";
  assignedWaitstaffId?: string;
}

export interface WaitstaffShift {
  employeeId: string;
  fullName: string;
  roleCode: "WAITSTAFF";
  propertyId: string;
  propertyName: string;
  serviceStartTime: string;
  serviceEndTime: string;
  restDayName: string; // e.g. "Lundi", "Mardi"
  isActiveOnDuty: boolean;
}

export interface ServerCashRemittance {
  id: string;
  propertyId: string;
  propertyName: string;
  waitstaffId: string;
  waitstaffName: string;
  shiftDate: string;
  totalSalesXof: number;
  declaredCashXof: number;
  declaredMobileXof: number;
  expectedCashXof: number;
  receivedCashXof?: number | null;
  discrepancyType?: "SHORTAGE" | "REMAINING_BALANCE" | null;
  discrepancyAmountXof: number;
  status: "SUBMITTED" | "ACCEPTED" | "REJECTED";
  submittedAt: string;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  note?: string;
}

export interface WaitstaffRemittanceSnapshot {
  totalSalesXof: number;
  cashCollectedXof: number;
  mobileCollectedXof: number;
  tpeCollectedXof?: number;
  deviseCollectedXof?: number;
  expectedCashInHandXof: number;
  commissionEarnedXof: number;
  activeOrdersCount: number;
  pendingRemittance: ServerCashRemittance | null;
  pastRemittances: ServerCashRemittance[];
}

export interface WaitstaffRatingFeedback {
  id: string;
  orderNumber: string;
  clientName: string;
  ratingScore: number; // 1-5
  serviceQuality: "EXCELLENT" | "BIEN" | "MOYEN";
  comment: string;
  tableLabel: string;
  createdAt: string;
}

// =========================================================================
// BARMAN & CHEF CUISINE EXTENSIONS (MODÈLE DÉBITMASTER - LE TEMPLE DU PLAISIR)
// =========================================================================

export interface KitchenCook {
  id: string;
  propertyId: string;
  firstName: string;
  lastName: string;
  roleTitle: string; // "Chef Cuisinier", "Chef de partie Grillades", "Cuisinier Sauces & Garnitures", "Commis"
  speciality: string;
  phone: string;
  isActive: boolean;
}

export interface KitchenItemAssignment {
  id: string;
  propertyId: string;
  orderId: string;
  orderNumber: string;
  orderItemId: string;
  productName: string;
  accompaniment?: string;
  specialInstructions?: string;
  tableLabel: string;
  waitstaffName: string;
  cookId: string;
  cookName: string;
  quantity: number;
  status: "ASSIGNED" | "IN_PREPARATION" | "READY" | "HANDED_OFF";
  assignedAt: string;
  preparedAt?: string;
  handedOffAt?: string;
}

export interface BarmanStockItem {
  id: string;
  propertyId: string;
  code: string;
  name: string;
  family: "BEVERAGE" | "WINE";
  category: string; // "Bières locales", "Bières importées", "Vins & Champagnes de cave", "Sodas & Jus", "Cocktails"
  unitPackaging: string; // "Bouteilles", "Casiers de 12", "Casiers de 24", "Packs de 6"
  bottlesPerPackage?: number;
  currentStockUnits: number; // Quantité en bouteilles / unités
  alertThreshold: number; // Seuil d'alerte
  safetyThreshold: number; // Seuil de sécurité
  unitSalePriceXof: number;
  unitCostPriceXof: number;
  storageLocation: "BAR_COMPTOIR" | "CAVE_VINS" | "DEPOT_CENTRAL";
  lastRestockedAt: string;
}

export interface KitchenVivreStockItem {
  id: string;
  propertyId: string;
  code: string;
  name: string;
  category: "VIANDES_VOLAILLES" | "POISSONS_CRUSTACES" | "FECULENTS_TUBERCULES" | "EPICES_CONDIMENTS" | "HUILES_SAUCES";
  packagingUnit: string; // "Kg", "Sacs 50kg", "Bidons 25L", "Cartons", "Paniers"
  currentStockQty: number;
  alertThreshold: number;
  safetyThreshold: number;
  unitCostXof: number;
  supplierName: string;
  lastReceptionDate: string;
}

export interface ReplenishmentRequest {
  id: string;
  requestNumber: string;
  propertyId: string;
  destinationStation: "BAR" | "CUISINE" | "CAVE";
  requestedBy: string;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    unit: string;
    reason?: string;
  }[];
  status: "PENDING_APPROVAL" | "APPROVED" | "TRANSFERRED" | "RECEIVED";
  createdAt: string;
  approvedAt?: string;
  receivedAt?: string;
  notes?: string;
}
