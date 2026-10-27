## 2024-10-27 - [Streak Calculation Optimization]
**Learning:** When iterating over dates (e.g., calculating streaks), avoid O(N^2) performance bottlenecks caused by using `.find()` inside loops on arrays of date objects.
**Action:** Instead, pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) before the loop to enable O(1) lookups.
