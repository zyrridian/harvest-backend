import "dotenv/config";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  console.log("🔄 Running migrations manually...");

  // Read the migration SQL files
  const migrations = [
    "20260110050100_init_schema/migration.sql",
    "20260110051141_add_auth_models/migration.sql",
    "20260110053917_add_user_profiles/migration.sql",
    "20260110091040_add_products_categories_farmers/migration.sql",
    "20260110092140_add_cart_orders_addresses/migration.sql",
    "20260110093525_add_reviews_search_messaging/migration.sql",
    "20260110095430_add_notifications_community_utility/migration.sql",
  ];

  const client = await pool.connect();

  try {
    for (const migration of migrations) {
      console.log(`  Applying ${migration}...`);
      const sql = readFileSync(
        join(__dirname, "migrations", migration),
        "utf-8",
      );
      await client.query(sql);
      console.log(`  ✅ ${migration} applied`);
    }
    console.log("✅ All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
