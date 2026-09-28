## 2024-05-14 - Optimize streak calculation in study planner

**Learning:** When calculating streaks in a loop that steps back day by day, finding the matching day by iterating through an array of study days (`allDays.find(...)`) causes O(N^2) time complexity. Using string formatting and comparison inside `.find` (e.g. `d.date.toISOString().slice(0, 10) === ...`) makes it even more expensive per day checked.
**Action:** Precompute a fast lookup mechanism, such as mapping completed dates into a `Set` of YYYY-MM-DD string format before the loop, enabling O(1) existence checks.
