import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

function createGeminiClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getGeminiApiKey());
}

export const geminiClient = createGeminiClient();

export const GEMINI_MODEL = "gemini-2.0-flash";
