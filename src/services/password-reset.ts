import { randomBytes, createHash } from "crypto";
import { hash } from "argon2";
import { passwordResetRepository, userRepository, transaction } from "@/repositories";
import { logger } from "@/lib/logger";
import { ExpiredTokenError, NotFoundError, UsedTokenError } from "./errors";
import type { AuditContext } from "@/repositories/types";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export const passwordResetService = {
  async request(email: string, audit?: AuditContext): Promise<string | null> {
    const user = await userRepository.findActiveByEmail(email.toLowerCase().trim());

    if (!user) {
      return null;
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await passwordResetRepository.create(
      {
        userId: user.id as string,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
      },
      audit,
    );

    logger.info("Password reset requested", { userId: user.id as string });
    return rawToken;
  },

  async validateToken(rawToken: string): Promise<string | null> {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const record = await passwordResetRepository.findByTokenHash(tokenHash);

    if (!record) {
      return null;
    }

    if (record.usedAt) {
      return null;
    }

    const expiresAt = record.expiresAt;
    if (!expiresAt || new Date(expiresAt as Date) < new Date()) {
      return null;
    }

    return record.userId as string;
  },

  async resetPassword(
    rawToken: string,
    newPassword: string,
    audit?: AuditContext,
  ): Promise<void> {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const record = await passwordResetRepository.findByTokenHash(tokenHash);

    if (!record) {
      throw new NotFoundError("Password reset token");
    }

    if (record.usedAt) {
      throw new UsedTokenError("Password reset");
    }

    const expiresAt = record.expiresAt;
    if (!expiresAt || new Date(expiresAt as Date) < new Date()) {
      throw new ExpiredTokenError("Password reset");
    }

    const passwordHash = await hash(newPassword);

    await transaction(async () => {
      await userRepository.updatePassword(record.userId as string, passwordHash, audit);
      await passwordResetRepository.markAsUsed(record.id as string, audit);
    });

    logger.info("Password reset completed", { userId: record.userId as string });
  },

  async cleanupExpired(): Promise<number> {
    const count = await passwordResetRepository.deleteExpired();
    if (count > 0) {
      logger.info("Expired password reset tokens cleaned up", { count });
    }
    return count;
  },
};
