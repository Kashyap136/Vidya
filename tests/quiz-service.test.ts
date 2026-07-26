import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSyllabusFindById = vi.fn();
const mockTopicFindBySyllabusId = vi.fn();
const mockQuizCreate = vi.fn();
const mockQuizQuestionCreate = vi.fn();
const mockQuizFindUnique = vi.fn();
const mockQuizFindFirst = vi.fn();
const mockGenerate = vi.fn();
const mockBuild = vi.fn();

vi.mock("@/repositories", () => ({
  syllabusRepository: { findById: (...args: unknown[]) => mockSyllabusFindById(...args) },
  topicRepository: { findBySyllabusId: (...args: unknown[]) => mockTopicFindBySyllabusId(...args) },
  quizAttemptRepository: { findByQuizId: vi.fn() },
}));

vi.mock("@/config/prisma", () => ({
  prisma: {
    quiz: {
      create: (...args: unknown[]) => mockQuizCreate(...args),
      findUnique: (...args: unknown[]) => mockQuizFindUnique(...args),
      findFirst: (...args: unknown[]) => mockQuizFindFirst(...args),
    },
    quizQuestion: {
      create: (...args: unknown[]) => mockQuizQuestionCreate(...args),
    },
    $transaction: <T>(fn: (tx: unknown) => Promise<T>) =>
      fn({
        quiz: { create: (...args: unknown[]) => mockQuizCreate(...args) },
        quizQuestion: { create: (...args: unknown[]) => mockQuizQuestionCreate(...args) },
      }),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/services/gemini", () => ({
  geminiService: { generate: (...args: unknown[]) => mockGenerate(...args) },
}));

vi.mock("@/services/quiz-prompt-builder", () => ({
  quizPromptBuilderService: { build: (...args: unknown[]) => mockBuild(...args) },
}));

import { quizService } from "@/services/quiz";

describe("quizService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuild.mockReturnValue({ systemInstruction: "prompt", contents: "content" });
  });

  describe("generate", () => {
    const validGeminiResponse = {
      title: "Data Structures Quiz",
      timeEstimate: 30,
      questions: [
        {
          questionText: "What is an array?",
          topicTitle: "Arrays",
          options: [
            { text: "A data structure", isCorrect: true },
            { text: "A function", isCorrect: false },
            { text: "A loop", isCorrect: false },
            { text: "A variable", isCorrect: false },
          ],
          explanation: "An array is a data structure",
          difficulty: "BEGINNER",
          estimatedSeconds: 30,
        },
        {
          questionText: "What is a linked list?",
          topicTitle: "Linked Lists",
          options: [
            { text: "A linear structure", isCorrect: true },
            { text: "A tree", isCorrect: false },
            { text: "A hash", isCorrect: false },
            { text: "A graph", isCorrect: false },
          ],
          explanation: "A linked list is linear",
          difficulty: "BEGINNER",
          estimatedSeconds: 30,
        },
        {
          questionText: "What is a stack?",
          topicTitle: "Stacks",
          options: [
            { text: "LIFO", isCorrect: true },
            { text: "FIFO", isCorrect: false },
            { text: "LILO", isCorrect: false },
            { text: "FILO", isCorrect: false },
          ],
          explanation: "Stack is LIFO",
          difficulty: "BEGINNER",
          estimatedSeconds: 30,
        },
      ],
    };

    it("generates quiz and persists questions", async () => {
      mockSyllabusFindById.mockResolvedValue({ id: "s1", userId: "user-1" });
      mockTopicFindBySyllabusId.mockResolvedValue([
        { id: "t1", title: "Arrays", summary: "Arrays topic", priority: "HIGH", difficulty: "BEGINNER" },
        { id: "t2", title: "Linked Lists", summary: "Linked lists topic", priority: "MEDIUM", difficulty: "INTERMEDIATE" },
        { id: "t3", title: "Stacks", summary: "Stacks topic", priority: "HIGH", difficulty: "INTERMEDIATE" },
      ]);
      mockGenerate.mockResolvedValue(validGeminiResponse);
      mockQuizCreate.mockResolvedValue({ id: "quiz-1", syllabusId: "s1", questionCount: 1 });

      const result = await quizService.generate("s1", "user-1", { userId: "user-1" });

      expect(result).toBeDefined();
      expect(mockQuizCreate).toHaveBeenCalled();
      expect(mockQuizQuestionCreate).toHaveBeenCalled();
    });

    it("throws when syllabus not found", async () => {
      mockSyllabusFindById.mockResolvedValue(null);

      await expect(
        quizService.generate("nonexistent", "user-1", { userId: "user-1" }),
      ).rejects.toThrow("not found");
    });

    it("throws when unauthorized (wrong userId)", async () => {
      mockSyllabusFindById.mockResolvedValue({ id: "s1", userId: "user-2" });

      await expect(
        quizService.generate("s1", "user-1", { userId: "user-1" }),
      ).rejects.toThrow("not authorized");
    });

    it("throws when no topics exist", async () => {
      mockSyllabusFindById.mockResolvedValue({ id: "s1", userId: "user-1" });
      mockTopicFindBySyllabusId.mockResolvedValue([]);

      await expect(
        quizService.generate("s1", "user-1", { userId: "user-1" }),
      ).rejects.toThrow("syllabus has no topics");
    });
  });

  describe("getById", () => {
    it("returns null for nonexistent quiz", async () => {
      mockQuizFindUnique.mockResolvedValue(null);

      const result = await quizService.getById("nonexistent", "user-1");
      expect(result).toBeNull();
    });

    it("returns null when syllabus ownership fails", async () => {
      mockQuizFindUnique.mockResolvedValue({ id: "quiz-1", syllabusId: "s1" });
      mockSyllabusFindById.mockResolvedValue({ id: "s1", userId: "user-2" });

      const result = await quizService.getById("quiz-1", "user-1");
      expect(result).toBeNull();
    });

    it("returns quiz when ownership passes", async () => {
      mockQuizFindUnique.mockResolvedValue({
        id: "quiz-1",
        syllabusId: "s1",
        questions: [{ id: "q1", questionText: "What?" }],
      });
      mockSyllabusFindById.mockResolvedValue({ id: "s1", userId: "user-1" });

      const result = await quizService.getById("quiz-1", "user-1");
      expect(result).toBeDefined();
    });
  });
});
