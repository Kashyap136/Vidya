"use server";

import { z } from "zod/v4";
import { auth } from "@/auth/config";
import { topicService } from "@/services";
import { updateTag, revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

const createTopicSchema = z.object({
  syllabusId: z.string().uuid(),
  title: z.string().min(1).max(200).trim(),
  summary: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedMinutes: z.number().int().positive(),
});

const updateTopicSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  summary: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
});

const reorderSchema = z.object({
  syllabusId: z.string().uuid(),
  topicIds: z.array(z.string().uuid()).min(1),
});

export async function listTopicsAction(
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
    const topics = await topicService.getBySyllabus(syllabusId, session.user.id);

    return { success: true, data: topics as Record<string, unknown>[] };
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

export async function createTopicAction(
  data: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = createTopicSchema.safeParse(data);

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
    const topic = await topicService.create(parsed.data, session.user.id, {
      userId: session.user.id,
    });

    updateTag(`topics-${parsed.data.syllabusId}`);
    revalidatePath(`/dashboard/syllabi/${parsed.data.syllabusId}`);

    return { success: true, data: topic };
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

export async function updateTopicAction(
  topicId: string,
  data: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = updateTopicSchema.safeParse(data);

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
    const topic = await topicService.update(topicId, parsed.data, session.user.id, {
      userId: session.user.id,
    });

    updateTag(`topics-${(topic as Record<string, unknown>).syllabusId as string}`);

    return { success: true, data: topic };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "UPDATE_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function reorderTopicsAction(
  data: { syllabusId: string; topicIds: string[] },
): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const parsed = reorderSchema.safeParse(data);

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
    await topicService.reorder(
      parsed.data.syllabusId,
      parsed.data.topicIds,
      session.user.id,
      { userId: session.user.id },
    );

    updateTag(`topics-${parsed.data.syllabusId}`);
    revalidatePath(`/dashboard/syllabi/${parsed.data.syllabusId}`);

    return { success: true, data: { message: "Topics reordered successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "REORDER_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}

export async function toggleTopicCompletionAction(
  topicId: string,
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const topic = await topicService.toggleCompletion(topicId, session.user.id, {
      userId: session.user.id,
    });

    const syllabusId = (topic as Record<string, unknown>).syllabusId as string;
    updateTag(`topics-${syllabusId}`);
    updateTag(`topic-progress-${syllabusId}`);
    revalidatePath(`/dashboard/syllabi/${syllabusId}`);
    revalidatePath("/dashboard");

    return { success: true, data: topic };
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

export async function getTopicProgressAction(
  syllabusId: string,
): Promise<ActionResponse<{
  total: number;
  completed: number;
  remaining: number;
  totalHours: number;
  completedHours: number;
}>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const stats = await topicService.getProgressStats(syllabusId, session.user.id);
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

export async function deleteTopicAction(
  topicId: string,
): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const topic = await topicService.softDelete(topicId, session.user.id, {
      userId: session.user.id,
    });

    updateTag(`topics-${(topic as Record<string, unknown>).syllabusId as string}`);
    revalidatePath(`/dashboard/syllabi/${(topic as Record<string, unknown>).syllabusId as string}`);

    return { success: true, data: { message: "Topic deleted successfully" } };
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
