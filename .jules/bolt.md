## 2025-02-12 - Optimize Streak Calculation O(N^2) Bottleneck
**Learning:** Using `.find()` inside a loop over dates and formatting date strings on every iteration creates an O(N*K) bottleneck when calculating streaks.
**Action:** Pre-compute a `Set` of completed date strings before the loop to enable O(1) lookups, changing the complexity to O(N + K).
