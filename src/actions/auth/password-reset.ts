"use server";

import { requestResetSchema, resetPasswordSchema } from "@/validators/auth";
import { passwordResetService, userService, sendPasswordResetEmail } from "@/services";
import { passwordResetLimiter, checkRateLimit } from "@/lib/rate-limit-helpers";
import { logger } from "@/lib/logger";
import type { ActionResponse } from "@/types";

export async function requestResetAction(
  _prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse<{ message: string }>> {
  const rateLimitResult = await checkRateLimit(passwordResetLimiter, "reset-request");
  if (rateLimitResult) return rateLimitResult;

  const parsed = requestResetSchema.safeParse({
    email: formData.get("email"),
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
    const token = await passwordResetService.request(parsed.data.email);

    if (token) {
      const user = await userService.getByEmail(parsed.data.email);
      const name = (user?.name as string) ?? parsed.data.email;
      await sendPasswordResetEmail(parsed.data.email, name, token);
    } else {
      logger.info("Password reset requested for unknown email", {
        email: parsed.data.email,
      });
    }

    return {
      success: true,
      data: { message: "If the email exists, a reset link has been sent" },
    };
  } catch (error) {
    logger.error("Password reset request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      success: false,
      error: { code: "RESET_REQUEST_FAILED", message: "Could not process request" },
    };
  }
}

export async function resetPasswordAction(
  _prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse<{ message: string }>> {
  const rateLimitResult = await checkRateLimit(passwordResetLimiter, "reset-password");
  if (rateLimitResult) return rateLimitResult;

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
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
    await passwordResetService.resetPassword(
      parsed.data.token,
      parsed.data.password,
    );

    return { success: true, data: { message: "Password has been reset successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "RESET_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}
