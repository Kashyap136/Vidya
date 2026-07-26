import { hash } from "argon2";
import { userRepository } from "@/repositories";
import { logger } from "@/lib/logger";
import { DuplicateError, NotFoundError, UnauthorizedError, ValidationError } from "./errors";
import type { AuditContext } from "@/repositories/types";

type UserRecord = Record<string, unknown>;

interface CreateUserData {
  email: string;
  password?: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  role?: string;
}

interface UpdateProfileData {
  name?: string | null;
  image?: string | null;
  email?: string;
}

export const userService = {
  async create(data: CreateUserData, audit?: AuditContext): Promise<UserRecord> {
    const email = data.email.toLowerCase().trim();

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new DuplicateError("user", "email");
    }

    let passwordHash: string | undefined;

    if (data.password) {
      passwordHash = await hash(data.password);
    }

    const user = await userRepository.create(
      {
        email,
        name: data.name ?? email.split("@")[0],
        image: data.image ?? null,
        emailVerified: data.emailVerified ?? null,
        password: passwordHash ?? null,
        role: data.role ?? "STUDENT",
      },
      audit,
    );

    logger.info("User created", { userId: user.id as string });
    return user;
  },

  async getById(id: string): Promise<UserRecord | null> {
    return userRepository.findActiveById(id);
  },

  async getByEmail(email: string): Promise<UserRecord | null> {
    return userRepository.findActiveByEmail(email);
  },

  async updateProfile(
    userId: string,
    data: UpdateProfileData,
    audit?: AuditContext,
  ): Promise<UserRecord> {
    if (audit?.userId && audit.userId !== userId) {
      throw new UnauthorizedError();
    }

    const user = await userRepository.findActiveById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    if (data.email) {
      const normalizedEmail = data.email.toLowerCase().trim();
      const existing = await userRepository.findByEmail(normalizedEmail);
      if (existing && (existing.id as string) !== userId) {
        throw new DuplicateError("user", "email");
      }
      data.email = normalizedEmail;
    }

    const updated = await userRepository.update(userId, data as Record<string, unknown>, audit);
    logger.info("User profile updated", { userId });
    return updated;
  },

  async softDelete(userId: string, audit?: AuditContext): Promise<UserRecord> {
    if (audit?.userId && audit.userId !== userId) {
      throw new UnauthorizedError();
    }

    const user = await userRepository.findActiveById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    const deleted = await userRepository.softDelete(userId, audit);
    logger.info("User soft deleted", { userId });
    return deleted;
  },

  async restore(userId: string, audit?: AuditContext): Promise<UserRecord> {
    const user = await userRepository.findById(userId, { includeDeleted: true });
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    if (!user.deletedAt) {
      throw new ValidationError("User is not deleted");
    }

    const restored = await userRepository.update(
      userId,
      { deletedAt: null } as Record<string, unknown>,
      audit,
    );
    logger.info("User restored", { userId });
    return restored;
  },

  async checkEmailAvailability(email: string): Promise<boolean> {
    const existing = await userRepository.findByEmail(email.toLowerCase().trim());
    return !existing;
  },
};
