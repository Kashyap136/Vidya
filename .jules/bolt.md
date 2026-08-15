
## 2024-05-24 - Avoid `createMany` when immediate child creation depends on parent ID
**Learning:** When generating nested hierarchical data (e.g. StudyDays containing StudyTasks), using `createMany` for the parents prevents you from easily getting their generated IDs back without doing a subsequent `findMany` query. This extra read query and complexity often outweighs the benefits of batching.
**Action:** When a bulk insert optimization is needed, focus on terminal entities or flat relationships (like QuizQuestions) where the parent ID is already known and returned IDs aren't immediately needed.
