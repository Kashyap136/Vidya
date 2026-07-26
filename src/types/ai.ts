export interface ExtractionResult {
  text: string;
  pageCount: number;
  pages: { text: string; num: number }[];
}

export interface NormalizedText {
  text: string;
  charCount: number;
  lineCount: number;
}

export interface AiTopic {
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedHours: number;
  prerequisites: string[];
}

export interface AiResponse {
  syllabusTitle: string;
  courseCode: string | null;
  university: string | null;
  totalUnits: number | null;
  topics: AiTopic[];
}

export interface Prompt {
  systemInstruction: string;
  contents: string;
}

export interface PipelineResult {
  success: boolean;
  syllabusId: string;
  topicCount?: number;
  failedStep?: string;
  errorMessage?: string;
}
