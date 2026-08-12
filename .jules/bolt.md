## 2024-05-24 - Prisma createMany with JSON fields
**Learning:** When using Prisma `createMany` with a `Json` type field (like `options` array in `QuizQuestion`), TypeScript may complain unless it is cast `as unknown as Prisma.InputJsonValue`.
**Action:** Always cast arrays mapped into `Json` fields `as unknown as Prisma.InputJsonValue` when building bulk insert objects.
