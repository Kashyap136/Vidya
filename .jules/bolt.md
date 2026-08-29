## 2026-08-29 - Optimize bulk insertions in AI pipelines
**Learning:** When dealing with generated content that inserts large volumes of rows (like Quiz questions), sequential `tx.model.create()` within a loop causes significant Postgres N+1 query bottlenecks and slows down the transaction.
**Action:** Use Prisma's `tx.model.createMany({ data: [...] })` for flat bulk inserts. In TypeScript strict mode with JSON fields, mapping fields often requires `as unknown as Prisma.InputJsonValue`. Also, when mocking this for tests, ensure `createMany` is added to the respective transaction mock objects.
