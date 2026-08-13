## 2024-02-18 - pnpm lockfile side effects
**Learning:** Running `pnpm install` in this environment generated a 7,000+ line `pnpm-lock.yaml` file, which shouldn't be committed per the instructions.
**Action:** Always check `git status` for unintended lockfile generations after running installation commands and run `git restore --staged pnpm-lock.yaml && rm pnpm-lock.yaml` if it exists.

## 2024-02-18 - Database sequential writes anti-pattern
**Learning:** We found an N+1 query problem with sequential database writes (`create`) inside a for-loop inside `quizService.generate`, which was effectively fixed using `createMany`.
**Action:** Be on the lookout for other services containing loops making sequential DB transactions (like `tx.studyTask.create` in `study-planner.ts`!) for potential quick performance wins.
