export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export type ProcessingStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "PARSING"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ResourceType =
  | "documentation"
  | "textbook"
  | "video"
  | "article"
  | "practice";
