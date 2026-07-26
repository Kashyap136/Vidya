import Credentials from "next-auth/providers/credentials";
import { verify } from "argon2";
import { prisma } from "@/config/prisma";
import { logger } from "@/lib/logger";

export const credentialsProvider = Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  authorize: async (credentials) => {
    if (!credentials?.email || !credentials?.password) {
      logger.warn("Credentials authorize: missing email or password");
      return null;
    }

    const email = String(credentials.email);
    const password = String(credentials.password);

    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        password: { not: null },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      logger.warn("Credentials authorize: user not found", { email });
      return null;
    }

    if (!user.password) {
      logger.warn("Credentials authorize: user has no password", { email });
      return null;
    }

    const isValid = await verify(user.password, password);

    if (!isValid) {
      logger.warn("Credentials authorize: invalid password", { email });
      return null;
    }

    logger.info("Credentials authorize: success", { email });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  },
});
