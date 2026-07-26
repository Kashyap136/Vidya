import { RepositoryError } from "@/repositories";

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message = "You are not authorized to perform this action") {
    super(message, "UNAUTHORIZED", 403);
    this.name = "UnauthorizedError";
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message = "Invalid email or password") {
    super(message, "AUTHENTICATION_FAILED", 401);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 422);
    this.name = "ValidationError";
  }
}

export class DuplicateError extends ServiceError {
  constructor(resource: string, field: string) {
    super(
      `A ${resource} with this ${field} already exists`,
      "DUPLICATE_RESOURCE",
      409,
    );
    this.name = "DuplicateError";
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id "${id}" not found`
      : `${resource} not found`;
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ExpiredTokenError extends ServiceError {
  constructor(tokenType: string) {
    super(`${tokenType} token has expired`, "TOKEN_EXPIRED", 410);
    this.name = "ExpiredTokenError";
  }
}

export class UsedTokenError extends ServiceError {
  constructor(tokenType: string) {
    super(`${tokenType} token has already been used`, "TOKEN_USED", 410);
    this.name = "UsedTokenError";
  }
}

export function mapRepositoryError(error: RepositoryError): ServiceError {
  switch (error.code) {
    case "NOT_FOUND":
      return new NotFoundError(error.message);
    case "UNIQUE_CONSTRAINT":
      return new DuplicateError("resource", "field");
    default:
      return new ServiceError(error.message, error.code, 500);
  }
}
