# AI Provider Architecture

## Overview

Vidya supports multiple AI providers with automatic fallback. The architecture is provider-agnostic — business logic (syllabus extraction, quiz generation) calls `geminiService.generate(prompt)` and never needs to know which provider handles the request.

```
Business Logic (prompt-builder, extraction-pipeline, quiz-service)
    │
    ▼
src/services/gemini.ts  (legacy alias, unchanged import path)
    │
    ▼
src/services/ai/ai-service.ts  (orchestrator)
    │
    ├──▸ providers/gemini-provider.ts  (primary)
    │
    └──▸ providers/nvidia-provider.ts  (fallback on rate limit)
```

## Provider Flow

1. All consumers import `{ geminiService }` from `@/services/gemini`
2. `geminiService` is an alias for the orchestrator `aiService` in `src/services/ai/`
3. The orchestrator tries providers in order: Gemini first, then NVIDIA
4. Each provider implements the `AIProvider` interface

## Fallback Flow

```
geminiService.generate(prompt)
    │
    ▼
Gemini provider: generate(prompt)
    │
    ├── Success → return parsed JSON
    │
    └── Rate-limit error (429, quota, resource exhausted) ──▶ NVIDIA provider: generate(prompt)
                                                                │
                                                                ├── Success → return parsed JSON
                                                                │
                                                                └── Any error → throw ALL_PROVIDERS_FAILED
```

Conditions that trigger fallback:
- HTTP 429
- "too many requests"
- "quota exceeded"
- "resource exhausted"
- "rate limit"

Non-rate-limit errors from the primary provider (e.g., invalid JSON, network failure) propagate immediately — they do NOT trigger fallback. Only rate-limit errors trigger a retry.

Maximum fallback attempts: **1** (Gemini → NVIDIA, no further retries).

## Files

| File | Role |
|------|------|
| `src/services/ai/types.ts` | `AIProvider` interface |
| `src/services/ai/errors.ts` | `isRateLimitError()` detection |
| `src/services/ai/ai-service.ts` | Orchestrator with `runWithFallback()` |
| `src/services/ai/providers/gemini-provider.ts` | Gemini 2.0 Flash provider |
| `src/services/ai/providers/nvidia-provider.ts` | NVIDIA (OpenAI-compatible) provider |
| `src/services/gemini.ts` | Legacy alias — re-exports `aiService` as `geminiService` |
| `src/config/gemini.ts` | Legacy Gemini client factory (unchanged, still works independently) |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | — | Google AI Studio API key |
| `NVIDIA_API_KEY` | No | — | NVIDIA AI Foundation API key (needed for fallback) |
| `NVIDIA_MODEL` | No | `z-ai/glm-5.2` | NVIDIA model to use |

## Adding a New Provider

1. Create `src/services/ai/providers/<name>-provider.ts`
2. Implement the `AIProvider` interface:

```ts
import type { AIProvider } from "../types";
import type { Prompt } from "@/types/ai";

export const myProvider: AIProvider = {
  name: "my-provider",
  async generate(prompt: Prompt): Promise<object> {
    // Call AI API, parse JSON, return object
    // Throw ServiceError on failure
  },
};
```

3. Add to the provider list in `src/services/ai/ai-service.ts`:

```ts
import { myProvider } from "./providers/my-provider";

export const aiService = {
  async generate(prompt: Prompt): Promise<object> {
    return runWithFallback(prompt, [geminiProvider, nvidiaProvider, myProvider]);
  },
};
```

The orchestrator tries providers in array order, falling back on rate-limit errors.

## Switching Default Provider

To change which provider is tried first, reorder the array in `ai-service.ts`:

```ts
return runWithFallback(prompt, [nvidiaProvider, geminiProvider]);
```

## How to Test NVIDIA

```bash
# Set your key in .env.local, then:
npx tsx --env-file=.env.local scripts/test-nvidia.ts
```

This sends a simple "Hello" prompt and prints the JSON response.

## Logging

Every AI call logs:
- **START**: provider name, model, timeout
- **END**: response time, response length
- **FAILED**: response time, error message
- **Fallback**: failed provider, next provider, response time, error

API keys are never logged.
