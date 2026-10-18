## 2024-10-18 - Avoid O(N^2) Performance Bottlenecks in Date Iterations
**Learning:** Iterating over dates to calculate streaks and using an array `.find()` method inside the loop causes an O(N^2) performance bottleneck. In this codebase, finding completed dates inside a 365-day loop using `.find()` on an array of objects resulted in repetitive iterations.
**Action:** Always pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) before iterating over dates to enable O(1) lookups and significantly reduce computation time.
