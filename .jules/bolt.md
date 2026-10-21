## 2023-10-18 - Optimize O(N^2) Streak Calculation
**Learning:** When iterating over dates (like calculating streaks over 365 days), using an array `.find()` method inside the loop causes an O(N^2) performance bottleneck.
**Action:** Pre-compute a Set of formatted date strings before the loop to enable O(1) lookups, changing the overall time complexity to O(N).
