## 2025-02-18 - Avoid O(N^2) Performance Bottleneck in Loops
**Learning:** When iterating over dates (e.g., calculating streaks) and doing array lookups with `.find()` inside the loop, it causes an O(N^2) performance bottleneck.
**Action:** Pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) before the loop to enable O(1) lookups.
