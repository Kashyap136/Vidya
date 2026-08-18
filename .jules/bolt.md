## 2024-05-15 - Prisma createMany in nested maps
**Learning:** Replacing a loop of `create` operations with `createMany` inside a Prisma transaction optimizes database interaction. When dealing with JSON types, `options.map` must be typed correctly with `as unknown as Prisma.InputJsonValue` to satisfy TypeScript.
**Action:** Use `createMany` bulk insertions directly via the `tx` Prisma client provided in `$transaction` for mapping non-dependent related entities, and manually mock `createMany` inside the `prisma` and `$transaction` callbacks in tests to prevent failures.
