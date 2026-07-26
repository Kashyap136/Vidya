import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { credentialsProvider } from "./providers/credentials";
import { handleOAuthSignIn } from "./sign-in";
import { prisma } from "@/config/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, credentialsProvider],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.type === "credentials") {
        return true;
      }

      if (account?.type === "oauth" && account.provider === "google") {
        const userId = await handleOAuthSignIn(profile as Parameters<typeof handleOAuthSignIn>[0], {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
        });

        if (!userId) {
          return false;
        }

        user.id = userId;
        return true;
      }

      return false;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        if (user.id) {
          token.id = user.id;
        }
        token.role = user.role ?? "STUDENT";
      }

      if (trigger !== "signIn" && trigger !== "update" && token.id) {
        const now = Math.floor(Date.now() / 1000);
        const lastVerified = (token.userVerifiedAt as number) ?? 0;
        if (now - lastVerified > 300) {
          const exists = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { deletedAt: true },
          });
          if (!exists || exists.deletedAt) {
            return null;
          }
          token.userVerifiedAt = now;
        }
      }

      if (trigger === "update" && session) {
        if (session.user.name) {
          token.name = session.user.name;
        }
        if (session.user.email) {
          token.email = session.user.email;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV === "development",
});
