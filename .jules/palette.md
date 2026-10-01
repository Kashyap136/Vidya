## 2024-10-24 - [Remove tabIndex={-1} on internal interactive elements]
**Learning:** [Never use tabIndex={-1} on buttons or internal interactive elements of custom inputs (like a password visibility toggle), as it completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.]
**Action:** [Allow the browser's default focus order to apply so that internal interactive elements are reachable via keyboard.]
