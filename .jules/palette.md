## 2026-08-24 - Interactive Form Elements

**Learning:** Internal interactive elements like the show/hide password toggle button within custom inputs must not use `tabIndex={-1}`. This pattern completely breaks keyboard navigation for accessibility, rendering the feature unusable for keyboard-only and screen reader users.
**Action:** Always allow the browser's default focus order to apply for internal buttons or toggles unless explicitly managing complex roving focus patterns, ensuring proper focus indicators are visible.
