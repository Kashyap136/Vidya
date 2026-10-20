## 2024-10-20 - Bolt initialized
**Learning:** Initializing bolt journal
**Action:** Use this file to record critical codebase learnings.

## 2024-10-20 - O(1) Set Optimization for Loop Array Searching
**Learning:** Pre-computing a `Set` of formatted date strings before iterating over an array of dates inside a loop prevents O(N^2) performance bottlenecks compared to using `.find()` inside the loop, especially for common tasks like streak calculation across 365 days.
**Action:** Always pre-compute and store frequently queried data representations (like ISO date strings) into `Set`s or maps before entering large or nested loops for O(1) lookup.
