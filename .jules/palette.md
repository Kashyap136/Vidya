## 2024-10-24 - Password Toggle Keyboard Accessibility
**Learning:** Using tabIndex={-1} on password visibility toggles breaks keyboard navigation for screen reader and keyboard-only users.
**Action:** Always allow default focus order on interactive custom input elements by omitting tabIndex={-1}.
