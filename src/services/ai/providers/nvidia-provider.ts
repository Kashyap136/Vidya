import { logger } from "@/lib/logger";
import { ServiceError } from "@/services/errors";
import type { AIProvider } from "../types";
import type { Prompt } from "@/types/ai";

const BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = "z-ai/glm-5.2";
const TIMEOUT_MS = 60000;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  response_format?: { type: "json_object" };
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

function getApiKey(): string {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }
  return key;
}

function getModel(): string {
  return process.env.NVIDIA_MODEL || DEFAULT_MODEL;
}

export const nvidiaProvider: AIProvider = {
  name: "nvidia",

  async generate(prompt: Prompt): Promise<object> {
    const start = performance.now();
    const model = getModel();
    logger.info("[AI:nvidia] START", { model, timeoutMs: TIMEOUT_MS });

    const body: ChatCompletionRequest = {
      model,
      messages: [
        { role: "system", content: prompt.systemInstruction },
        { role: "user", content: prompt.contents },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        const message = `NVIDIA API error (${response.status}): ${errorText}`;

        if (response.status === 429 || response.status === 503) {
          logger.warn("[AI:nvidia] Rate limited", {
            status: response.status,
            retryAfter: response.headers.get("retry-after"),
          });
        }

        throw new ServiceError(message, "AI_PROVIDER_ERROR", response.status);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new ServiceError("NVIDIA returned empty response", "AI_EMPTY_RESPONSE", 502);
      }

      const duration = performance.now() - start;
      logger.info("[AI:nvidia] END", { durationMs: Math.round(duration), responseLength: text.length });

      try {
        const parsed = JSON.parse(text) as object;
        return parsed;
      } catch {
        logger.error("[AI:nvidia] Invalid JSON", { responsePreview: text.slice(0, 500) });
        throw new ServiceError("NVIDIA returned invalid JSON", "AI_INVALID_JSON", 422);
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ServiceError) throw error;

      const message = error instanceof Error ? error.message : String(error);
      const duration = performance.now() - start;
      logger.error("[AI:nvidia] FAILED", { durationMs: Math.round(duration), error: message });
      throw new ServiceError(`NVIDIA request failed: ${message}`, "AI_PROVIDER_ERROR", 502);
    }
  },
};
