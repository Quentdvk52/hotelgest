import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(dbUrl);

async function run() {
  console.log("Connecting to Neon PostgreSQL...");
  const testRes = await sql`SELECT NOW() as current_time, current_database() as db;`;
  console.log("Connected successfully to Neon:", testRes[0]);

  console.log("Applying schema migration...");
  const migrationPath = path.join(process.cwd(), "drizzle", "0000_tidy_thor_girl.sql");
  const sqlContent = fs.readFileSync(migrationPath, "utf-8");

  const statements = sqlContent
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Executing ${statements.length} migration statements...`);

  let applied = 0;
  let skipped = 0;

  for (const statement of statements) {
    try {
      await sql(statement);
      applied++;
    } catch (err: any) {
      // If table/relation already exists or constraint already exists, log and proceed
      if (err.message && (err.message.includes("already exists") || err.code === "42P07")) {
        skipped++;
      } else {
        console.warn("Statement note:", err.message);
      }
    }
  }

  console.log(`Migration finished: ${applied} statements executed, ${skipped} already existed.`);

  // Verify tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log(`Verified ${tables.length} tables in Neon:`);
  console.log(tables.map((t: any) => t.table_name).join(", "));
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
