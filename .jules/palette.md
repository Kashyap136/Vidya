## 2024-05-14 - Fix keyboard accessibility for password toggle
**Learning:** Never use `tabIndex={-1}` on buttons or internal interactive elements of custom inputs (like a password visibility toggle), as it completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Ensure that the browser's default focus order applies to interactive components and avoid setting `tabIndex={-1}` on buttons unless explicitly managing focus manually.
