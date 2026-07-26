import { Prisma } from "@prisma/client";

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class NotFoundError extends RepositoryError {
  constructor(entity: string, id?: string) {
    const message = id
      ? `${entity} with id "${id}" not found`
      : `${entity} not found`;
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UniqueConstraintError extends RepositoryError {
  constructor(
    public readonly field: string,
    public readonly value: unknown,
  ) {
    super(
      `A record with this ${field} already exists`,
      "UNIQUE_CONSTRAINT",
    );
    this.name = "UniqueConstraintError";
  }
}

export class ForeignKeyViolationError extends RepositoryError {
  constructor(public readonly relation: string) {
    super(
      `Referenced ${relation} record does not exist`,
      "FOREIGN_KEY",
    );
    this.name = "ForeignKeyViolationError";
  }
}

export class InvalidOperationError extends RepositoryError {
  constructor(message: string) {
    super(message, "INVALID_OPERATION");
    this.name = "InvalidOperationError";
  }
}

const PRISMA_ERROR_MAP: Record<string, (e: Prisma.PrismaClientKnownRequestError) => RepositoryError> = {
  P2002: (e) => {
    const target = (e.meta?.target as string[])?.[0] ?? "field";
    return new UniqueConstraintError(target, e.meta?.value);
  },
  P2025: () => new NotFoundError("Record"),
  P2003: (e) => {
    const field = (e.meta?.field_name as string) ?? "related";
    return new ForeignKeyViolationError(field);
  },
  P2016: () => new NotFoundError("Record"),
};

export function translateError(error: unknown): RepositoryError {
  if (error instanceof RepositoryError) {
    return error;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    PRISMA_ERROR_MAP[error.code]
  ) {
    return PRISMA_ERROR_MAP[error.code](error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new RepositoryError("Invalid query parameters", "VALIDATION");
  }

  return new RepositoryError(
    error instanceof Error ? error.message : "An unexpected database error occurred",
    "UNKNOWN",
  );
}
