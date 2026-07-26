import { prisma } from "@/config/prisma";
import type { AuditContext, PaginatedResult, PaginationParams, QueryOptions } from "./types";
import { BaseRepository } from "./base";

type UserRecord = Record<string, unknown>;

interface CreateUserInput extends Record<string, unknown> {
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  password?: string | null;
  role?: string;
}

interface UpdateUserInput extends Record<string, unknown> {
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  password?: string | null;
  role?: string;
  email?: string;
}

export class UserRepository extends BaseRepository<UserRecord, CreateUserInput, UpdateUserInput> {
  protected supportsSoftDelete = true;
  protected entityName = "User";

  constructor() {
    super(prisma.user as unknown as import("./base").Delegate);
  }

  async findByEmail(email: string, options?: QueryOptions): Promise<UserRecord | null> {
    return this.findFirst({ email } as Record<string, unknown>, options);
  }

  async findActiveByEmail(email: string): Promise<UserRecord | null> {
    return this.findFirst(
      { email } as Record<string, unknown>,
      { includeDeleted: false },
    );
  }

  async findActiveById(id: string): Promise<UserRecord | null> {
    return this.findById(id, { includeDeleted: false });
  }

  async updatePassword(id: string, password: string, audit?: AuditContext): Promise<UserRecord> {
    return this.update(id, { password } as UpdateUserInput, audit);
  }

  async findManyWithAccounts(
    params: PaginationParams,
    where?: Record<string, unknown>,
    options?: QueryOptions,
  ): Promise<PaginatedResult<UserRecord>> {
    return this.paginate(
      params,
      where,
      { ...options, include: { accounts: true } },
    );
  }
}

export const userRepository = new UserRepository();

export async function findUserByEmail(email: string, options?: QueryOptions): Promise<UserRecord | null> {
  return userRepository.findByEmail(email, options);
}

export async function findUserById(id: string, options?: QueryOptions): Promise<UserRecord | null> {
  return userRepository.findById(id, options);
}

export async function createUser(data: CreateUserInput, audit?: AuditContext): Promise<UserRecord> {
  return userRepository.create(data, audit);
}

export async function updateUser(id: string, data: UpdateUserInput, audit?: AuditContext): Promise<UserRecord> {
  return userRepository.update(id, data, audit);
}

export async function softDeleteUser(id: string, audit?: AuditContext): Promise<UserRecord> {
  return userRepository.softDelete(id, audit);
}
