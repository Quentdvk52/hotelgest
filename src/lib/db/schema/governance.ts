import { pgTable, text, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { tenants, properties } from "./tenants";
import { users } from "./users";

export const discountRequests = pgTable("discount_requests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  requestedByUserId: varchar("requested_by_user_id", { length: 36 }).notNull().references(() => users.id),
  reviewedByUserId: varchar("reviewed_by_user_id", { length: 36 }).references(() => users.id),
  targetType: varchar("target_type", { length: 32 }).notNull(), // FOLIO, ORDER, CATERING_ORDER, EQUIPMENT_RENTAL
  targetId: varchar("target_id", { length: 36 }).notNull(),
  discountType: varchar("discount_type", { length: 16 }).notNull(), // PERCENT, FIXED_AMOUNT
  discountValue: integer("discount_value").notNull(), // e.g. 10 (%) or 5000 (XOF)
  reason: text("reason").notNull(),
  status: varchar("status", { length: 16 }).default("PENDING").notNull(), // PENDING, APPROVED, REJECTED
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const nightAudits = pgTable("night_audits", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  auditDate: varchar("audit_date", { length: 10 }).notNull(), // YYYY-MM-DD
  executedByUserId: varchar("executed_by_user_id", { length: 36 }).notNull().references(() => users.id),
  occupiedRoomsCount: integer("occupied_rooms_count").notNull(),
  totalRoomsCount: integer("total_rooms_count").notNull(),
  occupancyRatePercent: integer("occupancy_rate_percent").notNull(),
  roomRevenueXof: integer("room_revenue_xof").notNull(),
  fnbRevenueXof: integer("fnb_revenue_xof").notNull(),
  eventsRevenueXof: integer("events_revenue_xof").default(0).notNull(),
  totalRevenueXof: integer("total_revenue_xof").notNull(),
  discrepanciesCount: integer("discrepancies_count").default(0).notNull(),
  notes: text("notes"),
  isLocked: boolean("is_locked").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
