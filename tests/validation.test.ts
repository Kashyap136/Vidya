import { describe, it, expect } from "vitest";
import { z } from "zod/v4";

const topicSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedMinutes: z.number().int().min(5).max(480),
  order: z.number().int().min(0).max(100),
});

const extractResponseSchema = z.object({
  title: z.string().min(1).max(200),
  topics: z.array(topicSchema).min(1).max(100),
});

describe("AI Response Validation", () => {
  it("validates a correct extract response", () => {
    const result = extractResponseSchema.safeParse({
      title: "Computer Science 101",
      topics: [
        {
          title: "Binary Trees",
          summary: "Tree data structures",
          priority: "HIGH",
          difficulty: "INTERMEDIATE",
          estimatedMinutes: 45,
          order: 1,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty topics array", () => {
    const result = extractResponseSchema.safeParse({
      title: "Test",
      topics: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority value", () => {
    const result = topicSchema.safeParse({
      title: "Test",
      priority: "URGENT",
      difficulty: "BEGINNER",
      estimatedMinutes: 30,
      order: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative estimated minutes", () => {
    const result = topicSchema.safeParse({
      title: "Test",
      priority: "MEDIUM",
      difficulty: "BEGINNER",
      estimatedMinutes: -5,
      order: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 200 characters", () => {
    const result = topicSchema.safeParse({
      title: "x".repeat(201),
      priority: "LOW",
      difficulty: "BEGINNER",
      estimatedMinutes: 30,
      order: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many topics", () => {
    const topics = Array.from({ length: 101 }, (_, i) => ({
      title: `Topic ${i}`,
      priority: "MEDIUM" as const,
      difficulty: "BEGINNER" as const,
      estimatedMinutes: 30,
      order: i,
    }));
    const result = extractResponseSchema.safeParse({
      title: "Overflow",
      topics,
    });
    expect(result.success).toBe(false);
  });

  it("accepts maximum allowed topics", () => {
    const topics = Array.from({ length: 100 }, (_, i) => ({
      title: `Topic ${i}`,
      priority: "MEDIUM" as const,
      difficulty: "BEGINNER" as const,
      estimatedMinutes: 30,
      order: i,
    }));
    const result = extractResponseSchema.safeParse({
      title: "Max Topics",
      topics,
    });
    expect(result.success).toBe(true);
  });
});

describe("Input Validation", () => {
  const passwordSchema = z.string().min(8).max(128);
  const emailSchema = z.string().email();

  it("validates a strong password", () => {
    expect(passwordSchema.safeParse("SecurePass123!").success).toBe(true);
  });

  it("rejects short password", () => {
    expect(passwordSchema.safeParse("Ab1").success).toBe(false);
  });

  it("validates correct email", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});
