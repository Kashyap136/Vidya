## 2024-05-15 - Optimize Streak Calculation (O(N²) to O(1))
**Learning:** In date streak calculations, iterating over days (e.g., 365 loops) and using `.find()` on an array of objects to match stringified ISO dates causes an O(N²) performance bottleneck, particularly noticeable in user stats fetching.
**Action:** When iterating over dates to calculate streaks or contiguous blocks, pre-compute a `Set` of mapped date strings before the loop to enable O(1) membership checks.
