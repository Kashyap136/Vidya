## 2024-10-05 - Fix keyboard accessibility on custom inputs
**Learning:** Never use `tabIndex={-1}` on internal interactive elements of custom inputs (like a password visibility toggle), as it breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Allow the browser's default focus order to apply.
