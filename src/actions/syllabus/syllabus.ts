"use server";

import { z } from "zod/v4";
import { auth } from "@/auth/config";
import { syllabusService, pdfValidationService, storageService, extractionPipeline, topicService, processingStatusService } from "@/services";
import { syllabusRepository } from "@/repositories";
import { after } from "next/server";
import { updateTag, revalidatePath } from "next/cache";
import { aiGenerationLimiter, checkRateLimit } from "@/lib/rate-limit-helpers";
import { logger } from "@/lib/logger";
import type { ActionResponse } from "@/types";
import type { PaginationParams } from "@/repositories/types";

const createSyllabusSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  filePath: z.string().optional(),
  rawText: z.string().optional().nullable(),
  pageCount: z.number().int().positive().optional().nullable(),
});

const renameSyllabusSchema = z.object({
  title: z.string().min(1).max(200).trim(),
});

const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  includeArchived: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "oldest", "alphabetical"]).optional(),
});

export async function getSyllabusAction(
  syllabusId: string,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const syllabus = await syllabusService.getById(syllabusId, session.user.id);

    return { success: true, data: syllabus };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "FETCH_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function listSyllabusesAction(
  params?: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = paginationSchema.safeParse(params ?? {});
  const pagination: PaginationParams & { includeArchived?: boolean; sort?: string } = parsed.success
    ? {
        cursor: parsed.data.cursor,
        limit: parsed.data.limit,
        includeArchived: parsed.data.includeArchived,
        sort: parsed.data.sort,
      }
    : {};

  try {
    const result = await syllabusService.getByUserId(session.user.id, pagination);

    return { success: true, data: result as unknown as Record<string, unknown> };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "FETCH_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function createSyllabusAction(
  data: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = createSyllabusSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues.map((i) => i.message).join(", "),
      },
    };
  }

  try {
    const syllabus = await syllabusService.create(
      {
        ...parsed.data,
        userId: session.user.id,
      },
      { userId: session.user.id },
    );

    updateTag("syllabuses");
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return { success: true, data: syllabus };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "CREATE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function renameSyllabusAction(
  syllabusId: string,
  data: { title: string },
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = renameSyllabusSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues.map((i) => i.message).join(", "),
      },
    };
  }

  try {
    const syllabus = await syllabusService.rename(
      syllabusId,
      session.user.id,
      { title: parsed.data.title },
      { userId: session.user.id },
    );

    updateTag("syllabuses");
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return { success: true, data: syllabus };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "RENAME_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function archiveSyllabusAction(
  syllabusId: string,
): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    await syllabusService.archive(syllabusId, session.user.id, {
      userId: session.user.id,
    });

    updateTag("syllabuses");
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return { success: true, data: { message: "Syllabus archived successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "ARCHIVE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function restoreSyllabusAction(
  syllabusId: string,
): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    await syllabusService.restore(syllabusId, session.user.id, {
      userId: session.user.id,
    });

    updateTag("syllabuses");
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return { success: true, data: { message: "Syllabus restored successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "RESTORE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function deleteSyllabusAction(
  syllabusId: string,
): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    await syllabusService.delete(syllabusId, session.user.id);

    updateTag("syllabuses");
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return { success: true, data: { message: "Syllabus deleted permanently" } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "DELETE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function uploadPdfAction(
  syllabusId: string,
  formData: FormData,
): Promise<ActionResponse<{ filePath: string; fileName: string; fileSize: number }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "No file provided" },
    };
  }

  const validation = await pdfValidationService.validateFile(file);
  if (!validation.valid) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: validation.errors.join("; ") },
    };
  }

  try {
    const filePath = await storageService.upload(syllabusId, session.user.id, file);

    await syllabusService.updateFileMetadata(
      syllabusId,
      session.user.id,
      {
        filePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
      },
      { userId: session.user.id },
    );

    // Schedule pipeline to run after response is sent
    after(async () => {
      logger.info("[uploadPdfAction] Starting pipeline via after()", { syllabusId });
      const result = await extractionPipeline.process(syllabusId, session.user.id, {
        userId: session.user.id,
      });
      if (result.success) {
        logger.info("[uploadPdfAction] Pipeline completed", {
          syllabusId, topicCount: result.topicCount,
        });
      } else {
        logger.error("[uploadPdfAction] Pipeline failed", {
          syllabusId, failedStep: result.failedStep, errorMessage: result.errorMessage,
        });
      }
    });

    updateTag("syllabuses");
    revalidatePath(`/dashboard/syllabi/${syllabusId}`);
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { filePath, fileName: file.name, fileSize: file.size },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "UPLOAD_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function replacePdfAction(
  syllabusId: string,
  formData: FormData,
): Promise<ActionResponse<{ filePath: string; fileName: string; fileSize: number }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "No file provided" },
    };
  }

  const validation = await pdfValidationService.validateFile(file);
  if (!validation.valid) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: validation.errors.join("; ") },
    };
  }

  try {
    const filePath = await storageService.replace(syllabusId, session.user.id, file);

    await syllabusService.updateFileMetadata(
      syllabusId,
      session.user.id,
      {
        filePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
      },
      { userId: session.user.id },
    );

    // Reset processing status before re-triggering pipeline
    await processingStatusService.update(syllabusId, "UPLOADED", {
      rawText: null,
      pageCount: null,
      audit: { userId: session.user.id },
    });

    // Schedule pipeline to run after response is sent
    after(async () => {
      logger.info("[replacePdfAction] Starting pipeline via after()", { syllabusId });
      const result = await extractionPipeline.process(syllabusId, session.user.id, {
        userId: session.user.id,
      });
      if (result.success) {
        logger.info("[replacePdfAction] Pipeline completed", {
          syllabusId, topicCount: result.topicCount,
        });
      } else {
        logger.error("[replacePdfAction] Pipeline failed", {
          syllabusId, failedStep: result.failedStep, errorMessage: result.errorMessage,
        });
      }
    });

    updateTag("syllabuses");
    revalidatePath(`/dashboard/syllabi/${syllabusId}`);
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { filePath, fileName: file.name, fileSize: file.size },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "REPLACE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function deletePdfAction(
  syllabusId: string,
): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const syllabus = await syllabusService.getById(syllabusId, session.user.id);
    const currentPath = syllabus.filePath as string;

    if (currentPath && currentPath !== "manual") {
      await storageService.delete(currentPath);
    }

    await syllabusService.clearFileMetadata(syllabusId, session.user.id, {
      userId: session.user.id,
    });

    updateTag("syllabuses");
    revalidatePath(`/dashboard/syllabi/${syllabusId}`);
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return { success: true, data: { message: "File deleted successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "DELETE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function getDownloadUrlAction(
  syllabusId: string,
): Promise<ActionResponse<{ url: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const syllabus = await syllabusService.getById(syllabusId, session.user.id);
    const filePath = syllabus.filePath as string;

    if (!filePath || filePath === "manual") {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "No file attached to this syllabus" },
      };
    }

    const url = await storageService.getDownloadUrl(filePath);
    return { success: true, data: { url } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "FETCH_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function saveSyllabusTextAction(
  syllabusId: string,
  text: string,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  if (!text || text.trim().length < 50) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Syllabus text must be at least 50 characters" },
    };
  }

  try {
    const syllabus = await syllabusService.getById(syllabusId, session.user.id);
    logger.info("[saveSyllabusTextAction] Syllabus found", { syllabusId, title: syllabus.title as string });

    const trimmedText = text.trim();
    logger.info("[saveSyllabusTextAction] Updating syllabus with raw text", {
      syllabusId,
      textLength: trimmedText.length,
      filePath: "manual",
    });

    await syllabusRepository.update(
      syllabusId,
      {
        rawText: trimmedText,
        filePath: "manual",
        fileName: null,
        fileSize: null,
        mimeType: null,
        processingStatus: "UPLOADED",
      } as Record<string, unknown>,
      { userId: session.user.id },
    );

    logger.info("[saveSyllabusTextAction] Syllabus updated, starting pipeline", { syllabusId });

    // Schedule pipeline to run after response is sent
    after(async () => {
      logger.info("[saveSyllabusTextAction] Starting pipeline via after()", { syllabusId });
      const result = await extractionPipeline.process(syllabusId, session.user.id, {
        userId: session.user.id,
      });
      if (result.success) {
        logger.info("[saveSyllabusTextAction] Pipeline completed", {
          syllabusId, topicCount: result.topicCount,
        });
      } else {
        logger.error("[saveSyllabusTextAction] Pipeline failed", {
          syllabusId, failedStep: result.failedStep, errorMessage: result.errorMessage,
        });
      }
    });

    updateTag("syllabuses");
    revalidatePath(`/dashboard/syllabi/${syllabusId}`);
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return { success: true, data: syllabus };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : "";
    logger.error("[saveSyllabusTextAction] Unexpected error", {
      syllabusId,
      error: errMsg,
      stack: errStack,
    });
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "SAVE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function processSyllabusAction(
  syllabusId: string,
): Promise<ActionResponse<{ topicCount: number }>> {
  const rateLimitResult = await checkRateLimit(aiGenerationLimiter, "process-syllabus");
  if (rateLimitResult) return rateLimitResult;

  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const result = await extractionPipeline.process(syllabusId, session.user.id, {
      userId: session.user.id,
    });

    if (!result.success) {
      return {
        success: false,
        error: {
          code: "PROCESSING_FAILED",
          message: result.errorMessage ?? "Processing failed at step: " + (result.failedStep ?? "unknown"),
        },
      };
    }

    updateTag("syllabuses");
    revalidatePath(`/dashboard/syllabi/${syllabusId}`);
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { topicCount: result.topicCount ?? 0 },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "PROCESSING_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function retryProcessingAction(
  syllabusId: string,
): Promise<ActionResponse<{ topicCount: number }>> {
  const rateLimitResult = await checkRateLimit(aiGenerationLimiter, "retry-processing");
  if (rateLimitResult) return rateLimitResult;

  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const result = await extractionPipeline.retry(syllabusId, session.user.id, {
      userId: session.user.id,
    });

    if (!result.success) {
      return {
        success: false,
        error: {
          code: "RETRY_FAILED",
          message: result.errorMessage ?? "Retry failed at step: " + (result.failedStep ?? "unknown"),
        },
      };
    }

    updateTag("syllabuses");
    revalidatePath(`/dashboard/syllabi/${syllabusId}`);
    revalidatePath("/dashboard/syllabi");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { topicCount: result.topicCount ?? 0 },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "RETRY_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function getDashboardDataAction(): Promise<
  ActionResponse<{
    stats: { total: number; active: number; archived: number };
    recentSyllabuses: (Record<string, unknown> & { topicsProgress?: { total: number; completed: number; totalHours: number } })[];
  }>
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const stats = await syllabusService.getUserStats(session.user.id);
    const recentSyllabuses = (await syllabusService.getRecent(session.user.id, 5)) as Record<string, unknown>[];

    const syllabusesWithProgress = await Promise.all(
      recentSyllabuses.map(async (syllabus) => {
        try {
          const progress = await topicService.getProgressStats(syllabus.id as string, session.user.id);
          return { ...syllabus, topicsProgress: progress };
        } catch {
          return syllabus;
        }
      }),
    );

    return { success: true, data: { stats, recentSyllabuses: syllabusesWithProgress } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "FETCH_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}