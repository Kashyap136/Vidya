## 2024-03-24 - Push Nested Relation Aggregations to Database
**Learning:** In Prisma, calculating sums or counts for collections (like calculating total tasks or minutes for StudyDays in a StudyPlan) by fetching all records via `findMany` and using `.reduce()` in memory is an N+1/data transfer bottleneck.
**Action:** When computing sums or counts for nested relational records (e.g., getting task stats across an entire plan), always push the computation to Postgres using Prisma's `groupBy` and aggregation functions like `_sum` and `_count`.
