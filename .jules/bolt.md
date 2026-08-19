## 2026-08-19 - Use Prisma's createMany for bulk insertions
**Learning:** Sequential `create` operations inside loops can cause N+1 query bottlenecks and degrade backend performance during tasks like quiz generation or study plan creation. When handling related records (e.g., questions in a quiz), we should insert them using Prisma's `createMany`.
**Action:** When inserting multiple database records at once, always construct an array of insertion data and use Prisma's `createMany` instead of a `for` loop of `create` operations.
