import { randomBytes, createHash } from "crypto";
import { verificationTokenRepository, userRepository, transaction } from "@/repositories";
import { logger } from "@/lib/logger";
import type { AuditContext } from "@/repositories/types";

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export const verificationService = {
  async create(email: string, audit?: AuditContext): Promise<string | null> {
    const user = await userRepository.findActiveByEmail(email.toLowerCase().trim());

    if (!user) {
      return null;
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await verificationTokenRepository.create(
      {
        identifier: email.toLowerCase().trim(),
        token: tokenHash,
        expires: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
      },
      audit,
    );

    logger.info("Verification token created", { userId: user.id as string });
    return rawToken;
  },

  async verifyEmail(rawToken: string): Promise<string | null> {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const record = await verificationTokenRepository.findByToken(tokenHash);

    if (!record) {
      return null;
    }

    const expires = record.expires;
    if (!expires || new Date(expires as Date) < new Date()) {
      await verificationTokenRepository.deleteByIdentifier(record.identifier as string, record.token as string);
      return null;
    }

    const email = record.identifier as string;
    let userId: string | null = null;

    await transaction(async () => {
      const user = await userRepository.findActiveByEmail(email);
      if (user) {
        userId = user.id as string;
        await userRepository.update(
          userId,
          { emailVerified: new Date() } as Record<string, unknown>,
        );
      }
      await verificationTokenRepository.deleteByIdentifier(record.identifier as string, record.token as string);
    });

    logger.info("Email verified", { userId: userId ?? undefined });
    return email;
  },
};
