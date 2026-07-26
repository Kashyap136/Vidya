import { getGeminiClient, GEMINI_MODEL } from "@/config/gemini";
import { logger } from "@/lib/logger";
import { ServiceError } from "./errors";
import type { Prompt } from "@/types/ai";

const TIMEOUT_MS = 60000;

export const geminiService = {
  async generate(prompt: Prompt): Promise<object> {
    const start = performance.now();
    logger.info("[Gemini] START", { model: GEMINI_MODEL, timeoutMs: TIMEOUT_MS });

    try {
      const model = getGeminiClient().getGenerativeModel({
        model: GEMINI_MODEL,
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
      logger.info("[Gemini] END", { durationMs: Math.round(duration), responseLength: text.length });

      try {
        const parsed = JSON.parse(text) as object;
        return parsed;
      } catch {
        logger.error("[Gemini] Invalid JSON", { responsePreview: text.slice(0, 500) });
        throw new ServiceError("Gemini returned invalid JSON", "AI_INVALID_JSON", 422);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const duration = performance.now() - start;
      logger.error("[Gemini] FAILED", { durationMs: Math.round(duration), error: message });
      throw error instanceof Error ? error : new ServiceError(message, "AI_FAILURE", 500);
    }
  },
};
