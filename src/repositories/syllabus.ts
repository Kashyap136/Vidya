import { prisma } from "@/config/prisma";
import type { AuditContext, PaginatedResult, PaginationParams, QueryOptions } from "./types";
import { BaseRepository } from "./base";

type SyllabusRecord = Record<string, unknown>;

interface CreateSyllabusInput extends Record<string, unknown> {
  title: string;
  rawText?: string | null;
  processingStatus?: string;
  filePath: string;
  pageCount?: number | null;
  userId: string;
}

interface UpdateSyllabusInput extends Record<string, unknown> {
  title?: string;
  rawText?: string | null;
  processingStatus?: string;
  errorMessage?: string | null;
  failedStep?: string | null;
  filePath?: string;
  pageCount?: number | null;
}

export class SyllabusRepository extends BaseRepository<SyllabusRecord, CreateSyllabusInput, UpdateSyllabusInput> {
  protected supportsSoftDelete = true;
  protected entityName = "Syllabus";

  constructor() {
    super(prisma.syllabus as unknown as import("./base").Delegate);
  }

  async findByUserId(
    userId: string,
    params: PaginationParams,
    options?: QueryOptions,
  ): Promise<PaginatedResult<SyllabusRecord>> {
    return this.paginate(params, { userId } as Record<string, unknown>, options);
  }

  async findWithTopics(
    id: string,
    options?: QueryOptions,
  ): Promise<SyllabusRecord | null> {
    return this.findById(id, {
      ...options,
      include: { topics: { orderBy: { order: "asc" as const } } },
    });
  }

  async findByUserIdAndTitle(userId: string, title: string): Promise<SyllabusRecord | null> {
    return this.findFirst({ userId, title } as Record<string, unknown>);
  }
}

export const syllabusRepository = new SyllabusRepository();

export async function findSyllabiByUserId(
  userId: string,
  params: PaginationParams,
): Promise<PaginatedResult<SyllabusRecord>> {
  return syllabusRepository.findByUserId(userId, params);
}

export async function findSyllabusWithTopics(id: string): Promise<SyllabusRecord | null> {
  return syllabusRepository.findWithTopics(id);
}

export async function createSyllabus(
  data: CreateSyllabusInput,
  audit?: AuditContext,
): Promise<SyllabusRecord> {
  return syllabusRepository.create(data, audit);
}

export async function updateSyllabus(
  id: string,
  data: UpdateSyllabusInput,
  audit?: AuditContext,
): Promise<SyllabusRecord> {
  return syllabusRepository.update(id, data, audit);
}

export async function softDeleteSyllabus(id: string, audit?: AuditContext): Promise<SyllabusRecord> {
  return syllabusRepository.softDelete(id, audit);
}
