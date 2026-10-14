## 2024-05-14 - Keyboard Accessibility for Custom Input Toggles
**Learning:** Using `tabIndex={-1}` on interactive internal elements of custom inputs (like a password visibility toggle) completely breaks keyboard navigation, making them inaccessible to keyboard-only and screen reader users.
**Action:** Always allow the browser's default focus order to apply to interactive elements inside custom components, and never explicitly set `tabIndex={-1}` on buttons meant to be interacted with.
