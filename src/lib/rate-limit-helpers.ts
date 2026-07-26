import { createRateLimiter, getClientIp, rateLimitKey } from "./rate-limiter";

export const loginLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
export const registerLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });
export const passwordResetLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });
export const aiGenerationLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });

export async function checkRateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  prefix: string,
): Promise<{ success: false; error: { code: string; message: string } } | null> {
  const ip = await getClientIp();
  const key = rateLimitKey(prefix, ip);
  const result = limiter(key);

  if (!result.allowed) {
    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: `Too many requests. Please try again in ${Math.ceil(result.retryAfterMs / 1000)} seconds.`,
      },
    };
  }

  return null;
}
