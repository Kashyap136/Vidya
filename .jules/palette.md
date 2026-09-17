## 2024-05-24 - Do not use negative tabIndex on internal interactive elements
**Learning:** Adding `tabIndex={-1}` to an interactive element (like a password visibility toggle button inside an input wrapper) completely breaks keyboard accessibility by removing it from the document's sequential focus navigation order. This makes the feature impossible to use for keyboard-only and screen reader users.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements. Always let the browser's default focus order apply.
