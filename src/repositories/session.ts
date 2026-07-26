import { prisma } from "@/config/prisma";
import type { QueryOptions } from "./types";
import { BaseRepository } from "./base";

type SessionRecord = Record<string, unknown>;
type CreateSessionInput = Record<string, unknown>;
type UpdateSessionInput = Record<string, unknown>;

export class SessionRepository extends BaseRepository<SessionRecord, CreateSessionInput, UpdateSessionInput> {
  protected supportsSoftDelete = false;
  protected supportsAuditFields = false;
  protected entityName = "Session";

  constructor() {
    super(prisma.session as unknown as import("./base").Delegate);
  }

  async findBySessionToken(sessionToken: string, options?: QueryOptions): Promise<SessionRecord | null> {
    return this.findFirst({ sessionToken } as Record<string, unknown>, options);
  }

  async findActiveByUserId(userId: string): Promise<SessionRecord[]> {
    const now = new Date();
    return this.findMany({
      userId,
      expires: { gt: now },
    } as Record<string, unknown>);
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: { expires: { lt: new Date() } },
    });

    return result.count;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }
}

export const sessionRepository = new SessionRepository();

export async function findSessionByToken(sessionToken: string): Promise<SessionRecord | null> {
  return sessionRepository.findBySessionToken(sessionToken);
}

export async function findActiveSessions(userId: string): Promise<SessionRecord[]> {
  return sessionRepository.findActiveByUserId(userId);
}

export async function removeExpiredSessions(): Promise<number> {
  return sessionRepository.deleteExpired();
}

export async function removeUserSessions(userId: string): Promise<void> {
  return sessionRepository.deleteByUserId(userId);
}
