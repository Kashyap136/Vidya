import { createRequire } from "module";
import { ValidationError } from "./errors";
import { logger } from "@/lib/logger";
import type { ExtractionResult } from "@/types/ai";

const _require = createRequire(import.meta.url);

export const EXTRACTION_TIMEOUT_MS = 30_000;
export const MAX_PAGE_COUNT = 200;

function ensureDOMMatrix(): void {
  if (typeof globalThis.DOMMatrix !== "undefined") return;

  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    is2D = true; isIdentity = true;

    constructor(init?: string | number[]) {
      if (!init) return;
      if (typeof init === "string" && init.startsWith("matrix")) {
        const m = init.match(/matrix\(([^)]+)\)/);
        if (m) {
          const v = m[1].split(",").map(Number);
          this.a = v[0] ?? 1; this.b = v[1] ?? 0;
          this.c = v[2] ?? 0; this.d = v[3] ?? 1;
          this.e = v[4] ?? 0; this.f = v[5] ?? 0;
        }
      } else if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0]; this.b = init[1];
        this.c = init[2]; this.d = init[3];
        this.e = init[4]; this.f = init[5];
      }
    }

    multiply(other: DOMMatrix): DOMMatrix {
      const r = new DOMMatrix();
      r.a = this.a * other.a + this.b * other.c;
      r.b = this.a * other.b + this.b * other.d;
      r.c = this.c * other.a + this.d * other.c;
      r.d = this.c * other.b + this.d * other.d;
      r.e = this.e * other.a + this.f * other.c + other.e;
      r.f = this.e * other.b + this.f * other.d + other.f;
      return r;
    }

    translate(x: number, y: number): DOMMatrix {
      const r = new DOMMatrix();
      r.a = this.a; r.b = this.b;
      r.c = this.c; r.d = this.d;
      r.e = this.e + (x ?? 0);
      r.f = this.f + (y ?? 0);
      return r;
    }

    scale(x: number, y?: number): DOMMatrix {
      const sy = y ?? x;
      const r = new DOMMatrix();
      r.a = this.a * (x ?? 1); r.b = this.b * (x ?? 1);
      r.c = this.c * (sy ?? 1); r.d = this.d * (sy ?? 1);
      r.e = this.e; r.f = this.f;
      return r;
    }

    rotate(angle: number): DOMMatrix {
      const cos = Math.cos(angle ?? 0);
      const sin = Math.sin(angle ?? 0);
      const r = new DOMMatrix();
      r.a = this.a * cos + this.c * sin;
      r.b = this.b * cos + this.d * sin;
      r.c = this.a * -sin + this.c * cos;
      r.d = this.b * -sin + this.d * cos;
      r.e = this.e; r.f = this.f;
      return r;
    }

    inverse(): DOMMatrix {
      const det = this.a * this.d - this.b * this.c;
      if (det === 0) return new DOMMatrix();
      const r = new DOMMatrix();
      r.a = this.d / det; r.b = -this.b / det;
      r.c = -this.c / det; r.d = this.a / det;
      r.e = (this.c * this.f - this.d * this.e) / det;
      r.f = (this.b * this.e - this.a * this.f) / det;
      return r;
    }

    toString(): string {
      return `matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})`;
    }
  } as unknown as typeof globalThis.DOMMatrix;
}

let pdfjsInstance: typeof import("pdfjs-dist/legacy/build/pdf.mjs") | null = null;

async function getPdfJs(): Promise<typeof import("pdfjs-dist/legacy/build/pdf.mjs")> {
  if (!pdfjsInstance) {
    ensureDOMMatrix();
    pdfjsInstance = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const workerPath = _require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
    pdfjsInstance.GlobalWorkerOptions.workerSrc = workerPath;
  }
  return pdfjsInstance;
}

export const pdfExtractionService = {
  async extract(buffer: Buffer): Promise<ExtractionResult> {
    const start = performance.now();

    if (buffer.length === 0) {
      throw new ValidationError("Cannot extract text from an empty file");
    }

    const data = new Uint8Array(buffer);
    const pdfjs = await getPdfJs();

    try {
      const doc = await pdfjs.getDocument({ data, useWorkerFetch: false, disableStream: true }).promise;
      const pageCount = doc.numPages;

      if (pageCount === 0) {
        throw new ValidationError("PDF has no pages");
      }

      if (pageCount > MAX_PAGE_COUNT) {
        throw new ValidationError(
          `PDF has ${pageCount} pages, which exceeds the maximum of ${MAX_PAGE_COUNT}. Please upload a shorter document.`,
        );
      }

      const pages: { text: string; num: number }[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const items = content.items as Array<Record<string, unknown>>;
        const text = items
          .filter((item) => typeof item.str === "string")
          .map((item) => item.str as string)
          .join(" ")
          .replace(/\s+/g, " ");
        pages.push({ text, num: i });
        page.cleanup();
      }

      doc.destroy();

      if (pages.length === 0) {
        throw new ValidationError(
          "No extractable text found in this PDF. It may contain only images or scanned content.",
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
        pageCount,
        charCount: allText.length,
        durationMs: Math.round(duration),
      });

      return {
        text: allText,
        pageCount,
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
    }
  },
};
