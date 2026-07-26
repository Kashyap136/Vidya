import type { NormalizedText } from "@/types/ai";

export const textNormalizationService = {
  normalize(rawText: string): NormalizedText {
    let text = rawText;

    // Normalize Unicode (NFKC)
    text = text.normalize("NFKC");

    // Normalize line endings
    text = text.replace(/\r\n/g, "\n");
    text = text.replace(/\r/g, "\n");

    // Remove control characters except newlines and tabs
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Remove zero-width characters
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");

    // Replace smart quotes with straight quotes
    text = text.replace(/[\u2018\u2019]/g, "'");
    text = text.replace(/[\u201C\u201D]/g, '"');

    // Replace em dashes and en dashes
    text = text.replace(/[\u2013\u2014]/g, "-");

    // Collapse multiple blank lines to at most one
    text = text.replace(/\n{3,}/g, "\n\n");

    // Collapse multiple spaces (but not newlines)
    text = text.replace(/[^\S\n]+/g, " ");

    // Remove leading/trailing whitespace on each line
    text = text.split("\n").map((line) => line.trim()).join("\n");

    // Remove empty lines at start and end
    text = text.trim();

    const charCount = text.length;
    const lineCount = text.split("\n").filter((l) => l.length > 0).length;

    return { text, charCount, lineCount };
  },
};
