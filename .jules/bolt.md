## 2024-11-02 - Optimize streak calculation and stats aggregation
**Learning:** Calculating streak with Array.find() inside a 365-day loop leads to O(N^2) performance. Additionally, using findMany to fetch all records and calculating sums in memory is slower than using Prisma's aggregate.
**Action:** Pre-compute a Set of date strings for O(1) lookups in loops, and use Prisma's aggregate (_sum, _count) with fallbacks (|| 0) to push calculations to the database.
