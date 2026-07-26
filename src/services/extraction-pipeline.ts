import { storageService } from "./storage";
import { pdfExtractionService } from "./pdf-extraction";
import { textNormalizationService } from "./text-normalization";
import { promptBuilderService } from "./prompt-builder";
import { geminiService } from "./gemini";
import { aiResponseValidator } from "./ai-response-validator";
import { processingStatusService } from "./processing-status";
import { studyPlanner } from "./study-planner";
import { quizService } from "./quiz";
import { syllabusRepository, topicRepository } from "@/repositories";
import { transaction } from "@/repositories/transaction";
import { NotFoundError, UnauthorizedError, ServiceError } from "./errors";
import { logger } from "@/lib/logger";
import type { AuditContext } from "@/repositories/types";
import type { PipelineResult } from "@/types/ai";

const DEFAULT_DAILY_MINUTES = 120;
const DEFAULT_PLAN_DAYS = 30;
const PIPELINE_TIMEOUT_MS = 300_000;

function stepLog(syllabusId: string, stepName: string, phase: "START" | "END" | "FAILED", extra?: Record<string, unknown>) {
  logger.info(`[Pipeline] ${phase} ${stepName}`, {
    syllabusId, pipelineStep: stepName, phase, ...extra,
  });
}

export const extractionPipeline = {
  async process(
    syllabusId: string,
    userId: string,
    audit?: AuditContext,
  ): Promise<PipelineResult> {
    const pipelineStart = performance.now();
    stepLog(syllabusId, "Pipeline", "START", { userId });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new ServiceError(
        `Pipeline timed out after ${PIPELINE_TIMEOUT_MS / 1000}s`,
        "PIPELINE_TIMEOUT",
        408,
      )), PIPELINE_TIMEOUT_MS),
    );

    try {
      const result = await Promise.race([
        this.execute(syllabusId, userId, audit, pipelineStart),
        timeoutPromise,
      ]);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown pipeline error";
      const _stack = error instanceof Error ? error.stack : "";
      const failedStep = determineFailedStep(error);

      logger.error("[Pipeline] Pipeline FAILED", {
        syllabusId, failedStep, error: message,
        durationMs: Math.round(performance.now() - pipelineStart),
      });

      await processingStatusService.markFailed(
        syllabusId,
        failedStep,
        message,
        audit,
      );

      return {
        success: false,
        syllabusId,
        failedStep,
        errorMessage: message,
      };
    }
  },

  async execute(
    syllabusId: string,
    userId: string,
    audit: AuditContext | undefined,
    pipelineStart: number,
  ): Promise<PipelineResult> {
    // 1. Ownership verification
    stepLog(syllabusId, "Verify ownership", "START");
    const syllabus = await syllabusRepository.findById(syllabusId);
    if (!syllabus) throw new NotFoundError("Syllabus", syllabusId);
    if (syllabus.userId as string !== userId) throw new UnauthorizedError();
    stepLog(syllabusId, "Verify ownership", "END");

    // 2. Input detection
    const filePath = syllabus.filePath as string;
    const rawText = syllabus.rawText as string | null;
    const inputMethod = rawText ? "TEXT" : (filePath && filePath !== "manual" ? "PDF" : "NONE");
    if (inputMethod === "NONE") {
      throw new ServiceError("No content attached", "NO_CONTENT", 400);
    }
    stepLog(syllabusId, "Input detection", "END", { inputMethod });

    // 3. Extract text
    stepLog(syllabusId, "Extract text", "START", { inputMethod });
    let normalizedText: string;
    if (inputMethod === "TEXT") {
      await processingStatusService.update(syllabusId, "EXTRACTING", { audit });
      normalizedText = textNormalizationService.normalize(rawText!).text;
      await processingStatusService.update(syllabusId, "EXTRACTED", { rawText, audit });
    } else {
      await processingStatusService.update(syllabusId, "EXTRACTING", { audit });
      const buffer = await storageService.download(filePath!);
      const extracted = await pdfExtractionService.extract(buffer);
      await processingStatusService.update(syllabusId, "EXTRACTED", {
        rawText: extracted.text, pageCount: extracted.pageCount, audit,
      });
      normalizedText = textNormalizationService.normalize(extracted.text).text;
    }
    stepLog(syllabusId, "Extract text", "END", { normalizedLength: normalizedText.length });

    // 4. Generate topics via Gemini
    stepLog(syllabusId, "Generate topics (AI)", "START");
    await processingStatusService.update(syllabusId, "GENERATING_TOPICS", { audit });
    const prompt = promptBuilderService.build(normalizedText);
    const aiRaw = await geminiService.generate(prompt);
    stepLog(syllabusId, "Generate topics (AI)", "END");

    // 5. Validate AI response
    stepLog(syllabusId, "Validate AI response", "START");
    const validated = aiResponseValidator.validate(aiRaw);
    stepLog(syllabusId, "Validate AI response", "END", { topicCount: validated.topics.length });

    // 6. Persist topics
    stepLog(syllabusId, "Persist topics", "START");
    await transaction(async () => {
      const existing = await topicRepository.findBySyllabusId(syllabusId);
      for (const t of existing) {
        await topicRepository.hardDelete(t.id as string);
      }
      for (let i = 0; i < validated.topics.length; i++) {
        const t = validated.topics[i];
        await topicRepository.create({
          title: t.title,
          summary: t.description,
          priority: t.priority,
          difficulty: t.difficulty,
          order: i,
          estimatedMinutes: t.estimatedHours * 60,
          syllabusId,
        }, audit);
      }
    });
    await processingStatusService.update(syllabusId, "TOPICS_CREATED", { audit });
    stepLog(syllabusId, "Persist topics", "END", { count: validated.topics.length });

    // 7. Generate study plan
    stepLog(syllabusId, "Generate study plan", "START");
    await processingStatusService.update(syllabusId, "GENERATING_PLAN", { audit });
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + DEFAULT_PLAN_DAYS);
    const plan = await studyPlanner.generate({
      syllabusId, userId,
      dailyMinutes: DEFAULT_DAILY_MINUTES,
      targetDate: targetDate.toISOString().slice(0, 10),
      audit,
    });
    await processingStatusService.update(syllabusId, "PLAN_CREATED", { audit });
    stepLog(syllabusId, "Generate study plan", "END", { planId: (plan as Record<string, unknown>).id as string });

    // 8. Generate quiz
    stepLog(syllabusId, "Generate quiz", "START");
    await processingStatusService.update(syllabusId, "GENERATING_QUIZ", { audit });
    const quiz = await quizService.generate(syllabusId, userId, audit);
    await processingStatusService.update(syllabusId, "QUIZ_CREATED", { audit });
    stepLog(syllabusId, "Generate quiz", "END", { quizId: (quiz as Record<string, unknown>).id as string });

    // 9. Mark COMPLETED
    stepLog(syllabusId, "Pipeline", "END", {
      totalDurationMs: Math.round(performance.now() - pipelineStart),
    });

    const topicCount = validated.topics.length;
    await processingStatusService.update(syllabusId, "COMPLETED", { audit });

    return { success: true, syllabusId, topicCount };
  },

  async retry(
    syllabusId: string,
    userId: string,
    audit?: AuditContext,
  ): Promise<PipelineResult> {
    stepLog(syllabusId, "Retry", "START", { userId });

    const syllabus = await syllabusRepository.findById(syllabusId, {
      includeDeleted: true,
    });

    if (!syllabus) throw new NotFoundError("Syllabus", syllabusId);
    if (syllabus.userId as string !== userId) throw new UnauthorizedError();

    const currentStatus = syllabus.processingStatus as string;
    if (currentStatus !== "FAILED") {
      throw new ServiceError(
        `Cannot retry syllabus with status "${currentStatus}". Only failed syllabuses can be retried.`,
        "INVALID_STATUS", 400,
      );
    }

    return this.process(syllabusId, userId, audit);
  },
};

function determineFailedStep(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("timeout") && message.includes("Pipeline")) return "PIPELINE_TIMEOUT";
  if (message.includes("download") || message.includes("storage")) return "DOWNLOAD";
  if (message.includes("extract") || message.includes("No extractable text")) return "EXTRACTION";
  if (message.includes("Gemini") || message.includes("AI") || message.includes("429") || message.includes("quota") || message.includes("rate") || message.includes("timeout")) return "AI_GENERATION";
  if (message.includes("validation")) return "VALIDATION";
  if (message.includes("persist") || message.includes("transaction")) return "PERSISTENCE";
  if (message.includes("plan") || message.includes("Planner")) return "PLAN_GENERATION";
  if (message.includes("quiz") || message.includes("Quiz")) return "QUIZ_GENERATION";
  return "UNKNOWN";
}
