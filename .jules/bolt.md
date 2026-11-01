
## 2024-11-01 - [Avoid O(N^2) Performance Bottlenecks in Loops]
**Learning:** In streak calculations, using `.find` on an array of dates within a loop causes O(N^2) performance overhead.
**Action:** Always precompute formatted date strings into a `Set` before iterating for an O(1) string lookup time instead.
