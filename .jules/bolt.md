## 2024-05-24 - O(N^2) Bottleneck in Streak Calculation
**Learning:** Found an O(N^2) bottleneck in `getTodayContext` and `getStats` inside `src/services/study-planner.ts` where `.find()` was being used inside a 365-day loop against an array of dates, combined with expensive `.toISOString()` operations on each iteration.
**Action:** Always pre-compute string-formatted dates into a `Set` for O(1) lookups when iterating over collections of dates or calculating streaks over time periods to prevent O(N^2) scaling issues.
