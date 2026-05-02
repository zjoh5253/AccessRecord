import { describe, expect, it } from "vitest";
import { SpendCircuitBreaker } from "../src/index.js";

describe("SpendCircuitBreaker", () => {
  it("allows a request exactly at the per-request threshold", () => {
    const breaker = new SpendCircuitBreaker({
      perRequestTokens: 100,
      perUserPerDayTokens: 500,
      perDayTokens: 1000
    });

    const decision = breaker.evaluate({ userId: "u1", requestTokens: 100 });

    expect(decision.allowed).toBe(true);
    expect(decision.userTokensUsedToday).toBe(100);
    expect(decision.dayTokensUsed).toBe(100);
  });

  it("denies a request above per-request threshold and records telemetry", () => {
    const breaker = new SpendCircuitBreaker({
      perRequestTokens: 100,
      perUserPerDayTokens: 500,
      perDayTokens: 1000
    });

    const decision = breaker.evaluate({ userId: "u1", requestTokens: 101 });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("per_request_limit_exceeded");
    expect(breaker.getTelemetrySnapshot()).toEqual({
      allowedRequests: 0,
      deniedRequests: 1,
      deniedByReason: {
        per_request_limit_exceeded: 1,
        per_user_per_day_limit_exceeded: 0,
        per_day_limit_exceeded: 0
      }
    });
  });

  it("denies when per-user-per-day budget would be exceeded", () => {
    const breaker = new SpendCircuitBreaker({
      perRequestTokens: 100,
      perUserPerDayTokens: 150,
      perDayTokens: 1000
    });

    expect(breaker.evaluate({ userId: "u1", requestTokens: 100 }).allowed).toBe(
      true
    );
    const denied = breaker.evaluate({ userId: "u1", requestTokens: 60 });

    expect(denied.allowed).toBe(false);
    expect(denied.reason).toBe("per_user_per_day_limit_exceeded");
  });

  it("denies when global per-day budget would be exceeded", () => {
    const breaker = new SpendCircuitBreaker({
      perRequestTokens: 100,
      perUserPerDayTokens: 1000,
      perDayTokens: 150
    });

    expect(breaker.evaluate({ userId: "u1", requestTokens: 100 }).allowed).toBe(
      true
    );
    const denied = breaker.evaluate({ userId: "u2", requestTokens: 60 });

    expect(denied.allowed).toBe(false);
    expect(denied.reason).toBe("per_day_limit_exceeded");
  });

  it("resets day-scoped counters at UTC day rollover", () => {
    const breaker = new SpendCircuitBreaker({
      perRequestTokens: 100,
      perUserPerDayTokens: 100,
      perDayTokens: 100
    });

    const day1 = new Date("2026-05-01T23:59:00.000Z");
    const day2 = new Date("2026-05-02T00:00:00.000Z");

    expect(
      breaker.evaluate({ userId: "u1", requestTokens: 100, now: day1 }).allowed
    ).toBe(true);
    expect(
      breaker.evaluate({ userId: "u1", requestTokens: 1, now: day1 }).reason
    ).toBe("per_user_per_day_limit_exceeded");
    const nextDay = breaker.evaluate({ userId: "u1", requestTokens: 100, now: day2 });
    expect(nextDay.allowed).toBe(true);
    expect(nextDay.userTokensUsedToday).toBe(100);
  });

  it("tracks denial counts by reason across mixed traffic", () => {
    const breaker = new SpendCircuitBreaker({
      perRequestTokens: 100,
      perUserPerDayTokens: 150,
      perDayTokens: 180
    });

    breaker.evaluate({ userId: "u1", requestTokens: 100 });
    breaker.evaluate({ userId: "u1", requestTokens: 1000 });
    breaker.evaluate({ userId: "u1", requestTokens: 60 });
    breaker.evaluate({ userId: "u2", requestTokens: 90 });

    expect(breaker.getTelemetrySnapshot()).toEqual({
      allowedRequests: 1,
      deniedRequests: 3,
      deniedByReason: {
        per_request_limit_exceeded: 1,
        per_user_per_day_limit_exceeded: 1,
        per_day_limit_exceeded: 1
      }
    });
  });

  it("prevents global daily-limit bypass from out-of-order timestamps", () => {
    const breaker = new SpendCircuitBreaker({
      perRequestTokens: 100,
      perUserPerDayTokens: 1000,
      perDayTokens: 150
    });

    const day1 = new Date("2026-05-01T23:58:00.000Z");
    const day2 = new Date("2026-05-02T00:01:00.000Z");

    expect(
      breaker.evaluate({ userId: "u1", requestTokens: 100, now: day1 }).allowed
    ).toBe(true);
    expect(
      breaker.evaluate({ userId: "u2", requestTokens: 100, now: day2 }).allowed
    ).toBe(true);
    expect(
      breaker.evaluate({ userId: "u3", requestTokens: 60, now: day1 }).reason
    ).toBe("per_day_limit_exceeded");
  });

  it("tracks per-user usage independently per day under interleaved traffic", () => {
    const breaker = new SpendCircuitBreaker({
      perRequestTokens: 100,
      perUserPerDayTokens: 100,
      perDayTokens: 1000
    });

    const day1 = new Date("2026-05-01T10:00:00.000Z");
    const day2 = new Date("2026-05-02T10:00:00.000Z");

    expect(
      breaker.evaluate({ userId: "u1", requestTokens: 100, now: day1 }).allowed
    ).toBe(true);
    expect(
      breaker.evaluate({ userId: "u1", requestTokens: 100, now: day2 }).allowed
    ).toBe(true);
    expect(
      breaker.evaluate({ userId: "u1", requestTokens: 1, now: day1 }).reason
    ).toBe("per_user_per_day_limit_exceeded");
  });
});
