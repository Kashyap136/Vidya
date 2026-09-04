## 2024-05-18 - Remove `tabIndex={-1}` from password toggle
**Learning:** Do not use `tabIndex={-1}` on internal interactive elements (like custom toggles for inputs), as it breaks keyboard navigation for keyboard-only and screen reader users. Use the browser natural tab order instead.
**Action:** Always allow default tab order unless skipping focus is intentionally part of a complex accessibility pattern that manages its own focus state.
