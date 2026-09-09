## 2024-05-24 - Accessibility: Password Toggle `tabIndex`
**Learning:** Removing `tabIndex={-1}` from custom interactive elements (like a password visibility toggle) allows them to participate in the natural document tab sequence, restoring accessibility for keyboard-only and screen reader users. The browser's default focus order should generally be preserved.
**Action:** When creating custom inputs with internal interactive elements (like clear buttons or show/hide toggles), never set `tabIndex={-1}`. Ensure they are focusable via keyboard navigation.
