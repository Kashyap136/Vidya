## 2024-08-20 - [Prisma Bulk Inserts with TypeScript]
**Learning:** When using Prisma's `createMany` with JSON fields (like `options` array in `quizQuestion`), TypeScript strict mode can fail unless the mapped property is explicitly cast `as unknown as Prisma.InputJsonValue`. Also, we must mock both `create` and `createMany` in testing environments to avoid breaking tests when replacing sequential loops with bulk inserts.
**Action:** Always cast complex mapped objects for JSON fields when using `createMany` and ensure test mocks for the Prisma client are updated symmetrically.
