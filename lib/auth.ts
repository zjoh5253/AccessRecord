import { createHash } from "crypto";
import { getDb } from "./db";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function lookupWorkspace(
  apiKey: string
): Promise<{ id: string; name: string } | null> {
  const db = getDb();
  const hashed = hashApiKey(apiKey);
  const result = await db.query<{ id: string; name: string }>(
    "SELECT id, name FROM workspaces WHERE api_key_hash = $1",
    [hashed]
  );
  return result.rows[0] ?? null;
}
