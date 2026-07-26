"use server";

import { z } from "zod/v4";
import { auth } from "@/auth/config";
import { userService } from "@/services";
import { updateTag } from "next/cache";
import type { ActionResponse } from "@/types";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
});

export async function getProfileAction(): Promise<
  ActionResponse<{ id: string; email: string; name?: string | null; image?: string | null; role: string }>
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    const user = await userService.getById(session.user.id);

    if (!user) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      };
    }

    return {
      success: true,
      data: {
        id: user.id as string,
        email: user.email as string,
        name: user.name as string | null | undefined,
        image: user.image as string | null | undefined,
        role: user.role as string,
      },
    };
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

export async function updateProfileAction(
  data: FormData | { name?: string; email?: string },
): Promise<ActionResponse<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  const rawData = data instanceof FormData
    ? { name: data.get("name") as string | null, email: data.get("email") as string | null }
    : data;

  const parsed = updateProfileSchema.safeParse(rawData);

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
    const updated = await userService.updateProfile(
      session.user.id,
      parsed.data,
      { userId: session.user.id },
    );

    updateTag(`user-${session.user.id}`);

    return { success: true, data: { id: updated.id as string } };
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

export async function deleteAccountAction(): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in" },
    };
  }

  try {
    await userService.softDelete(session.user.id, { userId: session.user.id });

    updateTag(`user-${session.user.id}`);

    return { success: true, data: { message: "Account deleted successfully" } };
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
