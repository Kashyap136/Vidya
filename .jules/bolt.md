## 2024-05-18 - [Date Iteration Bottleneck]
**Learning:** Using `.find()` inside a loop for arrays of date objects creates an O(N^2) bottleneck, specifically in streak calculations.
**Action:** Pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) before the loop to enable O(1) lookups.
