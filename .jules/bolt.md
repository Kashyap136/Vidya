## 2026-09-30 - Prisma createMany bulk inserts
**Learning:** When inserting multiple database records in AI generation pipelines (e.g., quizzes, study plans), using sequential create operations inside for loops causes Postgres N+1 query bottlenecks. Prisma's createMany provides significant performance improvements by batching the insert.
**Action:** Always use Prisma's createMany bulk insertions instead of sequential create operations inside for loops for multiple record insertions.
