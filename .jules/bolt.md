## 2024-05-18 - Optimize nested loops and aggregations in Study Planner

**Learning:** When calculating stats like streak by matching dates between a loop and an array, calling array.find() inside a loop is O(N^2) and performs poorly as the dataset grows. Also, calculating aggregates in memory by downloading all records via findMany and then running array.reduce() creates unnecessary memory and latency overhead.

**Action:** 1) For nested loop iterations looking up items in arrays, create a pre-computed Set to allow O(1) lookups, changing O(N^2) to O(N). 2) Push aggregations down to the database using Prisma's `aggregate` feature for sum, count, etc. instead of fetching items into memory.
