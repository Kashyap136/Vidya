import type { AuditContext, PaginatedResult, PaginationParams, QueryOptions, SortParams } from "./types";
import { NotFoundError, translateError } from "./errors";

const MAX_PAGE_LIMIT = 100;

type WhereInput = Record<string, unknown>;
type DataInput = Record<string, unknown>;

export interface Delegate {
  findUnique: (args: { where: WhereInput } & Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  findFirst: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  findMany: (args: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
  create: (args: { data: DataInput } & Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (args: { where: WhereInput; data: DataInput } & Record<string, unknown>) => Promise<Record<string, unknown>>;
  delete: (args: { where: WhereInput }) => Promise<Record<string, unknown>>;
  count: (args: Record<string, unknown>) => Promise<number>;
}

export abstract class BaseRepository<
  TModel extends Record<string, unknown>,
  TCreateInput extends Record<string, unknown>,
  TUpdateInput extends Record<string, unknown>,
> {
  protected abstract supportsSoftDelete: boolean;
  protected supportsAuditFields = true;
  protected abstract entityName: string;

  constructor(protected delegate: Delegate) {}

  private addSoftDeleteFilter(
    where: WhereInput,
    options?: QueryOptions,
  ): WhereInput {
    if (!this.supportsSoftDelete) return where;
    if (options?.includeDeleted) return where;
    return { ...where, deletedAt: null };
  }

  private addAuditFields(
    data: DataInput,
    audit?: AuditContext,
    mode: "create" | "update" = "create",
  ): DataInput {
    if (!audit?.userId || !this.supportsAuditFields) return data;

    const result = { ...data };

    if (mode === "create") {
      result.createdBy = audit.userId;
    }

    result.updatedBy = audit.userId;

    return result;
  }

  async findById(
    id: string,
    options?: QueryOptions,
  ): Promise<TModel | null> {
    try {
      const where = this.addSoftDeleteFilter({ id } as WhereInput, options);

      if (this.supportsSoftDelete) {
        const args: Record<string, unknown> = { where };
        if (options?.select) args.select = options.select;
        if (options?.include) args.include = options.include;
        const result = await this.delegate.findFirst(args);
        return result as TModel | null;
      }

      const args: Record<string, unknown> = { where };
      if (options?.select) args.select = options.select;
      if (options?.include) args.include = options.include;

      const result = await this.delegate.findUnique(args as Parameters<Delegate["findUnique"]>[0]);
      return result as TModel | null;
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async findFirst(
    where: WhereInput = {},
    options?: QueryOptions & { orderBy?: SortParams },
  ): Promise<TModel | null> {
    try {
      const args: Record<string, unknown> = {
        where: this.addSoftDeleteFilter(where, options),
      };

      if (options?.select) args.select = options.select;
      if (options?.include) args.include = options.include;

      if (options?.orderBy) {
        args.orderBy = { [options.orderBy.field]: options.orderBy.order };
      }

      const result = await this.delegate.findFirst(args);
      return result as TModel | null;
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async findMany(
    where: WhereInput = {},
    options?: QueryOptions & {
      orderBy?: SortParams;
      limit?: number;
      offset?: number;
    },
  ): Promise<TModel[]> {
    try {
      const args: Record<string, unknown> = {
        where: this.addSoftDeleteFilter(where, options),
      };

      if (options?.select) args.select = options.select;
      if (options?.include) args.include = options.include;

      if (options?.orderBy) {
        args.orderBy = { [options.orderBy.field]: options.orderBy.order };
      }

      if (options?.limit) args.take = options.limit;
      if (options?.offset) args.skip = options.offset;

      const results = await this.delegate.findMany(args);
      return results as TModel[];
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async paginate(
    params: PaginationParams,
    where: WhereInput = {},
    options?: QueryOptions & { orderBy?: SortParams },
  ): Promise<PaginatedResult<TModel>> {
    try {
      const limit = Math.min(params.limit ?? 20, MAX_PAGE_LIMIT);

      const findManyArgs: Record<string, unknown> = {
        where: this.addSoftDeleteFilter(where, options),
        take: limit + 1,
      };

      if (params.cursor) {
        findManyArgs.cursor = { id: params.cursor };
        findManyArgs.skip = 1;
      }

      if (options?.select) findManyArgs.select = options.select;
      if (options?.include) findManyArgs.include = options.include;

      if (options?.orderBy) {
        findManyArgs.orderBy = { [options.orderBy.field]: options.orderBy.order };
      } else {
        findManyArgs.orderBy = { createdAt: "desc" };
      }

      const results = (await this.delegate.findMany(findManyArgs)) as TModel[];

      const hasNextPage = results.length > limit;
      const items = hasNextPage ? results.slice(0, limit) : results;
      const lastItem = items[items.length - 1];

      return {
        items,
        pageMeta: {
          hasNextPage,
          nextCursor: lastItem ? (lastItem as Record<string, unknown>).id as string : undefined,
        },
      };
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async create(
    data: TCreateInput,
    audit?: AuditContext,
  ): Promise<TModel> {
    try {
      const args: Record<string, unknown> = {
        data: this.addAuditFields(data as unknown as DataInput, audit, "create"),
      };

      const result = await this.delegate.create(args as Parameters<Delegate["create"]>[0]);
      return result as TModel;
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async update(
    id: string,
    data: TUpdateInput,
    audit?: AuditContext,
  ): Promise<TModel> {
    try {
      const updateData = this.addAuditFields(data as unknown as DataInput, audit, "update");

      const result = await this.delegate.update({
        where: { id },
        data: updateData,
      });

      return result as TModel;
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async restore(id: string, audit?: AuditContext): Promise<TModel> {
    if (!this.supportsSoftDelete) {
      throw new Error(`${this.entityName} does not support soft deletes`);
    }

    try {
      const updateData: DataInput = { deletedAt: null };

      if (audit?.userId && this.supportsAuditFields) {
        updateData.updatedBy = audit.userId;
      }

      const result = await this.delegate.update({
        where: { id } as WhereInput,
        data: updateData,
      });

      return result as TModel;
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async softDelete(id: string, audit?: AuditContext): Promise<TModel> {
    if (!this.supportsSoftDelete) {
      throw new Error(`${this.entityName} does not support soft deletes`);
    }

    try {
      const updateData: DataInput = { deletedAt: new Date() };

      if (audit?.userId && this.supportsAuditFields) {
        updateData.updatedBy = audit.userId;
      }

      const result = await this.delegate.update({
        where: { id } as WhereInput,
        data: updateData,
      });

      return result as TModel;
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async hardDelete(id: string): Promise<void> {
    try {
      await this.delegate.delete({
        where: { id } as WhereInput,
      });
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async exists(
    where: WhereInput,
    options?: QueryOptions,
  ): Promise<boolean> {
    try {
      const count = await this.delegate.count({
        where: this.addSoftDeleteFilter(where, options),
      });

      return count > 0;
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  async count(
    where: WhereInput = {},
    options?: QueryOptions,
  ): Promise<number> {
    try {
      return this.delegate.count({
        where: this.addSoftDeleteFilter(where, options),
      });
    } catch (error: unknown) {
      throw translateError(error);
    }
  }

  protected async getByIdOrThrow(
    id: string,
    options?: QueryOptions,
  ): Promise<TModel> {
    const record = await this.findById(id, options);

    if (!record) {
      throw new NotFoundError(this.entityName, id);
    }

    return record;
  }

  protected buildFindManyArgs(
    where: WhereInput = {},
    options?: QueryOptions & {
      orderBy?: SortParams;
      limit?: number;
      offset?: number;
    },
  ): Record<string, unknown> {
    const args: Record<string, unknown> = {
      where: this.addSoftDeleteFilter(where, options),
    };

    if (options?.select) args.select = options.select;
    if (options?.include) args.include = options.include;
    if (options?.orderBy) {
      args.orderBy = { [options.orderBy.field]: options.orderBy.order };
    }
    if (options?.limit) args.take = options.limit;
    if (options?.offset) args.skip = options.offset;

    return args;
  }
}
