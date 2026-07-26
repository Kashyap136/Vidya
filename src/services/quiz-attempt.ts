import { prisma } from "@/config/prisma";
import { quizAttemptRepository } from "@/repositories";
import { logger } from "@/lib/logger";
import { UnauthorizedError, ValidationError, NotFoundError } from "./errors";
import type { AuditContext, PaginatedResult, PaginationParams } from "@/repositories/types";

type QuizAttemptRecord = Record<string, unknown>;

interface ScoredAnswer {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

interface RawAnswer {
  questionId: string;
  selectedOptionIndex: number;
}

interface RecordAttemptData {
  userId: string;
  quizId: string;
  totalQuestions: number;
  answers: RawAnswer[];
  timeTaken?: number | null;
}

export const quizAttemptService = {
  async record(data: RecordAttemptData, audit?: AuditContext): Promise<QuizAttemptRecord> {
    if (audit?.userId && data.userId !== audit.userId) {
      throw new UnauthorizedError();
    }

    if (data.totalQuestions <= 0) {
      throw new ValidationError("Total questions must be greater than zero");
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId: data.quizId, deletedAt: null },
      orderBy: { order: "asc" },
      select: { id: true, options: true },
    });

    if (questions.length === 0) {
      throw new NotFoundError("QuizQuestions", data.quizId);
    }

    const scoredAnswers: ScoredAnswer[] = questions.map((q) => {
      if (!q.options) {
        throw new ValidationError(`Question ${q.id} has no options configured`);
      }
      const parsedOptions = typeof q.options === "string" ? JSON.parse(q.options as string) : q.options;
      const options = Array.isArray(parsedOptions) ? parsedOptions : [];
      const correctIndex = options.findIndex((o: Record<string, unknown>) => o.isCorrect);
      if (correctIndex === -1) {
        throw new ValidationError(`Question ${q.id} has no correct answer configured`);
      }
      const submitted = data.answers?.find((a) => a.questionId === q.id);
      const selectedOptionIndex = submitted?.selectedOptionIndex ?? -1;
      return {
        questionId: q.id,
        selectedOptionIndex,
        isCorrect: selectedOptionIndex === correctIndex,
      };
    });

    const score = scoredAnswers.filter((a) => a.isCorrect).length;

    if (score > questions.length) {
      throw new ValidationError("Score cannot exceed total questions");
    }

    if (score < 0) {
      throw new ValidationError("Score cannot be negative");
    }

    const attempt = await quizAttemptRepository.create(
      {
        userId: data.userId,
        quizId: data.quizId,
        score,
        totalQuestions: questions.length,
        answers: scoredAnswers,
        timeTaken: data.timeTaken ?? null,
        completedAt: new Date(),
      },
      audit,
    );

    logger.info("Quiz attempt recorded", {
      userId: data.userId,
      quizId: data.quizId,
      score,
      totalQuestions: questions.length,
    });

    return attempt;
  },

  async getByUser(
    userId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<QuizAttemptRecord>> {
    return quizAttemptRepository.findByUserId(userId, params);
  },

  async getByQuiz(quizId: string): Promise<QuizAttemptRecord[]> {
    return quizAttemptRepository.findByQuizId(quizId);
  },

  async getStats(
    userId: string,
  ): Promise<{
    totalAttempts: number;
    averageScore: number;
    averagePercentage: number;
    highestScore: number;
    lowestScore: number;
  }> {
    return quizAttemptRepository.getScoreStats(userId);
  },
};