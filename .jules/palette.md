## 2024-05-24 - Password Input Toggle Accessibility
**Learning:** Adding `tabIndex={-1}` to interactive elements (like an eye toggle icon) inside custom inputs completely breaks keyboard navigation for those elements, making them inaccessible to keyboard-only and screen reader users.
**Action:** Always allow the browser's default focus order to apply for interactive elements inside custom components by avoiding `tabIndex={-1}` unless explicitly managing focus manually.
