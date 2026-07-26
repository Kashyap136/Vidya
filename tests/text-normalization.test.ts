import { describe, it, expect } from "vitest";
import { textNormalizationService } from "@/services/text-normalization";

describe("textNormalizationService", () => {
  describe("normalize", () => {
    it("preserves basic text", () => {
      const result = textNormalizationService.normalize("Hello World");
      expect(result.text).toBe("Hello World");
      expect(result.charCount).toBe(11);
      expect(result.lineCount).toBe(1);
    });

    it("normalizes unicode (NFKC)", () => {
      const result = textNormalizationService.normalize("\uFF2E\uFF29\uFF38"); // fullwidth NIX
      expect(result.text).toBe("NIX");
    });

    it("normalizes line endings to LF", () => {
      const result = textNormalizationService.normalize("line1\r\nline2\rline3");
      expect(result.text).toBe("line1\nline2\nline3");
    });

    it("removes zero-width characters", () => {
      const result = textNormalizationService.normalize("ab\u200Bc"); // zero-width space
      expect(result.text).toBe("abc");
    });

    it("replaces smart quotes with straight quotes", () => {
      const result = textNormalizationService.normalize("\u201Chello\u201D");
      expect(result.text).toBe('"hello"');
    });

    it("replaces em dash with hyphen", () => {
      const result = textNormalizationService.normalize("foo\u2014bar");
      expect(result.text).toBe("foo-bar");
    });

    it("collapses multiple blank lines", () => {
      const result = textNormalizationService.normalize("a\n\n\n\n\nb");
      expect(result.text).toBe("a\n\nb");
    });

    it("trims trailing whitespace from lines", () => {
      const result = textNormalizationService.normalize("line1   \nline2  ");
      expect(result.text).toBe("line1\nline2");
    });

    it("trims leading and trailing whitespace", () => {
      const result = textNormalizationService.normalize("  hello world  ");
      expect(result.text).toBe("hello world");
    });

    it("removes control characters except newline and tab", () => {
      const result = textNormalizationService.normalize("ab\x00cd\x1Fef\ngh\tij");
      expect(result.text).toBe("abcdef\ngh ij");
    });

    it("replaces en dash with hyphen", () => {
      const result = textNormalizationService.normalize("pages 1\u201310");
      expect(result.text).toBe("pages 1-10");
    });

    it("counts lines correctly", () => {
      const result = textNormalizationService.normalize("a\nb\nc\nd");
      expect(result.lineCount).toBe(4);
    });

    it("handles empty string", () => {
      const result = textNormalizationService.normalize("");
      expect(result.text).toBe("");
      expect(result.charCount).toBe(0);
      expect(result.lineCount).toBe(0);
    });
  });
});
