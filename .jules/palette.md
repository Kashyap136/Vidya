## 2024-10-15 - Remove tabIndex={-1} from interactive elements
**Learning:** Using `tabIndex={-1}` on buttons or internal interactive elements of custom inputs (like a password visibility toggle) completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Never use `tabIndex={-1}` on interactive elements. Allow the browser's default focus order to apply so that all users can access and interact with the elements.
