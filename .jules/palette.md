## 2024-10-21 - Remove Negative Tab Index from Internal Interactive Elements
**Learning:** Using `tabIndex={-1}` on internal interactive elements of custom inputs (like a password visibility toggle) completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements. Allow the browser's default focus order to apply so that keyboard users can navigate to and interact with these elements.
