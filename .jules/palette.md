## 2024-08-15 - Added UX enhancements to SearchBar
**Learning:** The SearchBar component lacked an accessible way to clear input quickly via the keyboard and the clear button lacked explicit focus states which makes it harder to use for keyboard-only users.
**Action:** Always verify components that feature an internal action (like clearing the input) implement keyboard shortcuts (e.g. Escape) and explicit focus-visible states for inner buttons, as well as type='button' to prevent form submission.
