## 2024-05-24 - Pre-compute Date Lookups in Loops
**Learning:** When calculating streaks by iterating 365 times over an array of date objects and performing `find` operations with string conversions (`toISOString().slice(0, 10)`) on every iteration, it creates an O(N^2) bottleneck with excessive string allocations.
**Action:** Pre-compute a `Set` of formatted date strings before the loop. This enables O(1) lookups and performs the string allocation only once per item, reducing time complexity from O(n * 365) to O(n + 365).
