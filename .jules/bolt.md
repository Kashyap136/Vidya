## 2024-08-07 - Refactoring DB Creation Loops to `createMany`
**Learning:** Sequential inserts inside `for` loops in generation logic (such as generating study plans and quizzes) leads to an N+1 query problem which acts as a major performance bottleneck for a Postgres/Prisma setup.
**Action:** Always favor `createMany` bulk insertions over `for` loops containing individual `create` operations when iterating and saving AI generation payloads or study tasks to the database.
