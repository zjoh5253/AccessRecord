import { NextRequest, NextResponse } from "next/server";
import { lookupWorkspace } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limiter";

interface Actor {
  id: string;
  name?: string;
  email?: string;
}

interface Target {
  id: string;
  type: string;
  name?: string;
}

interface EventPayload {
  actor: Actor;
  action: string;
  target: Target;
  metadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  // Auth
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }

  const workspace = await lookupWorkspace(apiKey);
  if (!workspace) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Rate limit
  if (!checkRateLimit(workspace.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded: max 1000 events/minute" },
      { status: 429 }
    );
  }

  // Parse body
  let body: EventPayload;
  try {
    body = await req.json() as EventPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  if (!body.actor || !body.action || !body.target) {
    return NextResponse.json(
      { error: "Missing required fields: actor, action, target" },
      { status: 400 }
    );
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const db = getDb();
  const result = await db.query<{ id: string; created_at: Date }>(
    `INSERT INTO events (workspace_id, actor, action, target, metadata, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, created_at`,
    [
      workspace.id,
      JSON.stringify(body.actor),
      body.action,
      JSON.stringify(body.target),
      body.metadata ? JSON.stringify(body.metadata) : null,
      ipAddress,
      userAgent,
    ]
  );

  const row = result.rows[0];
  return NextResponse.json({ id: row.id, created_at: row.created_at }, { status: 201 });
}
