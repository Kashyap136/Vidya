export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

export interface FilterParams {
  field: string;
  operator: "equals" | "contains" | "gt" | "gte" | "lt" | "lte" | "in" | "not";
  value: unknown;
}

export interface PageMeta {
  hasNextPage: boolean;
  nextCursor?: string;
  totalCount?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pageMeta: PageMeta;
}

export interface QueryOptions {
  includeDeleted?: boolean;
  select?: Record<string, unknown>;
  include?: Record<string, unknown>;
}

export interface AuditContext {
  userId?: string;
}
