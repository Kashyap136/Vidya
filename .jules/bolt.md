## 2024-05-18 - Avoid O(N^2) Array Searches in Date Loops
**Learning:** When iterating over long periods (like 365 days) and searching an array of objects inside the loop using `.find()`, it creates an O(N^2) bottleneck.
**Action:** Always pre-compute a `Set` (e.g. mapping `date.toISOString().slice(0,10)`) outside the loop to enable O(1) lookups inside the loop.
