## 2025-01-30 - Pushing count and sum aggregations to Prisma database
**Learning:** In Prisma, calculating totals and counts of related records by fetching them into memory using `findMany` and using `reduce`/`filter` array methods is inefficient.
**Action:** Push these calculations to the database using `prisma.model.count` or `prisma.model.groupBy({ _sum: {}, _count: {} })` to reduce memory consumption and data transfer, especially for collections that can grow significantly (like tasks across a study plan).
