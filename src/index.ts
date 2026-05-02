export interface SpendLimits {
  perRequestTokens: number;
  perUserPerDayTokens: number;
  perDayTokens: number;
}

export type SpendDenyReason =
  | "per_request_limit_exceeded"
  | "per_user_per_day_limit_exceeded"
  | "per_day_limit_exceeded";

export interface SpendRequest {
  userId: string;
  requestTokens: number;
  now?: Date;
}

export interface SpendDecision {
  allowed: boolean;
  reason?: SpendDenyReason;
  userTokensUsedToday: number;
  userTokensRemainingToday: number;
  dayTokensUsed: number;
  dayTokensRemaining: number;
}

export interface SpendTelemetrySnapshot {
  allowedRequests: number;
  deniedRequests: number;
  deniedByReason: Record<SpendDenyReason, number>;
}

interface DayCounter {
  tokens: number;
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function ensurePositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
}

export class SpendCircuitBreaker {
  private readonly limits: SpendLimits;
  private readonly dayCounters = new Map<string, DayCounter>();
  private readonly userDayCounters = new Map<string, DayCounter>();
  private readonly telemetry: SpendTelemetrySnapshot = {
    allowedRequests: 0,
    deniedRequests: 0,
    deniedByReason: {
      per_request_limit_exceeded: 0,
      per_user_per_day_limit_exceeded: 0,
      per_day_limit_exceeded: 0
    }
  };

  constructor(limits: SpendLimits) {
    ensurePositiveInteger(limits.perRequestTokens, "perRequestTokens");
    ensurePositiveInteger(limits.perUserPerDayTokens, "perUserPerDayTokens");
    ensurePositiveInteger(limits.perDayTokens, "perDayTokens");
    this.limits = limits;
  }

  evaluate(request: SpendRequest): SpendDecision {
    const now = request.now ?? new Date();
    const dayKey = utcDayKey(now);
    const userCounter = this.getUserCounter(request.userId, dayKey);
    const dayCounter = this.getDayCounter(dayKey);

    ensurePositiveInteger(request.requestTokens, "requestTokens");

    if (request.requestTokens > this.limits.perRequestTokens) {
      return this.deniedDecision(
        "per_request_limit_exceeded",
        userCounter.tokens,
        dayCounter.tokens
      );
    }

    if (
      userCounter.tokens + request.requestTokens >
      this.limits.perUserPerDayTokens
    ) {
      return this.deniedDecision(
        "per_user_per_day_limit_exceeded",
        userCounter.tokens,
        dayCounter.tokens
      );
    }

    if (dayCounter.tokens + request.requestTokens > this.limits.perDayTokens) {
      return this.deniedDecision(
        "per_day_limit_exceeded",
        userCounter.tokens,
        dayCounter.tokens
      );
    }

    this.telemetry.allowedRequests += 1;
    userCounter.tokens += request.requestTokens;
    dayCounter.tokens += request.requestTokens;

    return {
      allowed: true,
      userTokensUsedToday: userCounter.tokens,
      userTokensRemainingToday:
        this.limits.perUserPerDayTokens - userCounter.tokens,
      dayTokensUsed: dayCounter.tokens,
      dayTokensRemaining: this.limits.perDayTokens - dayCounter.tokens
    };
  }

  getTelemetrySnapshot(): SpendTelemetrySnapshot {
    return {
      allowedRequests: this.telemetry.allowedRequests,
      deniedRequests: this.telemetry.deniedRequests,
      deniedByReason: { ...this.telemetry.deniedByReason }
    };
  }

  getLimits(): SpendLimits {
    return { ...this.limits };
  }

  private deniedDecision(
    reason: SpendDenyReason,
    userTokensUsedToday: number,
    dayTokensUsed: number
  ): SpendDecision {
    this.telemetry.deniedRequests += 1;
    this.telemetry.deniedByReason[reason] += 1;
    return {
      allowed: false,
      reason,
      userTokensUsedToday,
      userTokensRemainingToday:
        this.limits.perUserPerDayTokens - userTokensUsedToday,
      dayTokensUsed,
      dayTokensRemaining: this.limits.perDayTokens - dayTokensUsed
    };
  }

  private getDayCounter(dayKey: string): DayCounter {
    const existing = this.dayCounters.get(dayKey);
    if (existing) {
      return existing;
    }
    const next = { tokens: 0 };
    this.dayCounters.set(dayKey, next);
    return next;
  }

  private getUserCounter(userId: string, dayKey: string): DayCounter {
    const key = `${userId}:${dayKey}`;
    const existing = this.userDayCounters.get(key);
    if (existing) {
      return existing;
    }
    const next = { tokens: 0 };
    this.userDayCounters.set(key, next);
    return next;
  }
}
