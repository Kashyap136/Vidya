import { describe, it, expect, beforeEach } from "vitest";
import { getGeminiClient, resetGeminiClient, GEMINI_MODEL } from "@/config/gemini";

describe("GeminiConfig", () => {
  beforeEach(() => {
    resetGeminiClient();
  });

  it("does not throw when creating client with valid API key", () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key-12345";
    try {
      const client = getGeminiClient();
      expect(client).toBeDefined();
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("throws when creating client without API key", () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      expect(() => getGeminiClient()).toThrow("GEMINI_API_KEY is not configured");
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("returns cached client on second call", () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key-12345";
    try {
      const a = getGeminiClient();
      const b = getGeminiClient();
      expect(a).toBe(b);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("provides a valid model name", () => {
    expect(GEMINI_MODEL).toBe("gemini-2.0-flash");
  });
});
