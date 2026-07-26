import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(getGeminiApiKey());
  }
  return client;
}

export function resetGeminiClient(): void {
  client = null;
}

export const GEMINI_MODEL = "gemini-2.0-flash";
