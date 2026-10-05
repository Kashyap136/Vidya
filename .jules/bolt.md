## 2024-10-05 - O(N^2) bottlenecks in Date arrays
**Learning:** Using `.find()` with `.toISOString()` inside loops on arrays of Date objects (e.g., when calculating streaks) creates a significant O(N^2) bottleneck. The `.toISOString()` conversion is relatively expensive when repeated N times in a loop over dates.
**Action:** Always pre-compute a `Set` of formatted date strings before the loop. This enables O(1) lookups and significantly speeds up iterations over date ranges in streak or calendar calculations.
