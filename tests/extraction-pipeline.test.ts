import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PipelineResult } from "@/types/ai";

// ── Hoisted mock factories ──────────────────────────────────────────
const mockStorage = vi.hoisted(() => ({ download: vi.fn() }));
const mockPdfExtraction = vi.hoisted(() => ({ extract: vi.fn() }));
const mockTextNormalization = vi.hoisted(() => ({ normalize: vi.fn() }));
const mockPromptBuilder = vi.hoisted(() => ({ build: vi.fn() }));
const mockGemini = vi.hoisted(() => ({ generate: vi.fn() }));
const mockAiValidator = vi.hoisted(() => ({ validate: vi.fn() }));
const mockProcessingStatus = vi.hoisted(() => ({
  update: vi.fn(),
  markFailed: vi.fn(),
}));
const mockStudyPlanner = vi.hoisted(() => ({ generate: vi.fn() }));
const mockQuiz = vi.hoisted(() => ({ generate: vi.fn() }));
const mockSyllabusRepo = vi.hoisted(() => ({ findById: vi.fn() }));
const mockTopicRepo = vi.hoisted(() => ({
  findBySyllabusId: vi.fn(),
  hardDelete: vi.fn(),
  create: vi.fn(),
}));
const mockTransactionFn = vi.hoisted(() => vi.fn());
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/services/storage", () => ({ storageService: mockStorage }));
vi.mock("@/services/pdf-extraction", () => ({
  pdfExtractionService: mockPdfExtraction,
}));
vi.mock("@/services/text-normalization", () => ({
  textNormalizationService: mockTextNormalization,
}));
vi.mock("@/services/prompt-builder", () => ({
  promptBuilderService: mockPromptBuilder,
}));
vi.mock("@/services/gemini", () => ({ geminiService: mockGemini }));
vi.mock("@/services/ai-response-validator", () => ({
  aiResponseValidator: mockAiValidator,
}));
vi.mock("@/services/processing-status", () => ({
  processingStatusService: mockProcessingStatus,
}));
vi.mock("@/services/study-planner", () => ({ studyPlanner: mockStudyPlanner }));
vi.mock("@/services/quiz", () => ({ quizService: mockQuiz }));
vi.mock("@/repositories", () => ({
  syllabusRepository: mockSyllabusRepo,
  topicRepository: mockTopicRepo,
}));
vi.mock("@/repositories/transaction", () => ({ transaction: mockTransactionFn }));
vi.mock("@/lib/logger", () => ({ logger: mockLogger }));

// ── SUT ──────────────────────────────────────────────────────────────
import { extractionPipeline } from "@/services/extraction-pipeline";
import { ServiceError, NotFoundError, UnauthorizedError } from "@/services/errors";

// ── Test Data ───────────────────────────────────────────────────────
const syllabusId = "syllabus-test-1";
const userId = "user-test-1";
const audit = { userId };

const mockSyllabus = {
  id: syllabusId,
  userId: userId,
  filePath: "pdfs/test.pdf",
  processingStatus: "UPLOADED",
};

const mockExtracted = { text: "raw pdf text", pageCount: 5 };

const mockNormalized = {
  text: "normalized clean text",
  charCount: 100,
  lineCount: 10,
};

const mockPrompt = {
  systemInstruction: "Extract syllabus",
  contents: "normalized clean text",
};

const mockAiRaw = JSON.stringify({
  syllabusTitle: "Computer Science 101",
  topics: [
    { title: "Data Structures", description: "Arrays trees graphs", priority: "HIGH", difficulty: "INTERMEDIATE", estimatedHours: 3, prerequisites: [] },
    { title: "Algorithms", description: "Sorting searching", priority: "CRITICAL", difficulty: "ADVANCED", estimatedHours: 5, prerequisites: ["Data Structures"] },
  ],
});

