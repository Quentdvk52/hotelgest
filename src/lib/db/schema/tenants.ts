import { pgTable, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  country: varchar("country", { length: 2 }).default("BJ").notNull(), // Bénin
  defaultCurrency: varchar("default_currency", { length: 3 }).default("XOF").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  name: text("name").notNull(), // e.g. "Hôtel Le Vignoble"
  legalRegistration: text("legal_registration"),
  taxIdentifier: text("tax_identifier"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organizations.id),
  name: text("name").notNull(), // e.g. "Hôtel Le Vignoble - Bohicon"
  code: varchar("code", { length: 10 }).notNull(), // e.g. "BOH", "ABM", "ABC", "ZOG"
  city: text("city").notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 128 }),
  accountingCurrency: varchar("accounting_currency", { length: 3 }).default("XOF").notNull(),
  timezone: varchar("timezone", { length: 64 }).default("Africa/Porto-Novo").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const departments = pgTable("departments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  name: text("name").notNull(), // e.g. "Hébergement", "Restauration", "Caisse", "Événementiel"
  code: varchar("code", { length: 16 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const outlets = pgTable("outlets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id),
  departmentId: varchar("department_id", { length: 36 }).references(() => departments.id),
  name: text("name").notNull(), // e.g. "Restaurant Principal", "Bar Lounge", "Cave à vin", "Service Traiteur"
  type: varchar("type", { length: 32 }).notNull(), // RESTAURANT, BAR, CELLAR, CATERING, FRONT_DESK
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
