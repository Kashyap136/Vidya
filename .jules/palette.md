## 2026-09-16 - Password Input Toggle Accessibility
**Learning:** Adding `tabIndex={-1}` to an interactive element (like a visibility toggle) completely removes it from the natural keyboard navigation order, making it impossible for keyboard-only and screen reader users to access.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements of custom inputs. Allow the browser's default focus order to apply, and style it with `focus-visible` classes.
