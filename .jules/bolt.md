## 2024-10-13 - Streak Calculation Loop Optimization
**Learning:** Found O(N^2) bottlenecks when calculating user streaks via nested Date loops up to 365 days iterating and using `.find` per iteration checking `.toISOString().slice(0, 10)` string matching in an O(N) manner.
**Action:** Always pre-compute string-formatted dates into a `Set` for O(1) lookups before executing logic that queries or iterates repeatedly over large Date collections.
