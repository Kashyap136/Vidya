## 2024-10-31 - [Keyboard Accessibility]
**Learning:** Using `tabIndex={-1}` on internal interactive elements of custom inputs (like password toggles) completely breaks keyboard navigation for screen reader and keyboard users.
**Action:** Rely on the browser's default focus order and never disable tabbing on actionable buttons.
