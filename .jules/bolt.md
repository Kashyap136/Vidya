## 2026-09-05 - Prisma createMany with JSON fields
**Learning:** When using Prisma's `createMany` with fields typed as `Json` (e.g., `options` in `QuizQuestion`), you may need to explicitly cast the mapped array property `as unknown as Prisma.InputJsonValue` to satisfy strict TypeScript typings, which differs from standard `create` operations.
**Action:** When implementing `createMany` bulk insertions for models containing JSON fields, anticipate the need for explicit type casting (`as unknown as Prisma.InputJsonValue`) to prevent TypeScript errors.
