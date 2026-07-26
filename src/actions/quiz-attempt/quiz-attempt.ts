"use server";

import { z } from "zod/v4";
import { auth } from "@/auth/config";
import { quizAttemptService } from "@/services";
import { updateTag, revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

const recordAttemptSchema = z.object({
  quizId: z.string().uuid(),
  totalQuestions: z.number().int().positive(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionIndex: z.number().int(),
  })),
  timeTaken: z.number().int().optional().nullable(),
});

const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function recordQuizAttemptAction(
  data: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = recordAttemptSchema.safeParse(data);

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
    const attempt = await quizAttemptService.record(
      {
        ...parsed.data,
        userId: session.user.id,
      },
      { userId: session.user.id },
    );

    const quizId = attempt.quizId as string;
    updateTag(`quiz-attempts-${session.user.id}`);
    revalidatePath(`/dashboard/syllabi/[id]/quiz/${quizId}`);
    revalidatePath("/dashboard");

    return { success: true, data: attempt };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "RECORD_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function listQuizAttemptsAction(
  params?: { cursor?: string; limit?: number },
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = paginationSchema.safeParse(params ?? {});
  const pagination = parsed.success
    ? { cursor: parsed.data.cursor, limit: parsed.data.limit }
    : {};

  try {
    const result = await quizAttemptService.getByUser(session.user.id, pagination);

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

export async function getQuizStatsAction(): Promise<
  ActionResponse<{
    totalAttempts: number;
    averageScore: number;
    averagePercentage: number;
    highestScore: number;
    lowestScore: number;
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
    const stats = await quizAttemptService.getStats(session.user.id);

    return { success: true, data: stats };
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
