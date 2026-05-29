// Simple in-memory rate limiter: max events per workspace per minute
const counters = new Map<string, { count: number; windowStart: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_EVENTS = 1000;

export function checkRateLimit(workspaceId: string): boolean {
  const now = Date.now();
  const existing = counters.get(workspaceId);

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    counters.set(workspaceId, { count: 1, windowStart: now });
    return true;
  }

  if (existing.count >= MAX_EVENTS) {
    return false;
  }

  existing.count += 1;
  return true;
}
