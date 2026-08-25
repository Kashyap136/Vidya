## 2026-08-25 - [Optimize Prisma bulk insertions]
**Learning:** When using Prisma's createMany with fields typed as Json, explicitly casting the mapped array property as 'unknown as Prisma.InputJsonValue' is required to satisfy strict TypeScript typings.
**Action:** When updating Prisma operations from create to createMany for optimization and there is a JSON field, ensure type casting is applied.
