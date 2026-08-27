
## 2024-05-19 - Keyboard Accessibility for Password Toggles
**Learning:** Adding `tabIndex={-1}` to interactive elements within inputs (like password visibility toggles) completely breaks keyboard navigation, making them inaccessible to keyboard-only and screen reader users.
**Action:** Always allow the browser's default focus order to apply to internal interactive elements of custom inputs. Do not use `tabIndex={-1}` on buttons meant to be interacted with.
