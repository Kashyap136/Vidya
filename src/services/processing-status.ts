import { syllabusRepository } from "@/repositories";
import { logger } from "@/lib/logger";
import type { AuditContext } from "@/repositories/types";

type ProcessingStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "EXTRACTED"
  | "GENERATING_TOPICS"
  | "TOPICS_CREATED"
  | "GENERATING_PLAN"
  | "PLAN_CREATED"
  | "GENERATING_QUIZ"
  | "QUIZ_CREATED"
  | "COMPLETED"
  | "FAILED";

export const processingStatusService = {
  async update(
    syllabusId: string,
    status: ProcessingStatus,
    options?: {
      rawText?: string | null;
      pageCount?: number | null;
      errorMessage?: string;
      failedStep?: string;
      audit?: AuditContext;
    },
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      processingStatus: status,
    };

    if (options?.rawText !== undefined) {
      updateData.rawText = options.rawText;
    }

    if (options?.pageCount !== undefined) {
      updateData.pageCount = options.pageCount;
    }

    if (options?.errorMessage !== undefined) {
      updateData.errorMessage = options.errorMessage;
    }

    if (options?.failedStep !== undefined) {
      updateData.failedStep = options.failedStep;
    }

    await syllabusRepository.update(syllabusId, updateData, options?.audit);

    logger.info("Syllabus processing status updated", {
      syllabusId,
      status,
      failedStep: options?.failedStep,
      errorMessage: options?.errorMessage,
    });
  },

  async markFailed(
    syllabusId: string,
    failedStep: string,
    errorMessage: string,
    audit?: AuditContext,
  ): Promise<void> {
    await this.update(syllabusId, "FAILED", {
      errorMessage,
      failedStep,
      audit,
    });

    logger.error("Syllabus processing failed", {
      syllabusId,
      failedStep,
      errorMessage,
    });
  },
};
