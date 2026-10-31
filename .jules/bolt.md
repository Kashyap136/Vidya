## 2023-11-13 - [Pushing task aggregations to DB to reduce memory usage]
**Learning:** Found a performance bottleneck in Prisma where aggregations like total sum and counts for relational entries in study plans were fetched into application memory utilizing `findMany` followed by nested array `reduce` and `filter`.
**Action:** Push aggregations to the DB using `Prisma.studyTask.aggregate` for operations like summing minutes and getting counts (`_sum`, `_count`). Always provide a fallback value for `_sum` (e.g. `|| 0`) since it can return null.

## 2023-11-13 - [Optimizing streak calculation from O(N^2) to O(N)]
**Learning:** Checking for completed dates to calculate streaks repeatedly used `Array.find` mapped over an array of date objects resulting in O(N^2) behavior.
**Action:** Optimize array traversals inside date loops by pre-computing a `Set` of formatted date strings (e.g. `date.toISOString().slice(0, 10)`), allowing O(1) lookups.
