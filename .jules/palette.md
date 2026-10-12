## 2024-10-12 - Search Bar Accessibility
**Learning:** Interactive components with internal clear actions need an explicit 'Escape' keyboard shortcut and explicit `focus-visible` UI states to be fully accessible.
**Action:** Add `onKeyDown` handlers checking for `e.key === 'Escape'`, `type="button"`, and `focus-visible` Tailwind classes to all custom clear buttons.
