import { pgTable, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { tenants, properties } from "./tenants";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  email: varchar("email", { length: 128 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: varchar("phone", { length: 32 }),
  active: boolean("active").default(true).notNull(),
  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const roles = pgTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  name: text("name").notNull(), // "Promoteur", "Directeur de Site", "Réceptionniste", "Serveuse", etc.
  code: varchar("code", { length: 32 }).notNull(),
  description: text("description"),
  maxDiscountPercent: varchar("max_discount_percent", { length: 5 }).default("0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(), // e.g. "pms:reservations:create", "discounts:approve"
  description: text("description").notNull(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roleId: varchar("role_id", { length: 36 }).notNull().references(() => roles.id),
  permissionCode: varchar("permission_code", { length: 64 }).notNull().references(() => permissions.code),
});

export const memberships = pgTable("memberships", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 36 }).notNull().references(() => tenants.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  roleId: varchar("role_id", { length: 36 }).notNull().references(() => roles.id),
  propertyId: varchar("property_id", { length: 36 }).references(() => properties.id), // null = all properties in tenant (e.g. Promoteur)
  isTemporary: boolean("is_temporary").default(false).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
