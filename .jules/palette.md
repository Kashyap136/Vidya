
## 2024-05-18 - Allow keyboard focus on internal interactive elements
**Learning:** Found that internal interactive components, like the password visibility toggle in `password-input.tsx`, had `tabIndex={-1}`, which makes them completely inaccessible to keyboard-only and screen reader users. The browser's default focus order should be respected to allow natural keyboard navigation.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements. Ensure that all actionable elements inside custom inputs are reachable via keyboard tab navigation.
