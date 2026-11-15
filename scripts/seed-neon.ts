import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import {
  SEED_TENANT,
  SEED_ORGANIZATION,
  SEED_PROPERTIES,
  SEED_USERS,
  SEED_ROOM_TYPES,
  SEED_UNITS,
  SEED_DINING_TABLES,
  SEED_MENU_ITEMS,
  SEED_CATERING_MENUS,
  SEED_EQUIPMENT_ITEMS,
} from "../src/lib/db/seed";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(dbUrl);

async function seed() {
  console.log("Seeding data into Neon PostgreSQL...");

  // 1. Tenant
  await sql`
    INSERT INTO tenants (id, name, slug, country, default_currency)
    VALUES (${SEED_TENANT.id}, ${SEED_TENANT.name}, ${SEED_TENANT.slug}, ${SEED_TENANT.country}, ${SEED_TENANT.defaultCurrency})
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log("✓ Tenant seeded");

  // 2. Organization
  await sql`
    INSERT INTO organizations (id, tenant_id, name, legal_registration, tax_identifier)
    VALUES (${SEED_ORGANIZATION.id}, ${SEED_ORGANIZATION.tenantId}, ${SEED_ORGANIZATION.name}, ${SEED_ORGANIZATION.legalRegistration}, ${SEED_ORGANIZATION.taxIdentifier})
    ON CONFLICT (id) DO NOTHING;
  `;
  console.log("✓ Organization seeded");

  // 3. Properties
  for (const prop of SEED_PROPERTIES) {
    await sql`
      INSERT INTO properties (id, tenant_id, organization_id, name, code, city, address, phone, email, accounting_currency)
      VALUES (${prop.id}, ${prop.tenantId}, ${prop.organizationId}, ${prop.name}, ${prop.code}, ${prop.city}, ${prop.address}, ${prop.phone}, ${prop.email}, 'XOF')
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`✓ ${SEED_PROPERTIES.length} Properties seeded (BOH, ABM, ABC, ZOG)`);

  // 4. Roles & Users
  for (const user of SEED_USERS) {
    const roleId = `role-${user.roleCode.toLowerCase()}`;
    await sql`
      INSERT INTO roles (id, tenant_id, name, code, max_discount_percent)
      VALUES (${roleId}, ${SEED_TENANT.id}, ${user.roleName}, ${user.roleCode}, ${user.maxDiscount})
      ON CONFLICT (id) DO NOTHING;
    `;
    await sql`
      INSERT INTO users (id, tenant_id, email, full_name, password_hash, active)
      VALUES (${user.id}, ${SEED_TENANT.id}, ${user.email}, ${user.fullName}, 'argon2id_mock_hash_for_pilot', true)
      ON CONFLICT (id) DO NOTHING;
    `;
    await sql`
      INSERT INTO memberships (id, tenant_id, user_id, role_id, property_id)
      VALUES (${`mem-${user.id}`}, ${SEED_TENANT.id}, ${user.id}, ${roleId}, ${user.propertyId})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`✓ ${SEED_USERS.length} Roles, Users and Memberships seeded`);

  // 5. Room types & Units
  for (const rt of SEED_ROOM_TYPES) {
    await sql`
      INSERT INTO room_types (id, tenant_id, property_id, name, code, capacity, base_price_xof, description)
      VALUES (${rt.id}, ${SEED_TENANT.id}, ${rt.propertyId}, ${rt.name}, ${rt.code}, ${rt.capacity}, ${rt.basePriceXof}, ${rt.description})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  for (const unit of SEED_UNITS) {
    await sql`
      INSERT INTO units (id, tenant_id, property_id, room_type_id, unit_number, floor, status, housekeeping_status)
      VALUES (${unit.id}, ${SEED_TENANT.id}, ${unit.propertyId}, ${unit.roomTypeId}, ${unit.unitNumber}, ${unit.floor}, 'AVAILABLE', 'CLEAN')
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`✓ ${SEED_ROOM_TYPES.length} Room Types and ${SEED_UNITS.length} Units seeded`);

  // 6. Dining tables
  for (const table of SEED_DINING_TABLES) {
    await sql`
      INSERT INTO dining_tables (id, tenant_id, property_id, table_number, capacity, zone, active)
      VALUES (${table.id}, ${SEED_TENANT.id}, ${table.propertyId}, ${table.tableNumber}, ${table.capacity}, ${table.zone}, true)
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`✓ ${SEED_DINING_TABLES.length} Dining Tables seeded`);

  // 7. Menu categories and Menu items
  const catId = "cat-resto-boh-01";
  await sql`
    INSERT INTO menu_categories (id, tenant_id, property_id, name, sort_order, active)
    VALUES (${catId}, ${SEED_TENANT.id}, 'prop-bohicon-001', 'Carte du Vignoble', 1, true)
    ON CONFLICT (id) DO NOTHING;
  `;
  for (const item of SEED_MENU_ITEMS) {
    await sql`
      INSERT INTO menu_items (id, tenant_id, property_id, category_id, target_station_code, name, description, price_xof, allergens, is_available)
      VALUES (${item.id}, ${SEED_TENANT.id}, ${item.propertyId}, ${catId}, ${item.targetStationCode}, ${item.name}, ${item.description}, ${item.priceXof}, ${item.allergens}, true)
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`✓ ${SEED_MENU_ITEMS.length} Menu Items seeded (Cuisine, Bar, Cave)`);

  // 8. Catering menus
  for (const menu of SEED_CATERING_MENUS) {
    await sql`
      INSERT INTO catering_menus (id, tenant_id, property_id, name, price_per_person_xof, min_guests, min_notice_hours, description, active)
      VALUES (${menu.id}, ${SEED_TENANT.id}, ${menu.propertyId}, ${menu.name}, ${menu.pricePerPersonXof}, ${menu.minGuests}, 48, ${menu.description}, true)
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`✓ ${SEED_CATERING_MENUS.length} Catering Menus seeded`);

  // 9. Equipment items
  for (const eq of SEED_EQUIPMENT_ITEMS) {
    await sql`
      INSERT INTO equipment_items (id, tenant_id, property_id, name, category, total_stock, daily_rental_price_xof, deposit_per_unit_xof, replacement_cost_xof, condition_status, active)
      VALUES (${eq.id}, ${SEED_TENANT.id}, ${eq.propertyId}, ${eq.name}, ${eq.category}, ${eq.totalStock}, ${eq.dailyRentalPriceXof}, ${eq.depositPerUnitXof}, ${eq.replacementCostXof}, 'EXCELLENT', true)
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log(`✓ ${SEED_EQUIPMENT_ITEMS.length} Equipment Items seeded (Chaises, Tables, Bâches, Couverts, Plats)`);

  console.log("\n🎉 ALL SEED DATA SUCCESSFULLY INSERTED INTO NEON!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
