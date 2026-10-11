## 2024-05-15 - Password visibility toggle keyboard accessibility
**Learning:** Using tabIndex={-1} on interactive elements like password visibility toggle buttons inside custom inputs completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users.
**Action:** Never use tabIndex={-1} on internal interactive elements of custom inputs. Allow the browser's default focus order to apply.
