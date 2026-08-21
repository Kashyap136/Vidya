## 2024-05-24 - Prisma createMany with JSON mapping inside tx

**Learning:** When using Prisma's `createMany` inside a custom `$transaction` wrapper (like `prisma.$transaction(async tx => {})`) where properties are typed as `Json` (e.g., `options` array in `QuizQuestion`), you must cast the mapped property `as unknown as Prisma.InputJsonValue` to satisfy strict TS rules. Furthermore, Vitest mocks for `$transaction` must explicitly include the `.createMany` mock (e.g., `quizQuestion: { create: ..., createMany: ... }`) otherwise the transaction callback will throw when it tries to invoke the unmocked method.

**Action:** Always check the Vitest transaction mock implementation when replacing `create` with `createMany` to ensure the new method is exposed in the fake `tx` object passed to the callback.
