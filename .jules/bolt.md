## 2024-12-03 - [Optimize streak calculation by pre-computing Set in loops]
 **Learning:** [When iterating over arrays (e.g. days of the year) and looking up objects by a specific formatted date, doing a `.find()` on an array inside the loop creates an O(N*M) bottleneck. Pre-computing a `Set` of the formatted strings outside the loop enables O(1) lookups.]
 **Action:** [Always verify loop contents for O(N) lookup operations like `.find()`, and replace them with pre-computed Hash Maps or Sets when the lookup key is predictable, particularly for date/string matches.]
