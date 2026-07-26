import { prisma } from "@/config/prisma";
import type { AuditContext, PaginatedResult, PaginationParams, QueryOptions } from "./types";
import { BaseRepository } from "./base";

type QuizAttemptRecord = Record<string, unknown>;

interface CreateQuizAttemptInput extends Record<string, unknown> {
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers?: unknown;
  timeTaken?: number | null;
  completedAt?: Date | null;
}

interface UpdateQuizAttemptInput extends Record<string, unknown> {
  score?: number;
  totalQuestions?: number;
  answers?: unknown;
  timeTaken?: number | null;
  completedAt?: Date | null;
}

export class QuizAttemptRepository extends BaseRepository<QuizAttemptRecord, CreateQuizAttemptInput, UpdateQuizAttemptInput> {
  protected supportsSoftDelete = true;
  protected entityName = "QuizAttempt";

  constructor() {
    super(prisma.quizAttempt as unknown as import("./base").Delegate);
  }

  async findByUserId(
    userId: string,
    params: PaginationParams,
    options?: QueryOptions,
  ): Promise<PaginatedResult<QuizAttemptRecord>> {
    return this.paginate(
      params,
      { userId } as Record<string, unknown>,
      { ...options, orderBy: { field: "createdAt", order: "desc" as const } },
    );
  }

  async findByQuizId(quizId: string, options?: QueryOptions): Promise<QuizAttemptRecord[]> {
    return this.findMany(
      { quizId } as Record<string, unknown>,
      { ...options, orderBy: { field: "createdAt", order: "desc" as const } },
    );
  }

  async getScoreStats(userId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    averagePercentage: number;
    highestScore: number;
    lowestScore: number;
  }> {
    const attempts = await this.findMany({ userId } as Record<string, unknown>) as Array<Record<string, unknown>>;

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        averagePercentage: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const scores = attempts.map((a) => a.score as number);
    const totals = attempts.map((a) => a.totalQuestions as number);
    const percentages = scores.map((s, i) => (totals[i] > 0 ? (s / totals[i]) * 100 : 0));

    return {
      totalAttempts: attempts.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      averagePercentage: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
    };
  }
}

export const quizAttemptRepository = new QuizAttemptRepository();

export async function findQuizAttemptsByUserId(
  userId: string,
  params: PaginationParams,
): Promise<PaginatedResult<QuizAttemptRecord>> {
  return quizAttemptRepository.findByUserId(userId, params);
}

export async function findQuizAttemptsByQuiz(quizId: string): Promise<QuizAttemptRecord[]> {
  return quizAttemptRepository.findByQuizId(quizId);
}

export async function createQuizAttempt(
  data: CreateQuizAttemptInput,
  audit?: AuditContext,
): Promise<QuizAttemptRecord> {
  return quizAttemptRepository.create(data, audit);
}

export async function getQuizScoreStats(userId: string): Promise<{
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
}> {
  return quizAttemptRepository.getScoreStats(userId);
}
