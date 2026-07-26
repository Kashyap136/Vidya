import { ValidationError } from "./errors";
import { logger } from "@/lib/logger";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPE = "application/pdf";
const ALLOWED_EXTENSION = ".pdf";
const MAGIC_BYTES = "%PDF";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

async function readHeader(file: File, bytes: number): Promise<string> {
  const blob = file.slice(0, bytes);
  const buffer = await blob.arrayBuffer();
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(buffer);
}

export const pdfValidationService = {
  validateMimeType(file: File): void {
    if (!file.type || file.type !== ALLOWED_MIME_TYPE) {
      throw new ValidationError(
        `Invalid file type. Expected ${ALLOWED_MIME_TYPE}, got ${file.type || "unknown"}.`,
      );
    }
  },

  validateExtension(file: File): void {
    const ext = getExtension(file.name);
    if (ext !== ALLOWED_EXTENSION) {
      throw new ValidationError(
        `Invalid file extension. Expected ${ALLOWED_EXTENSION}, got ${ext || "none"}.`,
      );
    }
  },

  validateFileSize(file: File, maxBytes: number = MAX_FILE_SIZE): void {
    if (file.size === 0) {
      throw new ValidationError("File is empty.");
    }
    if (file.size > maxBytes) {
      const maxMB = maxBytes / (1024 * 1024);
      const actualMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new ValidationError(
        `File size exceeds ${maxMB}MB limit (${actualMB}MB).`,
      );
    }
  },

  async validateMagicBytes(file: File): Promise<void> {
    const header = await readHeader(file, 4);
    if (!header.startsWith(MAGIC_BYTES)) {
      throw new ValidationError(
        "File does not appear to be a valid PDF (missing %PDF header).",
      );
    }
  },

  async validateFile(file: File): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      pdfValidationService.validateExtension(file);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    try {
      pdfValidationService.validateMimeType(file);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    try {
      pdfValidationService.validateFileSize(file);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    try {
      await pdfValidationService.validateMagicBytes(file);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    if (errors.length > 0) {
      logger.warn("PDF validation failed", { fileName: file.name, errors });
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  },
};
