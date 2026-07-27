export function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("quota exceeded") ||
    msg.includes("quota") ||
    msg.includes("resource exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("rate_limit")
  );
}
