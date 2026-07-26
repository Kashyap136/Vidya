import { prisma } from "@/config/prisma";
import type { AuditContext, QueryOptions } from "./types";
import { BaseRepository } from "./base";

type VerificationTokenRecord = Record<string, unknown>;
type CreateVerificationTokenInput = Record<string, unknown>;
type UpdateVerificationTokenInput = Record<string, unknown>;

export class VerificationTokenRepository extends BaseRepository<VerificationTokenRecord, CreateVerificationTokenInput, UpdateVerificationTokenInput> {
  protected supportsSoftDelete = false;
  protected supportsAuditFields = false;
  protected entityName = "VerificationToken";

  constructor() {
    super(prisma.verificationToken as unknown as import("./base").Delegate);
  }

  async findByIdentifier(identifier: string, options?: QueryOptions): Promise<VerificationTokenRecord[]> {
    return this.findMany({ identifier } as Record<string, unknown>, options);
  }

  async findByToken(token: string, options?: QueryOptions): Promise<VerificationTokenRecord | null> {
    return this.findFirst({ token } as Record<string, unknown>, options);
  }

  async deleteByIdentifier(identifier: string, token: string): Promise<void> {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier, token },
      },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.verificationToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });

    return result.count;
  }
}

export const verificationTokenRepository = new VerificationTokenRepository();

export async function findVerificationByToken(token: string): Promise<VerificationTokenRecord | null> {
  return verificationTokenRepository.findByToken(token);
}

export async function createVerificationToken(
  data: CreateVerificationTokenInput,
  audit?: AuditContext,
): Promise<VerificationTokenRecord> {
  return verificationTokenRepository.create(data, audit);
}
