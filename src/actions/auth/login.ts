"use server";

import { signIn, auth } from "@/auth/config";
import { AuthError } from "next-auth";
import { loginSchema } from "@/validators/auth";
import { loginLimiter, checkRateLimit } from "@/lib/rate-limit-helpers";
import { logger } from "@/lib/logger";
import type { ActionResponse } from "@/types";

export async function loginAction(
  _prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse<{ userId: string }>> {
  const rateLimitResult = await checkRateLimit(loginLimiter, "login");
  if (rateLimitResult) return rateLimitResult;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

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
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      logger.warn("Login failed", { type: error.type, message: error.message });
    } else {
      logger.error("Login error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return {
      success: false,
      error: {
        code: "AUTHENTICATION_FAILED",
        message: "Invalid email or password",
      },
    };
  }

  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: {
        code: "AUTHENTICATION_FAILED",
        message: "Could not establish session",
      },
    };
  }

  return { success: true, data: { userId: session.user.id } };
}
