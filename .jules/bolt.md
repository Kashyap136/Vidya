## 2024-05-20 - [Optimize Date O(N^2) loops]
**Learning:** Found O(N^2) bottlenecks when iterating over dates and looking up elements in an array using `.find()` inside the loop with `.toISOString().slice(0, 10)`. This causes excessive string allocations and slows down streak calculations significantly.
**Action:** Pre-compute a `Set` of formatted date strings (e.g. `date.toISOString().slice(0, 10)`) before the loop to enable O(1) lookups.