const mockValidated = {
  syllabusTitle: "Computer Science 101",
  courseCode: null,
  university: null,
  totalUnits: null,
  topics: [
    { title: "Data Structures", description: "Arrays trees graphs", priority: "HIGH", difficulty: "INTERMEDIATE", estimatedHours: 3, prerequisites: [] },
    { title: "Algorithms", description: "Sorting searching", priority: "CRITICAL", difficulty: "ADVANCED", estimatedHours: 5, prerequisites: ["Data Structures"] },
  ],
};

// ── Helpers ─────────────────────────────────────────────────────────
function expectSuccessfulResult(result: PipelineResult) {
  expect(result.success).toBe(true);
  expect(result.syllabusId).toBe(syllabusId);
  expect(result.topicCount).toBe(mockValidated.topics.length);
}

// ── Tests ───────────────────────────────────────────────────────────
describe("ExtractionPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default happy-path wiring
    mockSyllabusRepo.findById.mockResolvedValue(mockSyllabus);
    mockStorage.download.mockResolvedValue(Buffer.from("fake pdf"));
    mockPdfExtraction.extract.mockResolvedValue(mockExtracted);
    mockTextNormalization.normalize.mockReturnValue(mockNormalized);
    mockPromptBuilder.build.mockReturnValue(mockPrompt);
    mockGemini.generate.mockResolvedValue(mockAiRaw);
    mockAiValidator.validate.mockReturnValue(mockValidated);
    mockTransactionFn.mockImplementation(async (fn: () => Promise<void>) => fn());
    mockTopicRepo.findBySyllabusId.mockResolvedValue([]);
    mockStudyPlanner.generate.mockResolvedValue(undefined);
    mockQuiz.generate.mockResolvedValue(undefined);
  });

  // ── Happy path ──────────────────────────────────────────────────────

  it("completes all 7 status transitions on success", async () => {
    const result = await extractionPipeline.process(syllabusId, userId, audit);

    expectSuccessfulResult(result);

    const statusCalls = mockProcessingStatus.update.mock.calls.map((c: unknown[]) => c[1]);
    expect(statusCalls).toEqual([
      "EXTRACTING",
      "NORMALIZING",
      "GENERATING",
      "VALIDATING",
      "SAVING",
      "GENERATING_PLAN",
      "GENERATING_QUIZ",
      "COMPLETED",
    ]);
  });

  it("downloads PDF from storage", async () => {
    await extractionPipeline.process(syllabusId, userId, audit);
    expect(mockStorage.download).toHaveBeenCalledWith("pdfs/test.pdf");
  });

  it("calls study planner with default dailyMinutes and targetDate", async () => {
    await extractionPipeline.process(syllabusId, userId, audit);
    expect(mockStudyPlanner.generate).toHaveBeenCalledTimes(1);
    const planArgs = mockStudyPlanner.generate.mock.calls[0][0];
    expect(planArgs.syllabusId).toBe(syllabusId);
    expect(planArgs.userId).toBe(userId);
    expect(planArgs.dailyMinutes).toBe(120);
  });

  it("calls quiz service", async () => {
    await extractionPipeline.process(syllabusId, userId, audit);
    expect(mockQuiz.generate).toHaveBeenCalledWith(syllabusId, userId, audit);
  });

  it("persists topics inside a transaction with delete+create", async () => {
    const existingTopics = [
      { id: "old-1", title: "Old Topic" },
      { id: "old-2", title: "Obsolete Topic" },
    ];
    mockTopicRepo.findBySyllabusId.mockResolvedValue(existingTopics);

    await extractionPipeline.process(syllabusId, userId, audit);

    expect(mockTransactionFn).toHaveBeenCalled();
    expect(mockTopicRepo.hardDelete).toHaveBeenCalledTimes(2);
    expect(mockTopicRepo.hardDelete).toHaveBeenCalledWith("old-1");
    expect(mockTopicRepo.hardDelete).toHaveBeenCalledWith("old-2");
    expect(mockTopicRepo.create).toHaveBeenCalledTimes(2);
    expect(mockTopicRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Data Structures", syllabusId }),
      audit,
    );
    expect(mockTopicRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Algorithms", syllabusId }),
      audit,
    );
  });

  it("maps AiTopic fields to topic fields correctly", async () => {
    await extractionPipeline.process(syllabusId, userId, audit);

    expect(mockTopicRepo.create).toHaveBeenCalledWith(
      {
        title: "Data Structures",
        summary: "Arrays trees graphs",
        priority: "HIGH",
        difficulty: "INTERMEDIATE",
        order: 0,
        estimatedMinutes: 180,
        syllabusId,
      },
      audit,
    );
    expect(mockTopicRepo.create).toHaveBeenCalledWith(
      {
        title: "Algorithms",
        summary: "Sorting searching",
        priority: "CRITICAL",
        difficulty: "ADVANCED",
        order: 1,
        estimatedMinutes: 300,
        syllabusId,
      },
      audit,
    );
  });

  // ── Input validation ──────────────────────────────────────────────

  it("throws NotFoundError when syllabus does not exist", async () => {
    mockSyllabusRepo.findById.mockResolvedValue(null);
    await expect(
      extractionPipeline.process(syllabusId, userId, audit),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws UnauthorizedError when userId does not match", async () => {
    mockSyllabusRepo.findById.mockResolvedValue({
      ...mockSyllabus,
      userId: "other-user",
    });
    await expect(
      extractionPipeline.process(syllabusId, userId, audit),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws ServiceError when filePath is missing", async () => {
    mockSyllabusRepo.findById.mockResolvedValue({
      ...mockSyllabus,
      filePath: null,
    });
    await expect(
      extractionPipeline.process(syllabusId, userId, audit),
    ).rejects.toThrow(ServiceError);
  });

  it("throws ServiceError when filePath is 'manual'", async () => {
    mockSyllabusRepo.findById.mockResolvedValue({
      ...mockSyllabus,
      filePath: "manual",
    });
    await expect(
      extractionPipeline.process(syllabusId, userId, audit),
    ).rejects.toThrow(ServiceError);
  });

  // ── Pipeline error recovery ───────────────────────────────────────

  it("catches download failure and marks FAILED", async () => {
    mockStorage.download.mockRejectedValue(new Error("download failed"));
    const result = await extractionPipeline.process(syllabusId, userId, audit);
    expect(result.success).toBe(false);
    expect(result.failedStep).toBe("DOWNLOAD");
    expect(mockProcessingStatus.markFailed).toHaveBeenCalled();
  });

  it("catches extraction failure and marks FAILED", async () => {
    mockPdfExtraction.extract.mockRejectedValue(new Error("extract failed"));
    const result = await extractionPipeline.process(syllabusId, userId, audit);
    expect(result.success).toBe(false);
    expect(result.failedStep).toBe("EXTRACTION");
  });

  it("catches Gemini generation failure and marks FAILED", async () => {
    mockGemini.generate.mockRejectedValue(new Error("Gemini API error"));
    const result = await extractionPipeline.process(syllabusId, userId, audit);
    expect(result.success).toBe(false);
    expect(result.failedStep).toBe("AI_GENERATION");
  });

  it("catches validation failure and marks FAILED", async () => {
    mockAiValidator.validate.mockImplementation(() => {
      throw new Error("validation error");
    });
    const result = await extractionPipeline.process(syllabusId, userId, audit);
    expect(result.success).toBe(false);
    expect(result.failedStep).toBe("VALIDATION");
  });

  it("catches persistence failure and marks FAILED", async () => {
    mockTransactionFn.mockImplementation(async () => {
      throw new Error("persist failed");
    });
    const result = await extractionPipeline.process(syllabusId, userId, audit);
    expect(result.success).toBe(false);
    expect(result.failedStep).toBe("PERSISTENCE");
  });

  // ── Non-fatal fallback behavior ───────────────────────────────────

  it("continues to quiz when study plan generation fails (non-fatal)", async () => {
    mockStudyPlanner.generate.mockRejectedValue(new Error("plan error"));

    const result = await extractionPipeline.process(syllabusId, userId, audit);

    expectSuccessfulResult(result);
    expect(mockQuiz.generate).toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Study plan generation skipped (non-fatal)",
      expect.any(Object),
    );
  });

  it("completes with COMPLETED when quiz generation fails (non-fatal)", async () => {
    mockQuiz.generate.mockRejectedValue(new Error("quiz error"));

    const result = await extractionPipeline.process(syllabusId, userId, audit);

    expectSuccessfulResult(result);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Quiz generation skipped (non-fatal)",
      expect.any(Object),
    );
  });

  it("completes when both plan and quiz generation fail (non-fatal)", async () => {
    mockStudyPlanner.generate.mockRejectedValue(new Error("plan error"));
    mockQuiz.generate.mockRejectedValue(new Error("quiz error"));

    const result = await extractionPipeline.process(syllabusId, userId, audit);

    expectSuccessfulResult(result);
    expect(mockProcessingStatus.update).toHaveBeenCalledWith(
      syllabusId,
      "COMPLETED",
      expect.any(Object),
    );
  });

  // ── Status ordering ───────────────────────────────────────────────

  it("follows correct status transition sequence", async () => {
    const statuses: string[] = [];
    mockProcessingStatus.update.mockImplementation(
      async (_id: string, status: string) => {
        statuses.push(status);
      },
    );

    await extractionPipeline.process(syllabusId, userId, audit);

    expect(statuses).toEqual([
      "EXTRACTING",
      "NORMALIZING",
      "GENERATING",
      "VALIDATING",
      "SAVING",
      "GENERATING_PLAN",
      "GENERATING_QUIZ",
      "COMPLETED",
    ]);
  });

  // ── Retry ─────────────────────────────────────────────────────────

  it("retry calls process when syllabus status is FAILED", async () => {
    const failedSyllabus = {
      ...mockSyllabus,
      processingStatus: "FAILED",
    };
    mockSyllabusRepo.findById.mockResolvedValue(failedSyllabus);

    await extractionPipeline.retry(syllabusId, userId, audit);

    expect(mockStorage.download).toHaveBeenCalled();
  });

  it("retry rejects when syllabus status is not FAILED", async () => {
    const completedSyllabus = {
      ...mockSyllabus,
      processingStatus: "COMPLETED",
    };
    mockSyllabusRepo.findById.mockResolvedValue(completedSyllabus);

    await expect(
      extractionPipeline.retry(syllabusId, userId, audit),
    ).rejects.toThrow(ServiceError);
  });

  it("retry throws NotFoundError when syllabus does not exist", async () => {
    mockSyllabusRepo.findById.mockResolvedValue(null);
    await expect(
      extractionPipeline.retry(syllabusId, userId, audit),
    ).rejects.toThrow(NotFoundError);
  });

  it("retry throws UnauthorizedError when userId does not match", async () => {
    const failedSyllabus = {
      ...mockSyllabus,
      userId: "other-user",
      processingStatus: "FAILED",
    };
    mockSyllabusRepo.findById.mockResolvedValue(failedSyllabus);
    await expect(
      extractionPipeline.retry(syllabusId, userId, audit),
    ).rejects.toThrow(UnauthorizedError);
  });

  // ── NORMALIZING receives raw text and page count ──────────────────

  it("passes raw text and page count to NORMALIZING status update", async () => {
    mockPdfExtraction.extract.mockResolvedValue({
      text: "exact raw text",
      pageCount: 42,
    });

    await extractionPipeline.process(syllabusId, userId, audit);

    const normalizingCall = mockProcessingStatus.update.mock.calls.find(
      (c: unknown[]) => c[1] === "NORMALIZING",
    );
    expect(normalizingCall).toBeDefined();
    const normalizingArg = normalizingCall![2];
    expect(normalizingArg).toMatchObject({
      rawText: "exact raw text",
      pageCount: 42,
    });
  });
});
