## 2024-10-23 - Remove tabIndex={-1} from password toggle
**Learning:** Using `tabIndex={-1}` on internal interactive elements of custom inputs (like password visibility toggles) breaks keyboard navigation and makes them inaccessible.
**Action:** Do not use `tabIndex={-1}` on interactive elements inside custom inputs; allow default browser focus order.
