import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";
import { ServiceError } from "@/services/errors";
import type { AIProvider } from "../types";
import type { Prompt } from "@/types/ai";

const TIMEOUT_MS = 60000;
const MODEL = "gemini-2.0-flash";

let client: GoogleGenerativeAI | null = null;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

function getClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(getApiKey());
  }
  return client;
}

export const geminiProvider: AIProvider = {
  name: "gemini",

  async generate(prompt: Prompt): Promise<object> {
    const start = performance.now();
    logger.info("[AI:gemini] START", { model: MODEL, timeoutMs: TIMEOUT_MS });

    try {
      const model = getClient().getGenerativeModel({
        model: MODEL,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini request timed out")), TIMEOUT_MS),
      );

      const result = await Promise.race([
        model.generateContent([prompt.systemInstruction, prompt.contents]),
        timeoutPromise,
      ]);

      const response = result.response;
      const text = response.text();

      const duration = performance.now() - start;
      logger.info("[AI:gemini] END", { durationMs: Math.round(duration), responseLength: text.length });

      try {
        const parsed = JSON.parse(text) as object;
        return parsed;
      } catch {
        logger.error("[AI:gemini] Invalid JSON", { responsePreview: text.slice(0, 500) });
        throw new ServiceError("Gemini returned invalid JSON", "AI_INVALID_JSON", 422);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const duration = performance.now() - start;
      logger.error("[AI:gemini] FAILED", { durationMs: Math.round(duration), error: message });
      throw error instanceof Error ? error : new ServiceError(message, "AI_FAILURE", 500);
    }
  },
};
