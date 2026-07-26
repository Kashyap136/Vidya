import { describe, it, expect, beforeEach } from "vitest";
import { createRateLimiter, resetRateLimiterStore } from "@/lib/rate-limiter";

describe("RateLimiter", () => {
  beforeEach(() => {
    resetRateLimiterStore();
  });

  it("allows first request", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });
    const result = limiter("key-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("allows requests within limit", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });
    limiter("key-2");
    limiter("key-2");
    const result = limiter("key-2");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("blocks requests exceeding limit", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 2 });
    limiter("key-3");
    limiter("key-3");
    const result = limiter("key-3");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("treats different keys independently", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 1 });
    limiter("key-a");
    const resultA = limiter("key-a");
    expect(resultA.allowed).toBe(false);

    const resultB = limiter("key-b");
    expect(resultB.allowed).toBe(true);
  });

  it("resets after window expires", async () => {
    const limiter = createRateLimiter({ windowMs: 50, maxRequests: 1 });
    limiter("key-5");
    const blocked = limiter("key-5");
    expect(blocked.allowed).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 60));

    const allowed = limiter("key-5");
    expect(allowed.allowed).toBe(true);
  });
});
