
## 2024-11-20 - Search Bar Accessibility Enhancements
**Learning:** Internal interactive elements inside custom components (like a clear button in a search bar) often lack basic accessibility attributes like `type="button"` which can cause unexpected form submissions if placed inside a `<form>`. Furthermore, failing to provide explicit keyboard focus styling (`focus-visible:ring-2`) and keyboard shortcuts like `Escape` to clear inputs degrade the experience for keyboard-only users.
**Action:** Always ensure that clear actions for inputs have an explicit `Escape` key listener (`e.stopPropagation()` conditionally) on the input, and ensure the clear button has `type="button"` with `focus-visible` UI states.
