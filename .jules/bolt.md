## 2024-05-24 - Avoid O(N^2) Array operations in Date Iteration Loops
**Learning:** Using `.find()` on an array of date objects inside a `for` loop (like calculating a streak over 365 days) causes an unnecessary O(N^2) bottleneck. For collections like `studyDays`, this repeated iteration over the same array is inefficient and scales poorly.
**Action:** Pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) *before* the loop. This enables O(1) lookups during iteration, changing the time complexity from O(N * 365) to O(N + 365).
