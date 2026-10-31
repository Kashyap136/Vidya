## 2024-10-24 - Make password toggle accessible
**Learning:** Custom input components (like password visibility toggles) in this app sometimes use `tabIndex={-1}` to prevent focus, which completely breaks keyboard accessibility for screen reader and keyboard-only users.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements of custom inputs. Rely on the browser's default focus order.
