"use server";

import { signupSchema } from "@/validators/auth";
import { userService, verificationService, sendVerificationEmail } from "@/services";
import { registerLimiter, checkRateLimit } from "@/lib/rate-limit-helpers";
import { logger } from "@/lib/logger";
import type { ActionResponse } from "@/types";

export async function registerAction(
  _prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse<{ userId: string }>> {
  const rateLimitResult = await checkRateLimit(registerLimiter, "register");
  if (rateLimitResult) return rateLimitResult;
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
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
    const user = await userService.create({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name,
    });

    const token = await verificationService.create(parsed.data.email, {
      userId: user.id as string,
    });

    if (token) {
      const sent = await sendVerificationEmail(
        parsed.data.email,
        (user.name as string) ?? parsed.data.email,
        token,
      );
      if (!sent.sent) {
        return {
          success: false,
          error: { code: "EMAIL_FAILED", message: sent.error ?? "Failed to send verification email" },
        };
      }
    } else {
      logger.warn("Verification token not created", { email: parsed.data.email });
    }

    return { success: true, data: { userId: user.id as string } };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: { code: "REGISTRATION_FAILED", message: error.message },
      };
    }
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    };
  }
}
