## 2024-10-24 - Accessibility issue pattern specific to password visibility toggle
**Learning:** Never use tabIndex={-1} on buttons or internal interactive elements of custom inputs (like a password visibility toggle), as it completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users. Allow the browser's default focus order to apply.
**Action:** Always allow browser default focus order on interactive elements within custom inputs by omitting tabIndex={-1}.
