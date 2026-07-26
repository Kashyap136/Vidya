import { prisma } from "@/config/prisma";
import type { Prisma } from "@prisma/client";

type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function transaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  return prisma.$transaction(
    (tx) => fn(tx as unknown as TransactionClient),
    options,
  );
}
