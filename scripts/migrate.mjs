#!/usr/bin/env node
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes("neon.tech") ||
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running migrations...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        TEXT NOT NULL,
        api_key_hash TEXT NOT NULL UNIQUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log("  ✓ workspaces table");

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        actor        JSONB NOT NULL,
        action       TEXT NOT NULL,
        target       JSONB NOT NULL,
        metadata     JSONB,
        ip_address   TEXT,
        user_agent   TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log("  ✓ events table");

    await client.query(`
      CREATE INDEX IF NOT EXISTS events_workspace_id_created_at
        ON events (workspace_id, created_at DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS events_actor_email
        ON events ((actor->>'email'));
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS events_action
        ON events (action);
    `);
    console.log("  ✓ indexes");

    console.log("Migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
