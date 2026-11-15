import { pgTable, text, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { tenants, properties } from "./tenants";

export const roomTypes = pgTable("room_types", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  name: text("name").notNull(), // "Chambre Standard", "Suite Vignoble", "Chambre Deluxe"
  code: varchar("code", { length: 16 }).notNull(),
  capacity: integer("capacity").default(2).notNull(),
  basePriceXof: integer("base_price_xof").notNull(), // e.g. 35000 XOF
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  roomTypeId: varchar("room_type_id", { length: 36 }).notNull().references(() => roomTypes.id),
  unitNumber: varchar("unit_number", { length: 16 }).notNull(), // "101", "102", "Villa 1"
  floor: varchar("floor", { length: 16 }),
  status: varchar("status", { length: 32 }).default("AVAILABLE").notNull(), // AVAILABLE, OCCUPIED, MAINTENANCE, OUT_OF_ORDER
  housekeepingStatus: varchar("housekeeping_status", { length: 32 }).default("CLEAN").notNull(), // CLEAN, DIRTY, INSPECTED
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ratePlans = pgTable("rate_plans", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  roomTypeId: varchar("room_type_id", { length: 36 }).notNull().references(() => roomTypes.id),
  name: text("name").notNull(), // "Tarif Standard", "Tarif Week-end", "Tarif Entreprise"
  priceXof: integer("price_xof").notNull(),
  cancellationPolicy: text("cancellation_policy"),
  active: boolean("active").default(true).notNull(),
});

export const guests = pgTable("guests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  fullName: text("full_name").notNull(),
  email: varchar("email", { length: 128 }),
  phone: varchar("phone", { length: 32 }).notNull(),
  idNumber: varchar("id_number", { length: 64 }), // e.g. CIP / Passeport
  nationality: varchar("nationality", { length: 64 }).default("Béninoise"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  guestId: varchar("guest_id", { length: 36 }).notNull().references(() => guests.id),
  unitId: varchar("unit_id", { length: 36 }).references(() => units.id),
  roomTypeId: varchar("room_type_id", { length: 36 }).notNull().references(() => roomTypes.id),
  ratePlanId: varchar("rate_plan_id", { length: 36 }).references(() => ratePlans.id),
  checkInDate: varchar("check_in_date", { length: 10 }).notNull(), // "YYYY-MM-DD"
  checkOutDate: varchar("check_out_date", { length: 10 }).notNull(), // "YYYY-MM-DD"
  numGuests: integer("num_guests").default(1).notNull(),
  totalAmountXof: integer("total_amount_xof").notNull(),
  status: varchar("status", { length: 32 }).default("CONFIRMED").notNull(), // CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW
  source: varchar("source", { length: 32 }).default("DIRECT_WEB").notNull(), // DIRECT_WEB, PHONE, WALK_IN
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const stays = pgTable("stays", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  reservationId: varchar("reservation_id", { length: 36 }).notNull().references(() => reservations.id),
  unitId: varchar("unit_id", { length: 36 }).notNull().references(() => units.id),
  guestId: varchar("guest_id", { length: 36 }).notNull().references(() => guests.id),
  actualCheckIn: timestamp("actual_check_in", { withTimezone: true }).defaultNow().notNull(),
  actualCheckOut: timestamp("actual_check_out", { withTimezone: true }),
  status: varchar("status", { length: 32 }).default("ACTIVE").notNull(), // ACTIVE, COMPLETED
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
