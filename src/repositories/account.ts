import { prisma } from "@/config/prisma";
import type { AuditContext, QueryOptions } from "./types";
import { BaseRepository } from "./base";
import { UniqueConstraintError } from "./errors";

type AccountRecord = Record<string, unknown>;
type CreateAccountInput = Record<string, unknown>;
type UpdateAccountInput = Record<string, unknown>;

export class AccountRepository extends BaseRepository<AccountRecord, CreateAccountInput, UpdateAccountInput> {
  protected supportsSoftDelete = false;
  protected entityName = "Account";

  constructor() {
    super(prisma.account as unknown as import("./base").Delegate);
  }

  async findByProvider(
    provider: string,
    providerAccountId: string,
    options?: QueryOptions,
  ): Promise<AccountRecord | null> {
    return this.findFirst(
      { provider, providerAccountId } as Record<string, unknown>,
      options,
    );
  }

  async findByUserId(userId: string, options?: QueryOptions): Promise<AccountRecord[]> {
    return this.findMany({ userId } as Record<string, unknown>, options);
  }

  async linkProvider(
    data: { userId: string; type: string; provider: string; providerAccountId: string },
    audit?: AuditContext,
  ): Promise<AccountRecord> {
    try {
      return await this.create(data as unknown as CreateAccountInput, audit);
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintError) {
        const existing = await this.findByProvider(data.provider, data.providerAccountId);
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }
}

export const accountRepository = new AccountRepository();

export async function findAccountByProvider(
  provider: string,
  providerAccountId: string,
): Promise<AccountRecord | null> {
  return accountRepository.findByProvider(provider, providerAccountId);
}

export async function findAccountsByUserId(userId: string): Promise<AccountRecord[]> {
  return accountRepository.findByUserId(userId);
}

export async function linkAccount(
  data: { userId: string; type: string; provider: string; providerAccountId: string },
  audit?: AuditContext,
): Promise<AccountRecord> {
  return accountRepository.linkProvider(data, audit);
}
