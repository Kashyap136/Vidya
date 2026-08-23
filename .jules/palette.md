## 2024-05-18 - Never disable keyboard focus on interactive inner components
**Learning:** Adding `tabIndex={-1}` to internal interactive elements of custom inputs (like a password visibility toggle) completely breaks keyboard navigation, making them inaccessible to keyboard-only and screen reader users.
**Action:** Always allow the browser's default focus order to apply to inner buttons and interactive elements, ensuring they are reachable via Tab.
