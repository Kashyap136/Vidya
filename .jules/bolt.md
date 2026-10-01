## 2024-05-18 - Streak calculation bottleneck
**Learning:** Found O(N^2) streak calculation bottleneck in `src/services/study-planner.ts` because it iterates up to 365 days and calls `.find()` inside the loop on an array of `Date` objects, doing expensive `.toISOString()` multiple times per element.
**Action:** Use a `Set` of `ISO strings` constructed beforehand, then do O(1) lookups inside the streak calculation loop.
