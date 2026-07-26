import { describe, it, expect } from "vitest";
import { EXTRACTION_TIMEOUT_MS, MAX_PAGE_COUNT } from "@/services/pdf-extraction";

describe("PDF Extraction", () => {
  it("has correct timeout constant", () => {
    expect(EXTRACTION_TIMEOUT_MS).toBe(30_000);
    expect(MAX_PAGE_COUNT).toBe(200);
  });
});