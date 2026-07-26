import { verify } from "argon2";
import { userRepository, accountRepository } from "@/repositories";
import { logger } from "@/lib/logger";
import { AuthenticationError } from "./errors";
import type { AuditContext } from "@/repositories/types";

type UserRecord = Record<string, unknown>;

interface OAuthProfile {
  email?: string | null;
  name?: string | null;
  image?: string | null;
  email_verified?: boolean | null;
}

interface OAuthAccount {
  provider: string;
  providerAccountId: string;
  type: string;
}

export const authService = {
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserRecord> {
    const user = await userRepository.findFirst(
      {
        email: email.toLowerCase().trim(),
        password: { not: null },
      } as Record<string, unknown>,
      { includeDeleted: false },
    );

    if (!user) {
      throw new AuthenticationError();
    }

    const isValid = await verify(user.password as string, password);

    if (!isValid) {
      throw new AuthenticationError();
    }

    const { password: _pw, ...safeUser } = user;
    return safeUser;
  },

  async oauthSignIn(
    profile: OAuthProfile,
    account: OAuthAccount,
    audit?: AuditContext,
  ): Promise<string | false> {
    const email = profile.email;

    if (!email) {
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const softDeletedUser = await userRepository.findByEmail(normalizedEmail, {
      includeDeleted: true,
      select: { id: true, deletedAt: true },
    } as unknown as import("@/repositories/types").QueryOptions);

    if ((softDeletedUser as { deletedAt?: Date | null } | null)?.deletedAt) {
      return false;
    }

    const existingAccount = await accountRepository.findByProvider(
      account.provider,
      account.providerAccountId,
    );

    if (existingAccount) {
      const existingUser = await userRepository.findActiveById(
        existingAccount.userId as string,
      );

      if (existingUser && (existingUser.email as string) !== normalizedEmail) {
        await userRepository.update(
          existingAccount.userId as string,
          { email: normalizedEmail } as Record<string, unknown>,
          audit,
        );
      }

      return existingAccount.userId as string;
    }

    const existingUser = await userRepository.findByEmail(normalizedEmail, {
      includeDeleted: true,
    });

    if (existingUser) {
      try {
        await accountRepository.linkProvider({
          userId: existingUser.id as string,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        }, audit);

        return existingUser.id as string;
      } catch (error) {
        logger.error("Failed to link OAuth account to existing user", {
          provider: account.provider,
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    }

    try {
      const newUser = await userRepository.create(
        {
          email: normalizedEmail,
          name: profile.name ?? normalizedEmail.split("@")[0],
          image: profile.image ?? null,
          emailVerified: profile.email_verified ? new Date() : null,
          password: null,
          role: "STUDENT",
        },
        audit,
      );

      await accountRepository.linkProvider({
        userId: newUser.id as string,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      }, audit);

      return newUser.id as string;
    } catch (error) {
      logger.error("Failed to create user from OAuth profile", {
        provider: account.provider,
        email: normalizedEmail,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  },

  async getAuthenticatedUser(userId: string): Promise<UserRecord | null> {
    return userRepository.findActiveById(userId);
  },
};
