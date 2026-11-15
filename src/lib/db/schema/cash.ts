import { pgTable, text, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { tenants, properties, outlets } from "./tenants";
import { users } from "./users";

export const cashDrawers = pgTable("cash_drawers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  outletId: varchar("outlet_id", { length: 36 }).references(() => outlets.id),
  name: text("name").notNull(), // "Caisse Réception", "Caisse Restaurant", "Caisse Bar"
  code: varchar("code", { length: 16 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cashSessions = pgTable("cash_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  drawerId: varchar("drawer_id", { length: 36 }).notNull().references(() => cashDrawers.id),
  openedByUserId: varchar("opened_by_user_id", { length: 36 }).notNull().references(() => users.id),
  closedByUserId: varchar("closed_by_user_id", { length: 36 }).references(() => users.id),
  openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow().notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  openingBalanceXof: integer("opening_balance_xof").notNull(), // Fonds d'ouverture
  theoreticalBalanceXof: integer("theoretical_balance_xof").default(0).notNull(),
  countedBalanceXof: integer("counted_balance_xof"),
  discrepancyXof: integer("discrepancy_xof").default(0).notNull(), // Écart (Compté - Théorique)
  discrepancyReason: text("discrepancy_reason"),
  status: varchar("status", { length: 16 }).default("OPEN").notNull(), // OPEN, CLOSED
});

export const folios = pgTable("folios", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  folioNumber: varchar("folio_number", { length: 32 }).notNull(), // e.g. "FOL-2026-0001"
  stayId: varchar("stay_id", { length: 36 }),
  guestName: text("guest_name").notNull(),
  totalChargesXof: integer("total_charges_xof").default(0).notNull(),
  totalPaymentsXof: integer("total_payments_xof").default(0).notNull(),
  balanceXof: integer("balance_xof").default(0).notNull(), // Charges - Payments
  status: varchar("status", { length: 16 }).default("OPEN").notNull(), // OPEN, CLOSED
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const folioLines = pgTable("folio_lines", {
  id: varchar("id", { length: 36 }).primaryKey(),
  folioId: varchar("folio_id", { length: 36 }).notNull().references(() => folios.id),
  departmentCode: varchar("department_code", { length: 16 }).notNull(), // ROOM, RESTAURANT, BAR, CATERING, EQUIPMENT
  description: text("description").notNull(),
  amountXof: integer("amount_xof").notNull(),
  sourceReference: varchar("source_reference", { length: 64 }), // e.g. Order ID, Stay ID
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentRecords = pgTable("payment_records", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  folioId: varchar("folio_id", { length: 36 }).references(() => folios.id),
  cashSessionId: varchar("cash_session_id", { length: 36 }).references(() => cashSessions.id),
  recordedByUserId: varchar("recorded_by_user_id", { length: 36 }).notNull().references(() => users.id),
  paymentMethod: varchar("payment_method", { length: 32 }).notNull(), // CASH, TPE, BANK_TRANSFER, MOBILE_MONEY
  amountXof: integer("amount_xof").notNull(),
  reference: varchar("reference", { length: 64 }), // Transaction / Receipt number
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  invoiceNumber: varchar("invoice_number", { length: 32 }).notNull().unique(), // e.g. "FAC-2026-0001"
  folioId: varchar("folio_id", { length: 36 }).notNull().references(() => folios.id),
  clientName: text("client_name").notNull(),
  clientTaxId: varchar("client_tax_id", { length: 64 }),
  totalAmountXof: integer("total_amount_xof").notNull(),
  taxAmountXof: integer("tax_amount_xof").default(0).notNull(),
  issueDate: timestamp("issue_date", { withTimezone: true }).defaultNow().notNull(),
  syscohadaExported: boolean("syscohada_exported").default(false).notNull(),
});
