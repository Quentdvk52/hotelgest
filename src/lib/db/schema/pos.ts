import { pgTable, text, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { tenants, properties, outlets } from "./tenants";
import { units } from "./pms";

export const serviceStations = pgTable("service_stations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  name: text("name").notNull(), // "Cuisine Principale", "Bar Central", "Cave de garde"
  code: varchar("code", { length: 16 }).notNull(), // CUISINE, BAR, CAVE
  type: varchar("type", { length: 32 }).notNull(), // KITCHEN, BAR, CELLAR
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const diningTables = pgTable("dining_tables", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  outletId: varchar("outlet_id", { length: 36 }).references(() => outlets.id),
  tableNumber: varchar("table_number", { length: 16 }).notNull(), // "Table 1", "Térasse 4"
  capacity: integer("capacity").default(4).notNull(),
  zone: varchar("zone", { length: 32 }).default("SALLE_PRINCIPALE").notNull(), // SALLE, TERRASSE, VIP, PISCINE
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const qrResources = pgTable("qr_resources", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  token: varchar("token", { length: 64 }).notNull().unique(), // Random non-sequential opaque token
  resourceType: varchar("resource_type", { length: 32 }).notNull(), // TABLE, ROOM
  tableId: varchar("table_id", { length: 36 }).references(() => diningTables.id),
  unitId: varchar("unit_id", { length: 36 }).references(() => units.id),
  revoked: boolean("revoked").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const menuCategories = pgTable("menu_categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  name: text("name").notNull(), // "Entrées", "Plats Traditionnels Béninois", "Vins & Spiritueux", "Boissons fraîches"
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  categoryId: varchar("category_id", { length: 36 }).notNull().references(() => menuCategories.id),
  targetStationCode: varchar("target_station_code", { length: 16 }).notNull(), // CUISINE, BAR, CAVE
  name: text("name").notNull(), // e.g. "Sauce Tchayo au poisson braisé", "Château Vignoble Réserve", "Bissap Frais"
  description: text("description"),
  priceXof: integer("price_xof").notNull(),
  allergens: text("allergens"), // e.g. "poisson, arachide"
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  orderNumber: varchar("order_number", { length: 32 }).notNull(), // e.g. "CMD-2026-0001"
  source: varchar("source", { length: 32 }).notNull(), // QR_CLIENT, WAITSTAFF
  tableId: varchar("table_id", { length: 36 }).references(() => diningTables.id),
  unitId: varchar("unit_id", { length: 36 }).references(() => units.id),
  waiterId: varchar("waiter_id", { length: 36 }),
  status: varchar("status", { length: 32 }).default("SUBMITTED").notNull(), // DRAFT, SUBMITTED, ACCEPTED, PREPARING, READY, SERVED, CANCELLED
  totalAmountXof: integer("total_amount_xof").notNull(),
  customerNotes: text("customer_notes"),
  folioId: varchar("folio_id", { length: 36 }), // Populated if transferred to stay folio
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderLines = pgTable("order_lines", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id),
  menuItemId: varchar("menu_item_id", { length: 36 }).notNull().references(() => menuItems.id),
  name: text("name").notNull(),
  targetStationCode: varchar("target_station_code", { length: 16 }).notNull(), // CUISINE, BAR, CAVE
  quantity: integer("quantity").notNull(),
  unitPriceXof: integer("unit_price_xof").notNull(),
  totalPriceXof: integer("total_price_xof").notNull(),
  specialInstructions: text("special_instructions"),
});

export const stationTickets = pgTable("station_tickets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id),
  stationCode: varchar("station_code", { length: 16 }).notNull(), // CUISINE, BAR, CAVE
  status: varchar("status", { length: 32 }).default("PENDING").notNull(), // PENDING, ACCEPTED, PREPARING, READY, SERVED
  ticketNumber: varchar("ticket_number", { length: 32 }).notNull(),
  itemsSummary: text("items_summary").notNull(),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
