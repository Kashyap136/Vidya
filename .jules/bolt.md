## 2024-09-24 - Optimize Streak Calculations Array Search to Set Lookup
**Learning:** In streak calculations, searching an array of dates within a loop can cause an O(N^2) bottleneck, especially when formatting date strings in every iteration (e.g., using `toISOString().slice(0, 10)` in `array.find()`).
**Action:** When calculating streaks by iterating backward through dates, always pre-compute a `Set` of the formatted date strings before the loop to allow for efficient O(1) lookups.
