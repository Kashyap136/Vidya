## 2024-10-25 - Avoid tabIndex={-1} on Custom Input Toggles
**Learning:** Using `tabIndex={-1}` on internal interactive elements of custom inputs (like a password visibility toggle button) completely breaks keyboard navigation for those elements, making them inaccessible to keyboard-only and screen reader users. The browser's default focus order should be allowed to apply.
**Action:** Never use `tabIndex={-1}` on interactive elements that users need to reach via keyboard. Always let buttons remain in the natural tab order.
