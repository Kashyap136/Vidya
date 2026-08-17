## 2024-05-24 - Interactive Form Element Accessibility
**Learning:** Adding `tabIndex={-1}` to internal interactive elements of a custom input (like a password visibility toggle) completely breaks keyboard navigation for those elements, making them inaccessible to keyboard-only and screen reader users.
**Action:** Never use `tabIndex={-1}` on buttons or interactive elements that provide functionality to users. Let the browser's default focus order apply.
