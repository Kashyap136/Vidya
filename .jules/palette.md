## 2024-10-18 - Remove tabIndex={-1} from internal interactive elements
**Learning:** Using `tabIndex={-1}` on internal interactive elements of custom inputs (like a password visibility toggle) completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Never use `tabIndex={-1}` on buttons inside custom inputs; allow the browser's default focus order to apply.
