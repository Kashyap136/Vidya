## 2024-05-24 - Accessibility of Internal Custom Input Actions
**Learning:** Adding `tabIndex={-1}` to internal actions of custom inputs (like password toggles) completely breaks keyboard navigation for those elements. Internal clear actions (like search bars) need explicit `type="button"` to avoid form submission and must have visible focus states.
**Action:** Never use `tabIndex={-1}` on interactive elements unless explicitly building a custom roving tabindex widget. Always ensure internal buttons have `type="button"` and `focus-visible` styles.
