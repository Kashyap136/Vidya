## 2026-08-31 - Optimize Quiz Generation with createMany
**Learning:** When inserting multiple database records in AI generation pipelines (e.g., quizzes, study plans), sequential `create` operations inside `for` loops can cause N+1 query bottlenecks and performance degradation.
**Action:** Always use Prisma's `createMany` bulk insertions for bulk database inserts. Remember to mock `createMany` correctly in Vitest, especially when using `$transaction`.
