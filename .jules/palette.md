## 2024-05-14 - Remove tabIndex={-1} from interactive elements in custom inputs
**Learning:** Adding `tabIndex={-1}` to interactive elements like a password visibility toggle button completely breaks keyboard navigation and makes them inaccessible to keyboard-only and screen reader users. The browser's default focus order should be allowed to apply.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements of custom inputs. Ensure focus order is natural and accessible.
