## 2024-05-20 - [Resolved N+1 Query in Quiz Topic Performance]
**Learning:** Found an N+1 query bottleneck in `getTopicPerformance` where `findByQuizId` was being called inside a loop over `quizzes`. Also discovered redundant queries in `getQuizWithAttempts` where auth checks were repeated.
**Action:** Always batch related queries using the `in` operator (e.g. `quizId: { in: quizIds }`) instead of fetching data individually inside an iteration block to minimize database load. Avoid calling helper methods that repeat expensive auth checks if ownership is already verified.
