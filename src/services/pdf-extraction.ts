import { PDFParse, VerbosityLevel } from "pdf-parse";
import { ValidationError } from "./errors";
import { logger } from "@/lib/logger";
import type { ExtractionResult } from "@/types/ai";

export const EXTRACTION_TIMEOUT_MS = 30_000;
export const MAX_PAGE_COUNT = 200;

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`PDF extraction timed out during ${label}`)), ms),
    ),
  ]);
}

export const pdfExtractionService = {
  async extract(buffer: Buffer): Promise<ExtractionResult> {
    const start = performance.now();

    if (buffer.length === 0) {
      throw new ValidationError("Cannot extract text from an empty file");
    }

    let parser: PDFParse | null = null;

    try {
      parser = new PDFParse({ verbosity: VerbosityLevel.ERRORS, data: buffer });

      // @ts-expect-error - load() is accessible at runtime despite TS private
      await withTimeout(parser.load(), EXTRACTION_TIMEOUT_MS, "load");

      const textResult = await withTimeout(parser.getText(), EXTRACTION_TIMEOUT_MS, "getText");
      const typedResult = textResult as unknown as { pages: { text: string; num: number }[] };
      const pages = typedResult.pages ?? [];

      if (pages.length === 0) {
        throw new ValidationError(
          "No extractable text found in this PDF. It may contain only images or scanned content.",
        );
      }

      if (pages.length > MAX_PAGE_COUNT) {
        throw new ValidationError(
          `PDF has ${pages.length} pages, which exceeds the maximum of ${MAX_PAGE_COUNT}. Please upload a shorter document.`,
        );
      }

      const allText = pages.map((p) => p.text).join("\n\n").trim();

      if (!allText || allText.length < 50) {
        throw new ValidationError(
          "This PDF appears to contain only images. Text extraction requires a PDF with selectable text.",
        );
      }

      const duration = performance.now() - start;
      logger.info("PDF text extraction completed", {
        pageCount: pages.length,
        charCount: allText.length,
        durationMs: Math.round(duration),
      });

      return {
        text: allText,
        pageCount: pages.length,
        pages,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown extraction error";

      if (message.includes("password") || message.includes("encrypted") || message.includes("PasswordException")) {
        throw new ValidationError("This PDF is encrypted or password-protected and cannot be processed.");
      }

      if (message.includes("corrupt") || message.includes("InvalidPDF")) {
        throw new ValidationError("This PDF appears to be corrupted and cannot be processed.");
      }

      logger.error("PDF extraction failed", { error: message });
      throw error;
    } finally {
      parser?.destroy();
    }
  },
};
