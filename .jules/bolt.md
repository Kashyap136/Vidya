## 2024-06-25 - [O(N^2) Date Lookup Bottleneck]
**Learning:** Found O(N^2) bottlenecks in streak calculation when doing .find() array searches inside a 365-day loop using .toISOString().slice(0, 10) string matching. This is highly inefficient in large study plans.
**Action:** Always pre-compute a Set of primitive matching keys (e.g. formatted date strings) to reduce lookups to O(1) when iterating over dates.
