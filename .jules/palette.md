## 2024-05-24 - Pre-existing failures
**Learning:** The tests in `extraction-pipeline.test.ts` and lint issues in the repository existed before my changes and are unrelated to my `tabIndex` accessibility fix. Memory states to ignore pre-existing errors.
**Action:** Ignore these test/lint failures and proceed to complete the step.
## 2026-08-26 - Prevent focus loss on custom toggle buttons
**Learning:** The `PasswordInput` component explicitly disabled keyboard navigation on its visibility toggle using `tabIndex={-1}`. This is a common anti-pattern where developers try to streamline form tabbing but inadvertently lock out keyboard and screen reader users from accessing secondary controls like password visibility.
**Action:** Never use `tabIndex={-1}` on interactive toggle elements. Always allow native `button` tab ordering so that all functionality remains accessible to non-mouse users.
