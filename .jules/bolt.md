## 2024-05-18 - Optimize streak calculation
**Learning:** Found O(N^2) anti-pattern in `study-planner.ts` streak calculations using `.find()` inside a loop over dates.
**Action:** Replaced with an O(1) `Set.has()` lookup using pre-computed values, ensuring $O(N + 365)$ instead of $O(N \times 365)$.
