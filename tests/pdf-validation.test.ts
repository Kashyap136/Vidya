import { describe, it, expect, vi } from "vitest";
import { pdfValidationService } from "@/services/pdf-validation";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

function createMockFile(name: string, type: string, size: number, header?: string): File {
  const encoder = new TextEncoder();
  const content = header ?? "%PDF-1.4\n...content...";
  const padding = Math.max(0, size - content.length);
  const fullContent = content + "x".repeat(padding);
  const blob = new Blob([encoder.encode(fullContent)], { type });
  return new File([blob], name, { type });
}

describe("pdfValidationService", () => {
  describe("validateMimeType", () => {
    it("accepts application/pdf", () => {
      const file = createMockFile("test.pdf", "application/pdf", 100);
      expect(() => pdfValidationService.validateMimeType(file)).not.toThrow();
    });

    it("rejects non-PDF mime type", () => {
      const file = createMockFile("test.pdf", "image/png", 100);
      expect(() => pdfValidationService.validateMimeType(file)).toThrow("Invalid file type");
    });
  });

  describe("validateExtension", () => {
    it("accepts .pdf extension", () => {
      const file = createMockFile("test.pdf", "application/pdf", 100);
      expect(() => pdfValidationService.validateExtension(file)).not.toThrow();
    });

    it("rejects non-.pdf extension", () => {
      const file = createMockFile("test.png", "application/pdf", 100);
      expect(() => pdfValidationService.validateExtension(file)).toThrow("Invalid file extension");
    });

    it("rejects no extension", () => {
      const file = createMockFile("test", "application/pdf", 100);
      expect(() => pdfValidationService.validateExtension(file)).toThrow("Invalid file extension");
    });
  });

  describe("validateFileSize", () => {
    it("accepts file under limit", () => {
      const file = createMockFile("test.pdf", "application/pdf", 1024);
      expect(() => pdfValidationService.validateFileSize(file)).not.toThrow();
    });

    it("rejects empty file", () => {
      const file = new File([], "test.pdf", { type: "application/pdf" });
      expect(() => pdfValidationService.validateFileSize(file)).toThrow("File is empty");
    });

    it("rejects oversized file", () => {
      const file = createMockFile("test.pdf", "application/pdf", 30 * 1024 * 1024);
      expect(() => pdfValidationService.validateFileSize(file)).toThrow("exceeds");
    });

    it("respects custom maxBytes", () => {
      const file = createMockFile("test.pdf", "application/pdf", 5000);
      expect(() => pdfValidationService.validateFileSize(file, 1000)).toThrow("exceeds");
    });
  });

  describe("validateMagicBytes", () => {
    it("accepts file with %PDF header", async () => {
      const file = createMockFile("test.pdf", "application/pdf", 100, "%PDF-1.4\ncontent");
      await expect(pdfValidationService.validateMagicBytes(file)).resolves.not.toThrow();
    });

    it("rejects file without %PDF header", async () => {
      const file = createMockFile("test.pdf", "application/pdf", 100, "GIF89a");
      await expect(pdfValidationService.validateMagicBytes(file)).rejects.toThrow("missing %PDF header");
    });
  });

  describe("validateFile (integration)", () => {
    it("returns valid for a correct PDF file", async () => {
      const file = createMockFile("test.pdf", "application/pdf", 5000, "%PDF-1.4\ncontent");
      const result = await pdfValidationService.validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns invalid for wrong mime type", async () => {
      const file = createMockFile("test.pdf", "image/png", 5000, "%PDF-1.4\ncontent");
      const result = await pdfValidationService.validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("returns invalid for empty file", async () => {
      const file = createMockFile("test.pdf", "application/pdf", 0, "");
      const result = await pdfValidationService.validateFile(file);
      expect(result.valid).toBe(false);
    });

    it("returns invalid for missing PDF header", async () => {
      const file = createMockFile("test.pdf", "application/pdf", 5000, "GIF89a");
      const result = await pdfValidationService.validateFile(file);
      expect(result.valid).toBe(false);
    });

    it("returns invalid for multiple validation failures", async () => {
      const file = createMockFile("test.exe", "application/x-msdownload", 30 * 1024 * 1024, "MZ\x90\x00");
      const result = await pdfValidationService.validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
