## 2023-10-27 - O(N) optimizations with Sets in loop computations
**Learning:** Computing streaks across date arrays inside loops using `Array.prototype.find()` creates an O(N^2) bottleneck. When processing sequences, especially date comparisons, standard nested loop/find behavior isn't optimal.
**Action:** Always pre-compute a `Set` of standard representations (like formatted date strings) before the loop for O(1) lookups, bringing the overall sequence processing time back to O(N).
