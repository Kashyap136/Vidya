import { z } from "zod/v4";
import { logger } from "@/lib/logger";
import type { AiResponse } from "@/types/ai";

const topicSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedHours: z.number().int().min(1).max(80),
  prerequisites: z.array(z.string().max(200)).optional(),
});

const aiResponseSchema = z.object({
  syllabusTitle: z.string().min(1).max(200).trim(),
  courseCode: z.string().max(20).nullable().optional(),
  university: z.string().max(200).nullable().optional(),
  totalUnits: z.number().int().positive().nullable().optional(),
  topics: z.array(topicSchema).min(1).max(50),
});

function checkDuplicateTopics(topics: { title: string }[]): string[] {
  const titles = topics.map((t) => t.title.toLowerCase().trim());
  const duplicates = titles.filter((t, i) => titles.indexOf(t) !== i);
  return [...new Set(duplicates)];
}

export const aiResponseValidator = {
  validate(raw: unknown): AiResponse {
    const result = aiResponseSchema.safeParse(raw);

    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      logger.warn("AI response validation failed", { issues });
      throw new Error(`AI response validation failed: ${issues.join("; ")}`);
    }

    const data = result.data;

    // Check for duplicate topics
    const duplicates = checkDuplicateTopics(data.topics);
    if (duplicates.length > 0) {
      logger.warn("Duplicate topics found in AI response", { duplicates });
      throw new Error(
        `AI response contains duplicate topic titles: ${duplicates.join(", ")}`,
      );
    }

    // Sanitize: clamp estimatedHours to valid range
    const sanitizedTopics = data.topics.map((topic) => ({
      ...topic,
      estimatedHours: Math.min(Math.max(topic.estimatedHours, 1), 80),
      description: topic.description ?? null,
      prerequisites: topic.prerequisites ?? [],
    }));

    logger.info("AI response validation passed", {
      topicCount: sanitizedTopics.length,
      syllabusTitle: data.syllabusTitle,
    });

    return {
      syllabusTitle: data.syllabusTitle,
      courseCode: data.courseCode ?? null,
      university: data.university ?? null,
      totalUnits: data.totalUnits ?? null,
      topics: sanitizedTopics.map((t) => ({
        title: t.title,
        description: t.description,
        priority: t.priority,
        difficulty: t.difficulty,
        estimatedHours: t.estimatedHours,
        prerequisites: t.prerequisites,
      })),
    };
  },
};
