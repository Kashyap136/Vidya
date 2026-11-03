## 2024-05-18 - [Fix Keyboard Navigation for Password Input]
**Learning:** Using `tabIndex={-1}` on internal interactive elements completely breaks keyboard navigation.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements of custom inputs. Rely on the browser's default focus order.
