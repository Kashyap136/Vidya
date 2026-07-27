import { logger } from "@/lib/logger";
import { ServiceError } from "@/services/errors";
import { geminiProvider } from "./providers/gemini-provider";
import { nvidiaProvider } from "./providers/nvidia-provider";
import { isRateLimitError } from "./errors";
import type { AIProvider } from "./types";
import type { Prompt } from "@/types/ai";

const MAX_FALLBACK_ATTEMPTS = 1;

export const aiService = {
  async generate(prompt: Prompt): Promise<object> {
    return runWithFallback(prompt, [geminiProvider, nvidiaProvider]);
  },
};

async function runWithFallback(
  prompt: Prompt,
  providers: AIProvider[],
  attempt: number = 0,
): Promise<object> {
  if (attempt >= providers.length) {
    throw new ServiceError(
      "All AI providers failed",
      "ALL_PROVIDERS_FAILED",
      503,
    );
  }

  const provider = providers[attempt];
  const start = performance.now();

  try {
    const result = await provider.generate(prompt);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    const message = error instanceof Error ? error.message : String(error);

    if (attempt < MAX_FALLBACK_ATTEMPTS && isRateLimitError(error)) {
      logger.warn("[AIService] Rate limited, falling back to next provider", {
        failedProvider: provider.name,
        nextProvider: providers[attempt + 1]?.name ?? "none",
        durationMs: Math.round(duration),
        error: message,
      });
      return runWithFallback(prompt, providers, attempt + 1);
    }

    throw error;
  }
}
