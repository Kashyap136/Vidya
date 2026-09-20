## 2024-05-23 - O(1) Pre-computed Lookups Inside Loops
**Learning:** Found O(N^2) `.find()` performance bottleneck in streak calculation where an array of objects was searched inside a large loop (365 iterations), generating `.toISOString()` on each comparison.
**Action:** Always pre-compute string lookups into a `Set` outside the loop to enable O(1) `.has()` checks and significantly decrease redundant object serialization overhead.
