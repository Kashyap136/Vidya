## 2024-10-10 - Password Toggle Keyboard Accessibility
**Learning:** Using `tabIndex={-1}` on internal interactive elements (like the password visibility toggle) completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Never use `tabIndex={-1}` on buttons or custom inputs' interactive elements; always allow the browser's default focus order to apply.
