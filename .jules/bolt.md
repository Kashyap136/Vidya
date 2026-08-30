## 2024-05-24 - Prisma createMany with JSON fields
**Learning:** When replacing sequential `tx.model.create` with `tx.model.createMany` in Prisma, any fields typed as `Json` (e.g. `options` in `QuizQuestion`) might cause strict TypeScript errors if assigned directly from an array of objects.
**Action:** When using `createMany` with JSON fields, explicitly cast the mapped array property `as unknown as Prisma.InputJsonValue` to satisfy Prisma's strict typings.
