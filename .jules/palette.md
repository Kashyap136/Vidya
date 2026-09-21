## 2024-05-24 - Do not use tabIndex={-1} on interactive buttons
**Learning:** Adding `tabIndex={-1}` to an internal interactive element like a password visibility toggle button breaks keyboard accessibility. It completely removes the button from the default tab order, making it impossible for keyboard-only and screen reader users to focus on it and access its functionality.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements. Allow the browser's default focus order to apply so that all interactive parts of a component are accessible.
