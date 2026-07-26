import { describe, it, expect } from "vitest";
import { EXTRACTION_TIMEOUT_MS, MAX_PAGE_COUNT, withTimeout } from "@/services/pdf-extraction";

describe("PDF Extraction", () => {
  it("has correct timeout constant", () => {
    expect(EXTRACTION_TIMEOUT_MS).toBe(30_000);
    expect(MAX_PAGE_COUNT).toBe(200);
  });

  it("withTimeout rejects on timeout", async () => {
    const slowPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve("done"), 500),
    );

    await expect(withTimeout(slowPromise, 10, "test")).rejects.toThrow(
      "PDF extraction timed out during test",
    );
  });

  it("withTimeout resolves normally when fast enough", async () => {
    const fastPromise = Promise.resolve("ok");
    const result = await withTimeout(fastPromise, 1000, "test");
    expect(result).toBe("ok");
  });
});
