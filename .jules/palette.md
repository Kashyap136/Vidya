## 2024-05-14 - Add ARIA Labels to Syllabus Card Actions
**Learning:** Found an opportunity to improve accessibility on action buttons within the `SyllabusCard` component. The delete button and other actions lacked clear aria-labels for screen readers.
**Action:** Always verify action buttons (especially those containing text that might be visually hidden or icon-only, or even regular buttons performing critical actions) have appropriate `aria-label` attributes to ensure they are properly identified by screen readers, and provide tooltips where appropriate.
