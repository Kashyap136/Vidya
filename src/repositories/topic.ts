import { prisma } from "@/config/prisma";
import type { AuditContext, QueryOptions } from "./types";
import { BaseRepository } from "./base";
import { transaction } from "./transaction";

type TopicRecord = Record<string, unknown>;

interface CreateTopicInput extends Record<string, unknown> {
  title: string;
  summary?: string | null;
  priority: string;
  difficulty: string;
  order: number;
  estimatedMinutes: number;
  syllabusId: string;
}

interface UpdateTopicInput extends Record<string, unknown> {
  title?: string;
  summary?: string | null;
  priority?: string;
  difficulty?: string;
  order?: number;
  estimatedMinutes?: number;
}

export class TopicRepository extends BaseRepository<TopicRecord, CreateTopicInput, UpdateTopicInput> {
  protected supportsSoftDelete = true;
  protected entityName = "Topic";

  constructor() {
    super(prisma.topic as unknown as import("./base").Delegate);
  }

  async findBySyllabusId(syllabusId: string, options?: QueryOptions): Promise<TopicRecord[]> {
    return this.findMany(
      { syllabusId } as Record<string, unknown>,
      { ...options, orderBy: { field: "order", order: "asc" as const } },
    );
  }

  async findByPriority(priority: string, options?: QueryOptions): Promise<TopicRecord[]> {
    return this.findMany(
      { priority } as Record<string, unknown>,
      { ...options, orderBy: { field: "order", order: "asc" as const } },
    );
  }

  async reorder(
    topicIds: string[],
    audit?: AuditContext,
  ): Promise<void> {
    await transaction(async (tx) => {
      const updates = topicIds.map((id, index) =>
        tx.topic.update({
          where: { id },
          data: {
            order: index,
            updatedBy: audit?.userId ?? null,
          },
        }),
      );
      await Promise.all(updates);
    });
  }
}

export const topicRepository = new TopicRepository();

export async function findTopicsBySyllabus(syllabusId: string): Promise<TopicRecord[]> {
  return topicRepository.findBySyllabusId(syllabusId);
}

export async function findTopicsByPriority(priority: string): Promise<TopicRecord[]> {
  return topicRepository.findByPriority(priority);
}

export async function createTopic(
  data: CreateTopicInput,
  audit?: AuditContext,
): Promise<TopicRecord> {
  return topicRepository.create(data, audit);
}

export async function updateTopic(
  id: string,
  data: UpdateTopicInput,
  audit?: AuditContext,
): Promise<TopicRecord> {
  return topicRepository.update(id, data, audit);
}

export async function softDeleteTopic(id: string, audit?: AuditContext): Promise<TopicRecord> {
  return topicRepository.softDelete(id, audit);
}

export async function reorderTopics(
  syllabusId: string,
  topicIds: string[],
  audit?: AuditContext,
): Promise<void> {
  return topicRepository.reorder(topicIds, audit);
}
