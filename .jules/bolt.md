## 2024-05-24 - O(N) Set Lookup for Date Streaks
**Learning:** When calculating streaks over a 365-day loop using `array.find()` to match date strings (e.g., `date.toISOString().slice(0, 10)`), it creates an O(N^2) bottleneck because the date array is traversed and serialized on every loop iteration.
**Action:** Always pre-compute a `Set` of target date strings outside the loop. This reduces the check inside the loop to a simple, O(1) `.has()` lookup, significantly dropping time complexity to O(N + 365).
