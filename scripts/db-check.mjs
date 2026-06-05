import process from "node:process";
import pg from "pg";

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  const result = await client.query(
    "select current_database() as database, current_user as user_name, version() as version, now() as connected_at"
  );
  const row = result.rows[0];
  console.log("Connection successful");
  console.log(JSON.stringify(row, null, 2));
} finally {
  await client.end().catch(() => {});
}
