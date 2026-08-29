## 2024-05-24 - Avoid negative tabIndex on internal form controls
**Learning:** Using `tabIndex={-1}` on internal interactive elements of custom inputs (like a password visibility toggle) completely breaks keyboard navigation, making them inaccessible to keyboard-only and screen reader users.
**Action:** Allow the browser's default focus order to apply to these elements. Only use negative tabIndex for elements that are explicitly managed via JavaScript focus management (like in complex roving tabindex widgets) or for off-screen elements.
