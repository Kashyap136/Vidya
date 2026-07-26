import { topicRepository, syllabusRepository } from "@/repositories";
import { logger } from "@/lib/logger";
import { NotFoundError, UnauthorizedError } from "./errors";
import type { AuditContext } from "@/repositories/types";

type TopicRecord = Record<string, unknown>;

interface CreateTopicData {
  title: string;
  summary?: string | null;
  priority: string;
  difficulty: string;
  estimatedMinutes: number;
  syllabusId: string;
}

interface UpdateTopicData {
  title?: string;
  summary?: string | null;
  priority?: string;
  difficulty?: string;
  estimatedMinutes?: number;
}

async function verifySyllabusOwnership(syllabusId: string, userId: string): Promise<void> {
  const syllabus = await syllabusRepository.findById(syllabusId);

  if (!syllabus) {
    throw new NotFoundError("Syllabus", syllabusId);
  }

  if (syllabus.userId as string !== userId) {
    throw new UnauthorizedError();
  }
}

export const topicService = {
  async create(data: CreateTopicData, userId: string, audit?: AuditContext): Promise<TopicRecord> {
    await verifySyllabusOwnership(data.syllabusId, userId);

    const existing = await topicRepository.findBySyllabusId(data.syllabusId);
    const nextOrder = existing.length;

    const topic = await topicRepository.create(
      {
        title: data.title.trim(),
        summary: data.summary ?? null,
        priority: data.priority,
        difficulty: data.difficulty,
        order: nextOrder,
        estimatedMinutes: data.estimatedMinutes,
        syllabusId: data.syllabusId,
      },
      audit,
    );

    logger.info("Topic created", { syllabusId: data.syllabusId, topicId: topic.id as string });
    return topic;
  },

  async update(
    topicId: string,
    data: UpdateTopicData,
    userId: string,
    audit?: AuditContext,
  ): Promise<TopicRecord> {
    const topic = await topicRepository.findById(topicId);

    if (!topic) {
      throw new NotFoundError("Topic", topicId);
    }

    await verifySyllabusOwnership(topic.syllabusId as string, userId);

    const updated = await topicRepository.update(
      topicId,
      data as Record<string, unknown>,
      audit,
    );

    logger.info("Topic updated", { topicId });
    return updated;
  },

  async getBySyllabus(syllabusId: string, userId: string): Promise<TopicRecord[]> {
    await verifySyllabusOwnership(syllabusId, userId);
    return topicRepository.findBySyllabusId(syllabusId);
  },

  async reorder(
    syllabusId: string,
    topicIds: string[],
    userId: string,
    audit?: AuditContext,
  ): Promise<void> {
    await verifySyllabusOwnership(syllabusId, userId);
    await topicRepository.reorder(topicIds, audit);
    logger.info("Topics reordered", { syllabusId });
  },

  async toggleCompletion(
    topicId: string,
    userId: string,
    audit?: AuditContext,
  ): Promise<TopicRecord> {
    const topic = await topicRepository.findById(topicId);

    if (!topic) {
      throw new NotFoundError("Topic", topicId);
    }

    await verifySyllabusOwnership(topic.syllabusId as string, userId);

    const isComplete = topic.completedAt != null;
    const updated = await topicRepository.update(
      topicId,
      { completedAt: isComplete ? null : new Date() } as Record<string, unknown>,
      audit,
    );

    logger.info("Topic completion toggled", {
      topicId,
      completed: !isComplete,
    });
    return updated;
  },

  async getProgressStats(
    syllabusId: string,
    userId: string,
  ): Promise<{
    total: number;
    completed: number;
    remaining: number;
    totalHours: number;
    completedHours: number;
  }> {
    await verifySyllabusOwnership(syllabusId, userId);
    const topics = await topicRepository.findBySyllabusId(syllabusId);

    const total = topics.length;
    const completed = topics.filter((t) => t.completedAt != null).length;
    const remaining = total - completed;
    const totalHours = topics.reduce(
      (sum, t) => sum + Math.ceil(((t.estimatedMinutes as number) || 0) / 60),
      0,
    );
    const completedHours = topics
      .filter((t) => t.completedAt != null)
      .reduce((sum, t) => sum + Math.ceil(((t.estimatedMinutes as number) || 0) / 60), 0);

    return { total, completed, remaining, totalHours, completedHours };
  },

  async softDelete(topicId: string, userId: string, audit?: AuditContext): Promise<TopicRecord> {
    const topic = await topicRepository.findById(topicId);

    if (!topic) {
      throw new NotFoundError("Topic", topicId);
    }

    await verifySyllabusOwnership(topic.syllabusId as string, userId);

    const deleted = await topicRepository.softDelete(topicId, audit);
    logger.info("Topic soft deleted", { topicId });
    return deleted;
  },
};
