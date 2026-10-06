## 2023-10-24 - [Avoid O(N^2) date lookups]
**Learning:** Using `.find()` on an array of dates inside a loop causes an O(N^2) performance bottleneck, especially when iterating over periods like 365 days.
**Action:** Pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) before the loop to enable O(1) lookups.
