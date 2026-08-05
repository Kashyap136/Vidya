## 2024-08-05 - Optimize Topic Explorer Filtering Anti-pattern
**Learning:** Sequential `.filter()` and `.reduce()` chains inside React `useMemo` hooks create unnecessary intermediate array allocations, adding memory pressure and making operations O(N * number_of_operations) instead of O(N). This anti-pattern is particularly noticeable in dashboard or explorer components dealing with larger lists.
**Action:** Consolidate array iterations into a single `for...of` pass or a single `.filter()` with early returns when dealing with multiple filter criteria or complex aggregations.
