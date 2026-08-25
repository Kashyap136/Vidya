## 2026-08-25 - Prevent unconditional propagation stop for escape key
**Learning:** When using `e.stopPropagation()` for an 'Escape' key shortcut on an input (like clearing a search bar), always conditionally check if the input actually has a value to clear.
**Action:** When adding escape key handlers to clear inputs, only stop propagation if there is a value (`e.key === 'Escape' && inputValue`), otherwise you might trap the event and prevent parent components (like modals or dialogs) from closing when the user intends to dismiss them.
