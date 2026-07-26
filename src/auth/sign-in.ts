import { prisma } from "@/config/prisma";
import { logger } from "@/lib/logger";
import type { AdapterAccount } from "@auth/core/adapters";

interface OAuthProfile {
  email?: string | null;
  name?: string | null;
  image?: string | null;
  email_verified?: boolean | null;
}

export async function handleOAuthSignIn(
  profile: OAuthProfile,
  account: Pick<AdapterAccount, "provider" | "providerAccountId" | "type">,
) {
  const email = profile.email;

  if (!email) {
    return false;
  }

  const softDeletedUser = await prisma.user.findUnique({
    where: { email },
    select: { deletedAt: true },
  });

  if (softDeletedUser?.deletedAt) {
    return false;
  }

  const existingAccount = await prisma.account.findFirst({
    where: {
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    },
    select: {
      userId: true,
      user: {
        select: { email: true, name: true, image: true },
      },
    },
  });

  if (existingAccount) {
    if (existingAccount.user.email !== email) {
      await prisma.user.update({
        where: { id: existingAccount.userId },
        data: { email },
      });
    }

    return existingAccount.userId;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, deletedAt: true },
  });

  if (existingUser) {
    try {
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        const linked = await prisma.account.findFirst({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
          select: { userId: true },
        });
        if (linked) {
          return linked.userId;
        }
      }
      logger.error("OAuth account link failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        provider: account.provider,
      });
      return false;
    }

    return existingUser.id;
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        name: profile.name ?? email.split("@")[0],
        image: profile.image,
        emailVerified: profile.email_verified ? new Date() : null,
        accounts: {
          create: {
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      },
      select: { id: true },
    });

    return newUser.id;
  } catch (error) {
    logger.error("OAuth user creation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      email,
    });
    return false;
  }
}
