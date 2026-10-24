## 2024-10-24 - [Password Toggle Accessibility]
**Learning:** Using `tabIndex={-1}` on internal interactive elements (like a password visibility toggle) completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Always allow the browser's default focus order to apply for interactive elements inside custom inputs to ensure accessibility.
