## 2024-05-18 - Accessibility Issue in Password Input
**Learning:** The password visibility toggle in custom inputs (like PasswordInput) used `tabIndex={-1}`, which breaks keyboard navigation and makes the toggle completely inaccessible to keyboard-only and screen reader users.
**Action:** Never use `tabIndex={-1}` on buttons or interactive elements inside inputs. Always allow the browser's default focus order so users can tab to these controls.

## 2024-05-18 - Search Bar Keyboard Accessibility
**Learning:** The SearchBar component lacked a keyboard shortcut (Escape) to quickly clear the input, which is a common and expected interaction pattern for search inputs. Additionally, the clear button inside the search bar did not explicitly specify `type="button"`, which could potentially trigger form submissions if the search bar is ever placed inside a form, and lacked explicit focus-visible states.
**Action:** When implementing custom search bars or inputs with internal clear buttons, always add an Escape key handler (`onKeyDown`) to clear the input, ensure the clear button has `type="button"`, and verify it has proper `focus-visible` UI states for keyboard navigability.
