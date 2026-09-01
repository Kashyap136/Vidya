
## 2024-05-18 - Database Native Aggregation in Prisma
**Learning:** Sequential `create` vs `createMany` is well known, but similarly, loading entire one-to-many relationship records into memory (e.g. `studyDay.tasks`) just to run `.reduce()` for totals (minutes, count) is a major memory bottleneck. Prisma's `aggregate` and `groupBy` can push this work to Postgres efficiently.
**Action:** When computing sums or counts for collections (e.g., in `getStats` or progress calculations), use Prisma's `groupBy` (e.g., `by: ["isComplete"]`, `_sum`, `_count`) rather than pulling all associated records with `findMany` and reducing in memory.
