
## 2024-05-18 - [Optimizing Date Lookups in Loops]
**Learning:** [Using `.find()` on an array inside a loop, combined with formatting each item's date (`d.date.toISOString().slice(0, 10)`), results in significant O(N^2) performance degradation, especially when iterating over a year's worth of days (365 iterations multiplied by N array elements).]
**Action:** [Pre-compute a `Set` of formatted date strings (e.g., `date.toISOString().slice(0, 10)`) *before* the loop. This enables O(1) lookups during iteration, replacing the nested loop bottleneck and avoiding redundant object creations.]
