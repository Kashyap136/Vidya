## 2024-03-20 - Remove tabIndex={-1} from interactive input elements
**Learning:** Using `tabIndex={-1}` on internal interactive elements (like a password visibility toggle) completely breaks keyboard navigation, making the element inaccessible to keyboard-only and screen reader users.
**Action:** Never use `tabIndex={-1}` on interactive buttons inside inputs; allow the browser's default focus order to apply.
