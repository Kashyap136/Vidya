import { prisma } from "@/config/prisma";
import type { AuditContext, QueryOptions } from "./types";
import { BaseRepository } from "./base";

type PasswordResetRecord = Record<string, unknown>;
type CreatePasswordResetInput = Record<string, unknown>;
type UpdatePasswordResetInput = Record<string, unknown>;

export class PasswordResetRepository extends BaseRepository<PasswordResetRecord, CreatePasswordResetInput, UpdatePasswordResetInput> {
  protected supportsSoftDelete = false;
  protected supportsAuditFields = false;
  protected entityName = "PasswordResetToken";

  constructor() {
    super(prisma.passwordResetToken as unknown as import("./base").Delegate);
  }

  async findByTokenHash(tokenHash: string, options?: QueryOptions): Promise<PasswordResetRecord | null> {
    return this.findFirst({ tokenHash } as Record<string, unknown>, options);
  }

  async findActiveByUserId(userId: string): Promise<PasswordResetRecord[]> {
    const now = new Date();
    return this.findMany({
      userId,
      expiresAt: { gt: now },
      usedAt: null,
    } as Record<string, unknown>);
  }

  async markAsUsed(id: string, audit?: AuditContext): Promise<PasswordResetRecord> {
    return this.update(id, { usedAt: new Date() } as UpdatePasswordResetInput, audit);
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() }, usedAt: null },
    });

    return result.count;
  }
}

export const passwordResetRepository = new PasswordResetRepository();

export async function findPasswordResetByToken(tokenHash: string): Promise<PasswordResetRecord | null> {
  return passwordResetRepository.findByTokenHash(tokenHash);
}

export async function createPasswordResetToken(
  data: CreatePasswordResetInput,
  audit?: AuditContext,
): Promise<PasswordResetRecord> {
  return passwordResetRepository.create(data, audit);
}

export async function markResetTokenAsUsed(id: string): Promise<PasswordResetRecord> {
  return passwordResetRepository.markAsUsed(id);
}
