## 2026-09-15 - [Mitigating N+1 queries in quiz service]
**Learning:** Sequential Prisma `create` calls inside `for` loops cause severe N+1 query bottlenecks in PostgreSQL during AI generation steps where many questions are returned. Prisma's `createMany` expects specific TS casting (e.g. `as unknown as Prisma.InputJsonValue`) for nested jsonb fields in order to satisfy strict TypeScript rules.
**Action:** Always map the data to an array and use `createMany` for bulk insertions, and ensure any related vitest `$transaction` mocks are updated to mock `createMany` accurately.
