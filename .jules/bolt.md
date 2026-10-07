## 2024-10-07 - Optimize streak loop O(N^2) bottleneck
**Learning:** O(N^2) loops with array `.find()` methods for querying matching Date objects can become extremely slow, especially when they depend on iterating through an extended time frame (e.g., 365 days) while inspecting potentially large arrays (e.g. study days in a study planner).
**Action:** Pre-compute a `Set` composed of formatted date strings (e.g. `date.toISOString().slice(0, 10)`) ahead of time to allow for an O(1) hash map lookup inside the iterative loop.
