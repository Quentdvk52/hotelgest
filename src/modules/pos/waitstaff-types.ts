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
