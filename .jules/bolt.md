## 2025-02-09 - O(N^2) Performance Bottleneck in Array Loops
**Learning:** When iterating over dates (e.g., calculating streaks), avoid O(N^2) performance bottlenecks caused by using `.find()` inside loops on arrays of date objects. The `find()` inside a loop over 365 iterations leads to unnecessary CPU overhead.
**Action:** Pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) before the loop to enable O(1) lookups and significantly improve array iteration performance.
