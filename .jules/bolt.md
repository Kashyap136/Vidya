## 2024-06-25 - Replace O(N^2) Array Find Loop with Set
**Learning:** When calculating streaks in `src/services/study-planner.ts` over 365 days, using `.find()` inside the loop on an array of dates scales poorly because date operations and array lookups repeat per iteration, establishing an O(N^2) bottleneck.
**Action:** When performing existence checks within loops (especially date iterations), pre-compute a `Set` (e.g. of formatted ISO strings) before the loop to allow for O(1) lookups, effectively reducing the complexity to O(N).
