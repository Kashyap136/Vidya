import { Prisma } from "@prisma/client";
import { topicRepository, quizAttemptRepository, syllabusRepository } from "@/repositories";
import { prisma } from "@/config/prisma";
import { logger } from "@/lib/logger";
import { NotFoundError, UnauthorizedError, ValidationError } from "./errors";
import { quizPromptBuilderService } from "./quiz-prompt-builder";
import { geminiService } from "./gemini";
import { quizResponseSchema } from "@/validators/quiz-response";
import type { AuditContext } from "@/repositories/types";

type QuizRecord = Record<string, unknown>;

interface TopicInfo {
  id: string;
  title: string;
  summary: string | null;
  priority: string;
  difficulty: string;
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

export const quizService = {
  async generate(syllabusId: string, userId: string, audit?: AuditContext): Promise<QuizRecord> {
    await verifySyllabusOwnership(syllabusId, userId);

    const topics = (await topicRepository.findBySyllabusId(syllabusId)) as unknown as TopicInfo[];
    if (topics.length === 0) {
      throw new ValidationError("Cannot generate quiz: syllabus has no topics");
    }

    const prompt = quizPromptBuilderService.build(topics);

    const rawResponse = await geminiService.generate(prompt);
    const validated = quizResponseSchema.parse(rawResponse);

    const topicMap = new Map(topics.map((t) => [t.title.toLowerCase(), t]));

    try {
      const quiz = await prisma.$transaction(async (tx) => {
        const created = await tx.quiz.create({
          data: {
            title: validated.title,
            syllabusId,
            questionCount: validated.questions.length,
            timeEstimate: validated.timeEstimate ?? null,
            createdBy: audit?.userId ?? null,
            updatedBy: audit?.userId ?? null,
          },
        });

        for (let i = 0; i < validated.questions.length; i++) {
          const q = validated.questions[i];
          const matchedTopic = topicMap.get(q.topicTitle.toLowerCase());
          const correctIndex = q.options.findIndex((o) => o.isCorrect);

          await tx.quizQuestion.create({
            data: {
              quizId: created.id,
              topicId: matchedTopic?.id ?? null,
              questionText: q.questionText,
              options: q.options.map((o, idx) => ({
                text: o.text,
                isCorrect: idx === correctIndex,
              })),
              explanation: q.explanation,
              difficulty: q.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
              estimatedSeconds: q.estimatedSeconds,
              order: i,
              createdBy: audit?.userId ?? null,
              updatedBy: audit?.userId ?? null,
            },
          });
        }

        return created;
      });

      logger.info("Quiz generated", { quizId: quiz.id, syllabusId, questionCount: validated.questions.length });
      return quiz as unknown as QuizRecord;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existing = await prisma.quiz.findFirst({
          where: { syllabusId },
          orderBy: { createdAt: "desc" },
        });
        if (existing) {
          logger.info("Quiz already exists (race resolved), returning existing", { syllabusId });
          return existing as unknown as QuizRecord;
        }
      }
      throw error;
    }
  },

  async getById(quizId: string, userId: string): Promise<QuizRecord | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, deletedAt: null },
      include: {
        questions: {
          where: { deletedAt: null },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) return null;

    const syllabus = await syllabusRepository.findById(quiz.syllabusId);
    if (!syllabus || (syllabus.userId as string) !== userId) {
      return null;
    }

    return quiz as unknown as QuizRecord;
  },

  async getQuestions(
    quizId: string,
    includeAnswers: boolean,
    userId: string,
  ): Promise<Record<string, unknown>[]> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, deletedAt: null },
      select: { syllabusId: true },
    });
    if (!quiz) throw new NotFoundError("Quiz", quizId);
    await verifySyllabusOwnership(quiz.syllabusId, userId);

    const questions = await prisma.quizQuestion.findMany({
      where: { quizId, deletedAt: null },
      orderBy: { order: "asc" },
    });

    return questions.map((q) => {
      const parsed = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
      const options = Array.isArray(parsed) ? parsed : [];

      return {
        id: q.id,
        quizId: q.quizId,
        topicId: q.topicId,
        questionText: q.questionText,
        options: includeAnswers
          ? options
          : options.map((o: Record<string, unknown>) => ({ text: o.text })),
        explanation: includeAnswers ? q.explanation : null,
        difficulty: q.difficulty,
        estimatedSeconds: q.estimatedSeconds,
        order: q.order,
      } as Record<string, unknown>;
    });
  },

  async getBySyllabus(syllabusId: string, userId: string): Promise<QuizRecord[]> {
    await verifySyllabusOwnership(syllabusId, userId);

    const quizzes = await prisma.quiz.findMany({
      where: { syllabusId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
    });

    return quizzes as unknown as QuizRecord[];
  },

  async getAttempts(quizId: string, userId: string): Promise<Record<string, unknown>[]> {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, deletedAt: null },
      select: { syllabusId: true },
    });
    if (!quiz) throw new NotFoundError("Quiz", quizId);
    await verifySyllabusOwnership(quiz.syllabusId, userId);

    const attempts = await quizAttemptRepository.findByQuizId(quizId);
    return attempts as Record<string, unknown>[];
  },

  async getQuizWithAttempts(quizId: string, userId: string): Promise<{
    quiz: Record<string, unknown> | null;
    attempts: Record<string, unknown>[];
    latestAttempt: Record<string, unknown> | null;
  }> {
    const quiz = await this.getById(quizId, userId);
    if (!quiz) return { quiz: null, attempts: [], latestAttempt: null };

    const attempts = await this.getAttempts(quizId, userId);

    const sorted = [...attempts].sort(
      (a, b) =>
        new Date((b.createdAt as string) || 0).getTime() -
        new Date((a.createdAt as string) || 0).getTime(),
    );

    return { quiz, attempts, latestAttempt: sorted[0] || null };
  },

  async getTopicPerformance(
    userId: string,
    syllabusId: string,
  ): Promise<Record<string, { correct: number; total: number }>> {
    const quizzes = await this.getBySyllabus(syllabusId, userId);
    const performance: Record<string, { correct: number; total: number }> = {};

    for (const quiz of quizzes) {
      const attempts = await quizAttemptRepository.findByQuizId(quiz.id as string);
      const completedAttempts = attempts.filter(
        (a) => a.completedAt != null,
      ) as Array<Record<string, unknown>>;

      for (const attempt of completedAttempts) {
        const rawAnswers = attempt.answers;
        if (!rawAnswers) continue;
        const answers = Array.isArray(rawAnswers)
          ? (rawAnswers as Array<{
              questionId: string;
              selectedOptionIndex: number;
              isCorrect: boolean;
              topicId?: string;
            }>)
          : [];
        if (answers.length === 0) continue;

        for (const answer of answers) {
          const topicId = answer.topicId || "unknown";
          if (!performance[topicId]) {
            performance[topicId] = { correct: 0, total: 0 };
          }
          performance[topicId].total++;
          if (answer.isCorrect) {
            performance[topicId].correct++;
          }
        }
      }
    }

    return performance;
  },
};
