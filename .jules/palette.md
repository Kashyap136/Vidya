## 2024-03-24 - Task Toggle A11y & Feedback
**Learning:** Icon-only toggle buttons (like tasks) often miss visual focus states for keyboard users and lack immediate feedback during async updates, leading to poor perceived performance and accessibility.
**Action:** Always include keyboard focus styles (`focus-visible`) on custom interactive elements and ensure async toggles show an inline loading state to replace the icon during transition.
