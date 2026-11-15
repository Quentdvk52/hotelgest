import { pgTable, text, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { tenants, properties } from "./tenants";

// ==========================================
// 1. MODULE SERVICE TRAITEUR
// ==========================================

export const cateringMenus = pgTable("catering_menus", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  name: text("name").notNull(), // e.g. "Buffet Prestige Béninois", "Cocktail Dînatoire Le Vignoble", "Menu Mariage VIP"
  description: text("description"),
  pricePerPersonXof: integer("price_per_person_xof").notNull(),
  minGuests: integer("min_guests").default(10).notNull(),
  minNoticeHours: integer("min_notice_hours").default(48).notNull(), // Délai minimal de commande
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cateringDishes = pgTable("catering_dishes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  menuId: varchar("menu_id", { length: 36 }).references(() => cateringMenus.id),
  name: text("name").notNull(), // e.g. "Agouti braisé aux épices locales", "Poisson Capitaine sauce tomate", "Alloco et Atassi"
  category: varchar("category", { length: 32 }).notNull(), // ENTREE, PLAT, DESSERT, BOISSON, ACCOMPAGNEMENT
  pricePerPortionXof: integer("price_per_portion_xof").notNull(),
  availableOptions: text("available_options"), // JSON or CSV format options
  allergens: text("allergens"),
  active: boolean("active").default(true).notNull(),
});

export const cateringOrders = pgTable("catering_orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  orderNumber: varchar("order_number", { length: 32 }).notNull(), // e.g. "TRT-2026-0001"
  clientName: text("client_name").notNull(),
  clientPhone: varchar("client_phone", { length: 32 }).notNull(),
  clientEmail: varchar("client_email", { length: 128 }),
  eventDate: varchar("event_date", { length: 10 }).notNull(), // YYYY-MM-DD
  eventTime: varchar("event_time", { length: 8 }).notNull(), // HH:MM
  deliveryLocation: text("delivery_location").notNull(),
  serviceType: varchar("service_type", { length: 32 }).notNull(), // LIVRAISON, RETRAIT, PRESTATION_AVEC_PERSONNEL
  guestCount: integer("guest_count").notNull(),
  dietaryNotes: text("dietary_notes"),
  specialInstructions: text("special_instructions"),
  subtotalXof: integer("subtotal_xof").notNull(),
  deliveryFeeXof: integer("delivery_fee_xof").default(0).notNull(),
  totalAmountXof: integer("total_amount_xof").notNull(),
  status: varchar("status", { length: 32 }).default("DEMANDE_RECUE").notNull(),
  // Statuts: DEMANDE_RECUE, DEVIS_ENVOYE, CONFIRMEE, EN_PREPARATION, PRETE, EN_LIVRAISON, LIVREE, ANNULEE
  assignedStaff: text("assigned_staff"),
  assignedVehicle: text("assigned_vehicle"),
  folioId: varchar("folio_id", { length: 36 }), // Relie éventuellement au folio séjour / événement
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cateringOrderItems = pgTable("catering_order_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => cateringOrders.id),
  dishId: varchar("dish_id", { length: 36 }).references(() => cateringDishes.id),
  name: text("name").notNull(),
  quantityPortions: integer("quantity_portions").notNull(),
  unitPriceXof: integer("unit_price_xof").notNull(),
  totalPriceXof: integer("total_price_xof").notNull(),
  selectedOptions: text("selected_options"),
});

// ==========================================
// 2. MODULE LOCATION DE MATÉRIEL ÉVÉNEMENTIEL
// ==========================================

export const equipmentItems = pgTable("equipment_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  name: text("name").notNull(), // "Chaises Napoléon VIP", "Tables rondes 10 places", "Bâches 50m² étanches", "Couverts dorés", "Plats inox"
  category: varchar("category", { length: 32 }).notNull(), // CHAISES, TABLES, BACHES, COUVERTS, PLATS_VAISSELLE, SON_LUMIERE, AUTRE
  description: text("description"),
  photoUrl: text("photo_url"),
  totalStock: integer("total_stock").notNull(), // Stock physique au site
  dailyRentalPriceXof: integer("daily_rental_price_xof").notNull(),
  depositPerUnitXof: integer("deposit_per_unit_xof").default(0).notNull(), // Caution par unité
  replacementCostXof: integer("replacement_cost_xof").notNull(), // Frais en cas de perte / casse
  conditionStatus: varchar("condition_status", { length: 32 }).default("EXCELLENT").notNull(), // EXCELLENT, BON, MOYEN, EN_REPARATION
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const equipmentRentals = pgTable("equipment_rentals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  rentalNumber: varchar("rental_number", { length: 32 }).notNull(), // e.g. "LOC-2026-0001"
  cateringOrderId: varchar("catering_order_id", { length: 36 }).references(() => cateringOrders.id),
  clientName: text("client_name").notNull(),
  clientPhone: varchar("client_phone", { length: 32 }).notNull(),
  startDate: varchar("startDate", { length: 10 }).notNull(), // YYYY-MM-DD
  endDate: varchar("endDate", { length: 10 }).notNull(), // YYYY-MM-DD
  deliveryTime: varchar("delivery_time", { length: 8 }),
  pickupTime: varchar("pickup_time", { length: 8 }),
  eventLocation: text("event_location").notNull(),
  rentalTotalXof: integer("rental_total_xof").notNull(),
  transportFeeXof: integer("transport_fee_xof").default(0).notNull(),
  totalDepositXof: integer("total_deposit_xof").notNull(), // Caution globale exigée
  depositRetainedXof: integer("deposit_retained_xof").default(0).notNull(), // Retenue pour casse/perte
  depositRefundedXof: integer("deposit_refunded_xof").default(0).notNull(),
  status: varchar("status", { length: 32 }).default("RESERVED").notNull(),
  // Statuts: DRAFT, RESERVED, DISPATCHED, RETURNED_COMPLETE, RETURNED_DAMAGED, CANCELLED
  notes: text("notes"),
  folioId: varchar("folio_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const equipmentRentalLines = pgTable("equipment_rental_lines", {
  id: varchar("id", { length: 36 }).primaryKey(),
  rentalId: varchar("rental_id", { length: 36 }).notNull().references(() => equipmentRentals.id),
  itemId: varchar("item_id", { length: 36 }).notNull().references(() => equipmentItems.id),
  quantity: integer("quantity").notNull(),
  unitPriceXof: integer("unit_price_xof").notNull(),
  totalPriceXof: integer("total_price_xof").notNull(),
  unitDepositXof: integer("unit_deposit_xof").notNull(),
});

export const equipmentInspections = pgTable("equipment_inspections", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  rentalId: varchar("rental_id", { length: 36 }).notNull().references(() => equipmentRentals.id),
  type: varchar("type", { length: 16 }).notNull(), // DEPART, RETOUR
  inspectedByUserId: varchar("inspected_by_user_id", { length: 36 }).notNull(),
  itemsCheckedSummary: text("items_checked_summary").notNull(), // JSON avec quantités conformes, dégradées, manquantes
  damagedCount: integer("damaged_count").default(0).notNull(),
  lostCount: integer("lost_count").default(0).notNull(),
  damageFeeAssessedXof: integer("damage_fee_assessed_xof").default(0).notNull(),
  comments: text("comments"),
  inspectionDate: timestamp("inspection_date", { withTimezone: true }).defaultNow().notNull(),
});
