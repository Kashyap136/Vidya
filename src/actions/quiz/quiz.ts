"use server";

import { auth } from "@/auth/config";
import { quizService } from "@/services";
import { updateTag, revalidatePath } from "next/cache";
import { aiGenerationLimiter, checkRateLimit } from "@/lib/rate-limit-helpers";
import type { ActionResponse } from "@/types";

export async function generateQuizAction(
  syllabusId: string,
): Promise<ActionResponse<Record<string, unknown>>> {
  const rateLimitResult = await checkRateLimit(aiGenerationLimiter, "generate-quiz");
  if (rateLimitResult) return rateLimitResult;

  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const quiz = await quizService.generate(syllabusId, session.user.id, {
      userId: session.user.id,
    });

    revalidatePath(`/dashboard/syllabi/${syllabusId}/quiz`);
    updateTag(`quiz-${syllabusId}`);

    return { success: true, data: quiz };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "GENERATION_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function listQuizzesAction(
  syllabusId: string,
): Promise<ActionResponse<Record<string, unknown>[]>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const quizzes = await quizService.getBySyllabus(syllabusId, session.user.id);
    return { success: true, data: quizzes as Record<string, unknown>[] };
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

export async function getQuizWithAttemptsAction(
  quizId: string,
): Promise<ActionResponse<{
  quiz: Record<string, unknown> | null;
  attempts: Record<string, unknown>[];
  latestAttempt: Record<string, unknown> | null;
}>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const result = await quizService.getQuizWithAttempts(quizId, session.user.id);

    if (!result.quiz) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Quiz not found" },
      };
    }

    return { success: true, data: result };
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

export async function getQuizQuestionsAction(
  quizId: string,
  includeAnswers: boolean = false,
): Promise<ActionResponse<Record<string, unknown>[]>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const questions = await quizService.getQuestions(quizId, includeAnswers, session.user.id);
    return { success: true, data: questions };
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

export async function getTopicPerformanceAction(
  syllabusId: string,
): Promise<ActionResponse<Record<string, { correct: number; total: number }>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const performance = await quizService.getTopicPerformance(session.user.id, syllabusId);
    return { success: true, data: performance };
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
