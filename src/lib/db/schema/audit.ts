import { pgTable, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const auditEvents = pgTable("audit_events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }),
  userId: varchar("user_id", { length: 36 }),
  action: varchar("action", { length: 64 }).notNull(), // e.g. "AUTH_LOGIN", "RESERVATION_CREATE", "DISCOUNT_APPROVE", "NIGHT_AUDIT"
  entityType: varchar("entity_type", { length: 32 }).notNull(),
  entityId: varchar("entity_id", { length: 36 }),
  details: text("details").notNull(), // JSON metadata
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  provider: varchar("provider", { length: 32 }).default("CHARIOW").notNull(),
  externalSubscriptionId: varchar("external_subscription_id", { length: 64 }),
  planCode: varchar("plan_code", { length: 32 }).notNull(), // MONTHLY_100K, SEMIANNUAL_540K, ANNUAL_840K
  status: varchar("status", { length: 32 }).default("ACTIVE").notNull(), // ACTIVE, PAST_DUE, CANCELLED
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  amountXof: integer("amount_xof").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const integrationEvents = pgTable("integration_events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  provider: varchar("provider", { length: 32 }).notNull(), // CHARIOW
  eventId: varchar("event_id", { length: 128 }).notNull().unique(), // For idempotency
  eventType: varchar("event_type", { length: 64 }).notNull(),
  payload: text("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
});
