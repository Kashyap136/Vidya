import { describe, it, expect } from "vitest";
import { aiResponseValidator } from "@/services/ai-response-validator";

const validResponse = {
  syllabusTitle: "CS301 Data Structures",
  courseCode: "CS301",
  university: "MIT",
  totalUnits: 4,
  topics: [
    { title: "Arrays", description: "Array data structure", priority: "HIGH", difficulty: "BEGINNER", estimatedHours: 3, prerequisites: [] },
    { title: "Linked Lists", description: "Linked list data structure", priority: "MEDIUM", difficulty: "INTERMEDIATE", estimatedHours: 2, prerequisites: ["Arrays"] },
  ],
};

describe("aiResponseValidator", () => {
  describe("validate", () => {
    it("validates a correct AI response", () => {
      const result = aiResponseValidator.validate(validResponse);
      expect(result.syllabusTitle).toBe("CS301 Data Structures");
      expect(result.topics).toHaveLength(2);
      expect(result.topics[0].title).toBe("Arrays");
      expect(result.topics[0].priority).toBe("HIGH");
      expect(result.topics[0].difficulty).toBe("BEGINNER");
    });

    it("rejects response with missing syllabusTitle", () => {
      const invalid = { ...validResponse, syllabusTitle: undefined };
      expect(() => aiResponseValidator.validate(invalid)).toThrow();
    });

    it("rejects response with empty topics", () => {
      const invalid = { ...validResponse, topics: [] };
      expect(() => aiResponseValidator.validate(invalid)).toThrow();
    });

    it("rejects malformed response (non-object)", () => {
      expect(() => aiResponseValidator.validate("not an object")).toThrow();
    });

    it("rejects null response", () => {
      expect(() => aiResponseValidator.validate(null)).toThrow();
    });

    it("rejects response with missing topic fields", () => {
      const invalid = { ...validResponse, topics: [{ title: "Orphan" }] };
      expect(() => aiResponseValidator.validate(invalid)).toThrow();
    });

    it("detects duplicate topic titles", () => {
      const dup = {
        ...validResponse,
        topics: [
          { title: "Arrays", description: "First", priority: "HIGH", difficulty: "BEGINNER", estimatedHours: 3, prerequisites: [] },
          { title: "Arrays", description: "Second", priority: "MEDIUM", difficulty: "INTERMEDIATE", estimatedHours: 2, prerequisites: [] },
        ],
      };
      expect(() => aiResponseValidator.validate(dup)).toThrow(/duplicate|already exists/i);
    });

    it("rejects estimatedHours exceeding max", () => {
      const over = {
        ...validResponse,
        topics: [
          { title: "Arrays", description: "Array data structure", priority: "HIGH", difficulty: "BEGINNER", estimatedHours: 200, prerequisites: [] },
        ],
      };
      expect(() => aiResponseValidator.validate(over)).toThrow("Too big");
    });

    it("rejects invalid priority value", () => {
      const invalid = {
        ...validResponse,
        topics: [
          { title: "Arrays", description: "Array data structure", priority: "URGENT", difficulty: "BEGINNER", estimatedHours: 3, prerequisites: [] },
        ],
      };
      expect(() => aiResponseValidator.validate(invalid)).toThrow();
    });

    it("rejects invalid difficulty value", () => {
      const invalid = {
        ...validResponse,
        topics: [
          { title: "Arrays", description: "Array data structure", priority: "HIGH", difficulty: "EXPERT", estimatedHours: 3, prerequisites: [] },
        ],
      };
      expect(() => aiResponseValidator.validate(invalid)).toThrow();
    });

    it("accepts response with minimum valid fields", () => {
      const min = {
        syllabusTitle: "Math 101",
        courseCode: "MATH101",
        university: "U",
        totalUnits: 3,
        topics: [
          { title: "Algebra", description: "Basic algebra", priority: "HIGH", difficulty: "BEGINNER", estimatedHours: 1, prerequisites: [] },
        ],
      };
      const result = aiResponseValidator.validate(min);
      expect(result.topics).toHaveLength(1);
    });
  });
});
