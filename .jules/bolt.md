## 2023-10-27 - [Prisma Aggregation vs In-Memory Reduce for Nested Relations]
**Learning:** When calculating totals for nested relations like StudyTasks belonging to StudyDays in a StudyPlan, pulling all records into memory using `findMany` just to `reduce` and `filter` them (e.g. for `totalMinutes` or `completedTasks`) creates an unnecessary memory overhead and N+1 pattern at the application level.
**Action:** Always push the aggregation to the PostgreSQL database using Prisma's `groupBy` and aggregate functions (`_sum`, `_count`) instead of fetching raw rows and counting them in JavaScript.
