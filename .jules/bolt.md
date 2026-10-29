## 2024-05-24 - Pre-compute date sets for O(1) lookups
**Learning:** Iterating over arrays of Date objects and using `.find()` inside the loop (e.g. for calculating streaks) creates an O(N^2) performance bottleneck.
**Action:** Pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) before the loop to enable O(1) lookups.
