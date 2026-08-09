## 2026-08-09 - Fix N+1 Query Bottleneck in Generation Pipelines
**Learning:** Sequential `create` queries inside `for` loops within the generation pipelines (such as `quiz.ts` and `extraction-pipeline.ts`) can create massive N+1 bottlenecks when interacting with Prisma, especially inside `$transaction`.
**Action:** Always refactor sequential `create` operations into bulk insertions using `createMany` (e.g. `quizQuestion.createMany`) by mapping the required data to an array. Remember to always update Vitest mock definitions inside `$transaction` when modifying database call signatures.
