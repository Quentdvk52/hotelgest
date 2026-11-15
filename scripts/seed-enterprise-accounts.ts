import * as dotenv from "dotenv";
import * as crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import { SEED_TENANT, SEED_USERS } from "../src/lib/db/seed";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(dbUrl);

// Explicit passwords map for all created personnel
export const USER_PASSWORDS: Record<string, string> = {
  "gnacadjaeddy@gmail.com": "EddyEZO@17",
  "daf@hotel-levignoble.bj": "DafVignoble#2026",
  "comptable@hotel-levignoble.bj": "ComptaVignoble*2026",
  "caisse.centrale@hotel-levignoble.bj": "CaisseCentrale!2026",
  "gerant.bohicon@hotel-levignoble.bj": "GerantBoh#2026",
  "gerant.abomey@hotel-levignoble.bj": "GerantAbm#2026",
  "gerant.calavi@hotel-levignoble.bj": "GerantAbc#2026",
  "gerant.zogbo@hotel-levignoble.bj": "GerantZog#2026",
  "serveuse.boh@hotel-levignoble.bj": "ServeuseBoh!2026",
  "serveuse.abm@hotel-levignoble.bj": "ServeuseAbm!2026",
  "serveuse.abc@hotel-levignoble.bj": "ServeuseAbc!2026",
  "serveuse.zog@hotel-levignoble.bj": "ServeuseZog!2026",
  "reception.boh@hotel-levignoble.bj": "RecepBoh!2026",
  "reception.abc@hotel-levignoble.bj": "RecepAbc!2026",
  "chef.boh@hotel-levignoble.bj": "ChefBoh*2026",
  "chef.abc@hotel-levignoble.bj": "ChefAbc*2026",
  "barman.boh@hotel-levignoble.bj": "BarBoh#2026",
  "barman.abc@hotel-levignoble.bj": "BarAbc#2026",
  "traiteur.event@hotel-levignoble.bj": "TraiteurEvent#2026",
  "housekeeping@hotel-levignoble.bj": "Housekeeping*2026",
};

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function run() {
  console.log("Connecting to Neon PostgreSQL to seed enterprise accounts...");

  // 1. Ensure all Roles exist
  for (const user of SEED_USERS) {
    const roleId = `role-${user.roleCode.toLowerCase()}`;
    await sql`
      INSERT INTO roles (id, tenant_id, name, code, max_discount_percent)
      VALUES (${roleId}, ${SEED_TENANT.id}, ${user.roleName}, ${user.roleCode}, ${user.maxDiscount})
      ON CONFLICT (id) DO UPDATE 
      SET name = EXCLUDED.name, max_discount_percent = EXCLUDED.max_discount_percent;
    `;
  }
  console.log("✓ Roles created/updated in Neon");

  // 2. Insert or update each user and membership
  for (const user of SEED_USERS) {
    const rawPass = USER_PASSWORDS[user.email] || "Vignoble#2026";
    const passwordHash = hashPassword(rawPass);
    const roleId = `role-${user.roleCode.toLowerCase()}`;
    const membershipId = `mem-${user.id}`;

    // Upsert User
    await sql`
      INSERT INTO users (id, tenant_id, email, full_name, password_hash, active)
      VALUES (${user.id}, ${SEED_TENANT.id}, ${user.email}, ${user.fullName}, ${passwordHash}, true)
      ON CONFLICT (id) DO UPDATE 
      SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, active = true;
    `;

    // Upsert Membership
    await sql`
      INSERT INTO memberships (id, tenant_id, user_id, role_id, property_id)
      VALUES (${membershipId}, ${SEED_TENANT.id}, ${user.id}, ${roleId}, ${user.propertyId})
      ON CONFLICT (id) DO UPDATE 
      SET role_id = EXCLUDED.role_id, property_id = EXCLUDED.property_id;
    `;
  }
  console.log(`✓ ${SEED_USERS.length} Enterprise users & memberships successfully seeded into Neon!`);

  // Verify in Neon
  const count = await sql`SELECT count(*) as count FROM users WHERE tenant_id = ${SEED_TENANT.id};`;
  console.log(`Verified total users in Neon: ${count[0].count}`);
}

async function runWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connecting to Neon PostgreSQL (attempt ${attempt}/${maxRetries})...`);
      await run();
      return;
    } catch (err: any) {
      console.warn(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      console.log("Waiting 3s for Neon compute endpoint to activate...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

if (process.argv[1]?.includes("seed-enterprise-accounts")) {
  runWithRetry().catch((err) => {
    console.error("Error seeding enterprise accounts:", err);
    process.exit(1);
  });
}
