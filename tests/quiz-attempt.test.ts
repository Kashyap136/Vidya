import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuestions = [
  {
    id: "q1",
    options: [
      { text: "A", isCorrect: true },
      { text: "B", isCorrect: false },
      { text: "C", isCorrect: false },
      { text: "D", isCorrect: false },
    ],
  },
  {
    id: "q2",
    options: [
      { text: "X", isCorrect: false },
      { text: "Y", isCorrect: true },
      { text: "Z", isCorrect: false },
    ],
  },
];

const mockCreate = vi.fn();

vi.mock("@/config/prisma", () => ({
  prisma: {
    quizQuestion: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/repositories", () => ({
  quizAttemptRepository: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { quizAttemptService } from "@/services/quiz-attempt";
import { prisma } from "@/config/prisma";

describe("quizAttemptService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("record", () => {
    it("scores correct answers accurately", async () => {
      vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue(mockQuestions as any);
      mockCreate.mockResolvedValue({ id: "attempt-1" });

      const result = await quizAttemptService.record({
        userId: "user-1",
        quizId: "quiz-1",
        totalQuestions: 2,
        answers: [
          { questionId: "q1", selectedOptionIndex: 0 },
          { questionId: "q2", selectedOptionIndex: 1 },
        ],
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 2,
          totalQuestions: 2,
        }),
        undefined,
      );
      expect(result).toBeDefined();
    });

    it("scores partial correct answers", async () => {
      vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue(mockQuestions as any);
      mockCreate.mockResolvedValue({ id: "attempt-2" });

      await quizAttemptService.record({
        userId: "user-1",
        quizId: "quiz-1",
        totalQuestions: 2,
        answers: [
          { questionId: "q1", selectedOptionIndex: 0 },
          { questionId: "q2", selectedOptionIndex: 0 },
        ],
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 1,
          totalQuestions: 2,
        }),
        undefined,
      );
    });

    it("scores zero correct answers", async () => {
      vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue(mockQuestions as any);
      mockCreate.mockResolvedValue({ id: "attempt-3" });

      await quizAttemptService.record({
        userId: "user-1",
        quizId: "quiz-1",
        totalQuestions: 2,
        answers: [
          { questionId: "q1", selectedOptionIndex: 1 },
          { questionId: "q2", selectedOptionIndex: 0 },
        ],
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 0,
          totalQuestions: 2,
        }),
        undefined,
      );
    });

    it("throws ValidationError when totalQuestions is zero", async () => {
      await expect(
        quizAttemptService.record({
          userId: "user-1",
          quizId: "quiz-1",
          totalQuestions: 0,
          answers: [],
        }),
      ).rejects.toThrow("Total questions must be greater than zero");
    });

    it("throws NotFoundError when no questions found", async () => {
      vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue([]);

      await expect(
        quizAttemptService.record({
          userId: "user-1",
          quizId: "quiz-1",
          totalQuestions: 2,
          answers: [],
        }),
      ).rejects.toThrow("QuizQuestions");
    });

    it("throws UnauthorizedError when audit user mismatches", async () => {
      await expect(
        quizAttemptService.record(
          {
            userId: "user-1",
            quizId: "quiz-1",
            totalQuestions: 1,
            answers: [],
          },
          { userId: "user-2" },
        ),
      ).rejects.toThrow("not authorized");
    });

    it("throws ValidationError when question has null options", async () => {
      vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue([
        { id: "q-bad", options: null } as any,
      ]);

      await expect(
        quizAttemptService.record({
          userId: "user-1",
          quizId: "quiz-1",
          totalQuestions: 1,
          answers: [{ questionId: "q-bad", selectedOptionIndex: 0 }],
        }),
      ).rejects.toThrow("has no options configured");
    });

    it("throws ValidationError when question has no correct answer", async () => {
      vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue([
        { id: "q-no-correct", options: [{ text: "A", isCorrect: false }] } as any,
      ]);

      await expect(
        quizAttemptService.record({
          userId: "user-1",
          quizId: "quiz-1",
          totalQuestions: 1,
          answers: [{ questionId: "q-no-correct", selectedOptionIndex: 0 }],
        }),
      ).rejects.toThrow("has no correct answer configured");
    });

    it("records timeTaken when provided", async () => {
      vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue(mockQuestions as any);
      mockCreate.mockResolvedValue({ id: "attempt-4" });

      await quizAttemptService.record({
        userId: "user-1",
        quizId: "quiz-1",
        totalQuestions: 2,
        answers: [
          { questionId: "q1", selectedOptionIndex: 0 },
          { questionId: "q2", selectedOptionIndex: 1 },
        ],
        timeTaken: 120,
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          timeTaken: 120,
        }),
        undefined,
      );
    });

    it("stores answers array in the attempt record", async () => {
      vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue(mockQuestions as any);
      mockCreate.mockResolvedValue({ id: "attempt-5" });

      await quizAttemptService.record({
        userId: "user-1",
        quizId: "quiz-1",
        totalQuestions: 2,
        answers: [
          { questionId: "q1", selectedOptionIndex: 0 },
          { questionId: "q2", selectedOptionIndex: 1 },
        ],
      });

      const createCall = mockCreate.mock.calls[0][0];
      expect(createCall.answers).toHaveLength(2);
      expect(createCall.answers[0]).toMatchObject({
        questionId: "q1",
        isCorrect: true,
      });
      expect(createCall.answers[1]).toMatchObject({
        questionId: "q2",
        isCorrect: true,
      });
    });
  });
});
