## 2023-10-27 - O(1) loop lookups
**Learning:** Found an O(N^2) bottleneck where arrays were being looped 365 times using `.find()` inside the loop to look up a date match.
**Action:** Always pre-compute a `Set` for simple ID or string lookups (like ISO string dates) before looping, transforming inner O(N) array scans into O(1) Set lookups.
