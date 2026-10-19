## 2026-10-19 - Removed tabindex=-1 from password toggle button
**Learning:** Using `tabIndex={-1}` on interactive elements within custom inputs (like password visibility toggles) breaks accessibility for keyboard-only and screen reader users by removing them from the sequential focus navigation order.
**Action:** Always allow the browser's default focus order to apply to buttons inside custom inputs, and ensure they have visible focus states (e.g., `focus-visible:ring-1`) for keyboard users.
