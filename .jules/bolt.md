## 2024-10-04 - Streak Calculation O(N^2) Bottleneck
**Learning:** Using `.find()` on an array of dates inside a date iteration loop (like computing streaks up to 365 days) causes an O(N^2) performance bottleneck, especially when generating `toISOString()` on every iteration.
**Action:** Pre-compute a `Set` of completed formatted date strings (e.g., `date.toISOString().slice(0, 10)`) before the loop for O(1) lookups.
