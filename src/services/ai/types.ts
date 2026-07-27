import type { Prompt } from "@/types/ai";

export interface AIProvider {
  name: string;
  generate(prompt: Prompt): Promise<object>;
}
