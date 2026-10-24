## 2024-10-25 - Study Planner Optimization
**Learning:** Using Prisma's aggregate for aggregations and pre-computing Sets for O(1) date lookups avoids O(N^2) CPU overhead and excessive data transfer.
**Action:** Always use Set for date lookup loops and DB aggregations for totals instead of fetching and mapping arrays.
