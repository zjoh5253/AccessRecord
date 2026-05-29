#!/usr/bin/env node
import pg from "pg";
import { createHash, randomBytes } from "crypto";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes("neon.tech") ||
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

function hashApiKey(key) {
  return createHash("sha256").update(key).digest("hex");
}

const SAMPLE_EVENTS = [
  {
    actor: { id: "user_001", name: "Alice Johnson", email: "alice@acme.com" },
    action: "document.created",
    target: { id: "doc_001", type: "document", name: "Q1 Financial Report" },
    metadata: { size_bytes: 204800 },
  },
  {
    actor: { id: "user_002", name: "Bob Smith", email: "bob@acme.com" },
    action: "document.viewed",
    target: { id: "doc_001", type: "document", name: "Q1 Financial Report" },
    metadata: null,
  },
  {
    actor: { id: "user_001", name: "Alice Johnson", email: "alice@acme.com" },
    action: "user.invited",
    target: { id: "user_003", type: "user", name: "Carol Williams" },
    metadata: { role: "viewer" },
  },
  {
    actor: { id: "user_002", name: "Bob Smith", email: "bob@acme.com" },
    action: "document.deleted",
    target: { id: "doc_002", type: "document", name: "Draft Budget" },
    metadata: null,
  },
  {
    actor: { id: "user_003", name: "Carol Williams", email: "carol@acme.com" },
    action: "settings.updated",
    target: { id: "workspace_001", type: "workspace", name: "Acme Corp" },
    metadata: { changed_fields: ["billing_email", "plan"] },
  },
  {
    actor: { id: "user_001", name: "Alice Johnson", email: "alice@acme.com" },
    action: "api_key.created",
    target: { id: "key_001", type: "api_key", name: "Production Key" },
    metadata: null,
  },
  {
    actor: { id: "user_002", name: "Bob Smith", email: "bob@acme.com" },
    action: "member.role_changed",
    target: { id: "user_003", type: "user", name: "Carol Williams" },
    metadata: { old_role: "viewer", new_role: "editor" },
  },
  {
    actor: { id: "user_003", name: "Carol Williams", email: "carol@acme.com" },
    action: "document.exported",
    target: { id: "doc_001", type: "document", name: "Q1 Financial Report" },
    metadata: { format: "pdf" },
  },
  {
    actor: { id: "user_001", name: "Alice Johnson", email: "alice@acme.com" },
    action: "member.removed",
    target: { id: "user_004", type: "user", name: "Dave Brown" },
    metadata: null,
  },
  {
    actor: { id: "user_002", name: "Bob Smith", email: "bob@acme.com" },
    action: "billing.plan_upgraded",
    target: { id: "workspace_001", type: "workspace", name: "Acme Corp" },
    metadata: { old_plan: "starter", new_plan: "growth" },
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    // Create test workspace
    const rawKey = `test_${randomBytes(16).toString("hex")}`;
    const keyHash = hashApiKey(rawKey);

    const wsResult = await client.query(
      `INSERT INTO workspaces (name, api_key_hash)
       VALUES ($1, $2)
       ON CONFLICT (api_key_hash) DO NOTHING
       RETURNING id, name`,
      ["Acme Corp (test)", keyHash]
    );

    let workspaceId;
    if (wsResult.rowCount === 0) {
      // Key already existed — just look up any workspace
      const existing = await client.query(
        "SELECT id FROM workspaces LIMIT 1"
      );
      workspaceId = existing.rows[0].id;
      console.log(`Using existing workspace: ${workspaceId}`);
    } else {
      workspaceId = wsResult.rows[0].id;
      console.log(`Created workspace: ${wsResult.rows[0].name} (${workspaceId})`);
      console.log(`API key: ${rawKey}`);
    }

    // Insert sample events
    for (const event of SAMPLE_EVENTS) {
      await client.query(
        `INSERT INTO events (workspace_id, actor, action, target, metadata, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          workspaceId,
          JSON.stringify(event.actor),
          event.action,
          JSON.stringify(event.target),
          event.metadata ? JSON.stringify(event.metadata) : null,
          "203.0.113.42",
          "AccessRecord-Seed/1.0",
        ]
      );
    }

    console.log(`Inserted ${SAMPLE_EVENTS.length} sample events.`);
    console.log(`Dashboard: /dashboard/${workspaceId}`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
