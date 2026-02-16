import "dotenv/config";
import pg from "pg";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const client = await pool.connect();
  console.log("✅ Connected to database successfully");
  const result = await client.query("SELECT NOW()");
  console.log("✅ Query result:", result.rows[0]);
  client.release();
  await pool.end();
} catch (error) {
  console.error("❌ Connection error:", error.message);
  process.exit(1);
}
