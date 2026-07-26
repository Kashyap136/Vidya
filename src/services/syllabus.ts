import { syllabusRepository } from "@/repositories";
import { logger } from "@/lib/logger";
import { DuplicateError, NotFoundError, UnauthorizedError } from "./errors";
import type { AuditContext, PaginatedResult, PaginationParams } from "@/repositories/types";

type SyllabusRecord = Record<string, unknown>;

interface CreateSyllabusData {
  title: string;
  filePath?: string;
  userId: string;
  rawText?: string | null;
  pageCount?: number | null;
  processingStatus?: string;
}

interface RenameSyllabusData {
  title: string;
}

export const syllabusService = {
  async create(data: CreateSyllabusData, audit?: AuditContext): Promise<SyllabusRecord> {
    const existing = await syllabusRepository.findByUserIdAndTitle(data.userId, data.title.trim());

    if (existing) {
      throw new DuplicateError("syllabus", "title");
    }

    const syllabus = await syllabusRepository.create(
      {
        title: data.title.trim(),
        filePath: data.filePath ?? "manual",
        userId: data.userId,
        rawText: data.rawText ?? null,
        pageCount: data.pageCount ?? null,
        processingStatus: data.processingStatus ?? "UPLOADED",
      },
      audit,
    );

    logger.info("Syllabus created", { userId: data.userId, syllabusId: syllabus.id as string });
    return syllabus;
  },

  async getById(syllabusId: string, userId: string): Promise<SyllabusRecord> {
    const syllabus = await syllabusRepository.findById(syllabusId);

    if (!syllabus) {
      throw new NotFoundError("Syllabus", syllabusId);
    }

    if (syllabus.userId as string !== userId) {
      throw new UnauthorizedError();
    }

    return syllabus;
  },

  async getByUserId(
    userId: string,
    params: PaginationParams & { includeArchived?: boolean; sort?: string },
  ): Promise<PaginatedResult<SyllabusRecord>> {
    const orderBy = params.sort === "oldest"
      ? { field: "createdAt" as const, order: "asc" as const }
      : params.sort === "alphabetical"
        ? { field: "title" as const, order: "asc" as const }
        : { field: "createdAt" as const, order: "desc" as const };

    const options = {
      includeDeleted: params.includeArchived,
      orderBy,
    };

    return syllabusRepository.findByUserId(userId, params, options);
  },

  async rename(
    syllabusId: string,
    userId: string,
    data: RenameSyllabusData,
    audit?: AuditContext,
  ): Promise<SyllabusRecord> {
    const syllabus = await syllabusRepository.findById(syllabusId);

    if (!syllabus) {
      throw new NotFoundError("Syllabus", syllabusId);
    }

    if (syllabus.userId as string !== userId) {
      throw new UnauthorizedError();
    }

    const duplicate = await syllabusRepository.findByUserIdAndTitle(userId, data.title.trim());

    if (duplicate && (duplicate.id as string) !== syllabusId) {
      throw new DuplicateError("syllabus", "title");
    }

    const updated = await syllabusRepository.update(
      syllabusId,
      { title: data.title.trim() } as Record<string, unknown>,
      audit,
    );

    logger.info("Syllabus renamed", { syllabusId, userId });
    return updated;
  },

  async archive(syllabusId: string, userId: string, audit?: AuditContext): Promise<SyllabusRecord> {
    const syllabus = await syllabusRepository.findById(syllabusId);

    if (!syllabus) {
      throw new NotFoundError("Syllabus", syllabusId);
    }

    if (syllabus.userId as string !== userId) {
      throw new UnauthorizedError();
    }

    const archived = await syllabusRepository.softDelete(syllabusId, audit);
    logger.info("Syllabus archived", { syllabusId, userId });
    return archived;
  },

  async restore(syllabusId: string, userId: string, audit?: AuditContext): Promise<SyllabusRecord> {
    const syllabus = await syllabusRepository.findById(syllabusId, { includeDeleted: true });

    if (!syllabus) {
      throw new NotFoundError("Syllabus", syllabusId);
    }

    if (syllabus.userId as string !== userId) {
      throw new UnauthorizedError();
    }

    const restored = await syllabusRepository.restore(syllabusId, audit);
    logger.info("Syllabus restored", { syllabusId, userId });
    return restored;
  },

  async delete(syllabusId: string, userId: string): Promise<void> {
    const syllabus = await syllabusRepository.findById(syllabusId);

    if (!syllabus) {
      throw new NotFoundError("Syllabus", syllabusId);
    }

    if (syllabus.userId as string !== userId) {
      throw new UnauthorizedError();
    }

    await syllabusRepository.hardDelete(syllabusId);
    logger.info("Syllabus deleted", { syllabusId, userId });
  },

  async getUserStats(userId: string): Promise<{ total: number; active: number; archived: number }> {
    const active = await syllabusRepository.count({ userId });
    const total = await syllabusRepository.count({ userId }, { includeDeleted: true });
    const archived = total - active;

    return { total, active, archived };
  },

  async getRecent(userId: string, limit: number = 5): Promise<SyllabusRecord[]> {
    return syllabusRepository.findMany(
      { userId } as Record<string, unknown>,
      {
        orderBy: { field: "createdAt" as const, order: "desc" as const },
        limit,
      },
    );
  },

  async updateFileMetadata(
    syllabusId: string,
    userId: string,
    metadata: {
      filePath: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    },
    audit?: AuditContext,
  ): Promise<SyllabusRecord> {
    const syllabus = await syllabusRepository.findById(syllabusId);

    if (!syllabus) {
      throw new NotFoundError("Syllabus", syllabusId);
    }

    if (syllabus.userId as string !== userId) {
      throw new UnauthorizedError();
    }

    const updated = await syllabusRepository.update(
      syllabusId,
      {
        filePath: metadata.filePath,
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        uploadedAt: new Date(),
      } as Record<string, unknown>,
      audit,
    );

    logger.info("Syllabus file metadata updated", { syllabusId, userId });
    return updated;
  },

  async clearFileMetadata(
    syllabusId: string,
    userId: string,
    audit?: AuditContext,
  ): Promise<SyllabusRecord> {
    const syllabus = await syllabusRepository.findById(syllabusId);

    if (!syllabus) {
      throw new NotFoundError("Syllabus", syllabusId);
    }

    if (syllabus.userId as string !== userId) {
      throw new UnauthorizedError();
    }

    const updated = await syllabusRepository.update(
      syllabusId,
      {
        filePath: "manual",
        fileName: null,
        fileSize: null,
        mimeType: null,
        uploadedAt: null,
      } as Record<string, unknown>,
      audit,
    );

    logger.info("Syllabus file metadata cleared", { syllabusId, userId });
    return updated;
  },
};
