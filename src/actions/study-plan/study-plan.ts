"use server";

import { z } from "zod/v4";
import { auth } from "@/auth/config";
import { studyPlanner } from "@/services";
import { updateTag, revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

const generateSchema = z.object({
  syllabusId: z.string().uuid(),
  dailyMinutes: z.number().int().min(15).max(480),
  targetDate: z.string().min(1),
  preferredDays: z.array(z.number().int().min(0).max(6)).optional(),
});

const updateSettingsSchema = z.object({
  dailyMinutes: z.number().int().min(15).max(480).optional(),
  targetDate: z.string().min(1).optional(),
  preferredDays: z.array(z.number().int().min(0).max(6)).optional(),
});

export async function generatePlanAction(
  data: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = generateSchema.safeParse(data);

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
    const plan = await studyPlanner.generate({
      ...parsed.data,
      userId: session.user.id,
      audit: { userId: session.user.id },
    });

    revalidatePath(`/dashboard/syllabi/${parsed.data.syllabusId}/plan`);
    updateTag(`study-plan-${parsed.data.syllabusId}`);

    return { success: true, data: plan };
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

export async function regeneratePlanAction(
  syllabusId: string,
  settings?: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = settings ? updateSettingsSchema.safeParse(settings) : null;
  const cleanSettings = parsed?.success ? parsed.data : {};

  try {
    const plan = await studyPlanner.regenerate(syllabusId, session.user.id, {
      ...cleanSettings,
      audit: { userId: session.user.id },
    });

    revalidatePath(`/dashboard/syllabi/${syllabusId}/plan`);
    updateTag(`study-plan-${syllabusId}`);

    return { success: true, data: plan };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "REGENERATION_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function getPlanAction(
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
    const plan = await studyPlanner.getPlan(syllabusId, session.user.id);

    if (!plan) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "No active study plan found" },
      };
    }

    return { success: true, data: plan };
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

export async function toggleTaskAction(
  taskId: string,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const plan = await studyPlanner.toggleTask(taskId, session.user.id);

    const syllabusId = (plan as Record<string, unknown>).syllabusId as string | undefined;
    if (syllabusId) {
      revalidatePath(`/dashboard/syllabi/${syllabusId}/plan`);
    }
    revalidatePath(`/dashboard`);

    return { success: true, data: plan };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "TOGGLE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function getTodayPlanAction(): Promise<
  ActionResponse<{
    plan: Record<string, unknown> | null;
    day: Record<string, unknown> | null;
    overallProgress: number;
    streak: number;
    syllabusTitle: string | null;
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
    const today = await studyPlanner.getToday(session.user.id);
    return { success: true, data: today };
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

export async function getPlanStatsAction(
  syllabusId: string,
): Promise<
  ActionResponse<{
    totalMinutes: number;
    completedMinutes: number;
    totalTasks: number;
    completedTasks: number;
    totalDays: number;
    completedDays: number;
    streak: number;
    daysRemaining: number;
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
    const stats = await studyPlanner.getStats(syllabusId, session.user.id);
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
