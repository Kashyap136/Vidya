## 2026-09-07 - Password toggle keyboard accessibility
**Learning:** Never use `tabIndex={-1}` on buttons or internal interactive elements of custom inputs (like a password visibility toggle). It completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Allow the browser's default focus order to apply to ensure accessibility.
