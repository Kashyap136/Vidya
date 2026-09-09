## 2026-09-09 - O(N^2) Array Searches in Date Iterations
 **Learning:** Using `.find()` inside a loop (like a 365-day streak calculation) against an array of dates creates an O(N^2) bottleneck, especially when doing string conversions on every iteration (`date.toISOString().slice(0, 10)`).
 **Action:** Pre-compute a `Set` of the necessary string representations outside the loop to enable O(1) lookups and bring the time complexity down to O(N).
