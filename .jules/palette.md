## 2024-11-01 - Password Input Accessibility Fix
**Learning:** The password visibility toggle in custom inputs was given `tabIndex={-1}`, which breaks keyboard navigation for screen reader users and keyboard-only users who need to verify their password entry.
**Action:** Always allow default browser focus order for inner interactive elements of inputs like visibility toggles. Avoid using `tabIndex={-1}` on interactive buttons.
