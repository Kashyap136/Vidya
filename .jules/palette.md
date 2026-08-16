## 2024-08-16 - Search Bar Escape Shortcut and Keyboard Focus
**Learning:** Interactive components with internal clear actions (like search bars) should provide an 'Escape' key shortcut and ensure their clear buttons have visible focus states.
**Action:** When creating custom inputs with clear buttons, implement an `onKeyDown` handler for 'Escape' using `e.stopPropagation()` and apply `focus-visible:ring-2` to the clear button.
