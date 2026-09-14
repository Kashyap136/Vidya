## 2024-09-14 - Search bar accessibility and clear action
**Learning:** Custom interactive components like search bars with internal clear buttons often lack keyboard accessibility. Missing `type="button"` can cause unintended form submissions.
**Action:** When adding or modifying interactive elements with internal clear actions, add an explicit 'Escape' keyboard shortcut using `e.stopPropagation()` to clear the input, ensure the clear button has `type="button"`, and include explicit `focus-visible` UI states.
