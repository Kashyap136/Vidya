## 2024-10-26 - [Search Bar Clear Action Accessibility]
**Learning:** [When implementing custom search bars with internal clear buttons, users expect the Escape key to clear the input, and screen readers/keyboard users need explicit `type="button"` to prevent form submission and `focus-visible` styles to navigate to it]
**Action:** [Always add an Escape key listener that conditionally clears the input and stops propagation, and ensure clear buttons have `type="button"` and `focus-visible` styles]
