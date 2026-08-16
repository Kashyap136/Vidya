## 2024-05-24 - Prisma createMany in AI Generation Pipeline
**Learning:** Found a performance bottleneck where AI-generated quizzes sequentially inserted questions inside a for loop, creating an N+1 database request issue.
**Action:** Replaced sequential `tx.model.create` with `tx.model.createMany` inside the Prisma transaction to perform bulk inserts, significantly improving generation speed. When doing this, Vitest mocks for `$transaction.model.createMany` must also be updated.
