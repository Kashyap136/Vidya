## 2023-10-24 - Search Clear and Password Toggle UX Improvements
**Learning:** Internal clear actions need an explicit Escape shortcut and focus-visible UI states for keyboard accessibility, and must have type="button" to avoid form submissions. Password visibility toggles must not use tabIndex={-1} as it breaks keyboard navigation.
**Action:** Always add an Escape key handler that calls e.stopPropagation() on clearable inputs, ensure type="button" with focus-visible classes on internal clear buttons, and avoid tabIndex={-1} on interactive toggles.
