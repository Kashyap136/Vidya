## 2024-05-24 - Bulk DB Inserts with Nested Records
**Learning:** When generating `Quiz` with multiple questions in Prisma, using `tx.quizQuestion.create` inside a `for` loop causes an N+1 query problem, slowing down DB insertions. Replacing sequential `.create` with `tx.quizQuestion.createMany` optimizes bulk insertions.
**Action:** Use `tx.model.createMany` instead of looping over `.create` for bulk DB inserts where database-generated IDs for child records aren't needed in intermediate operations.

## 2024-05-24 - Bulk DB Inserts in Study Planner
**Learning:** When using `createMany` for nested hierarchical records (like StudyDays and StudyTasks) where the database-generated ID is required for the child records, changing `create` to `createMany` necessitates an intermediate `findMany` query to retrieve the generated parent IDs. This adds complexity and read operations that can negate the performance benefits of batching.
**Action:** Avoid blindly replacing sequential `create` with `createMany` for nested hierarchical records if database-generated IDs are required for the child records.
