## 2024-05-18 - [Fix Keyboard Navigation for Password Input]
**Learning:** Using `tabIndex={-1}` on internal interactive elements completely breaks keyboard navigation.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements of custom inputs. Rely on the browser's default focus order.
## 2024-11-06 - [Keyboard Accessibility & Form Safety for Custom Search Inputs]
**Learning:** Custom search inputs need explicit keyboard support (Escape to clear) and their internal clear buttons MUST have `type="button"` to prevent accidental form submissions, along with explicit `focus-visible` states for keyboard users.
**Action:** Always verify custom search inputs have Escape-to-clear functionality, explicit button types on clear actions, and proper focus states.
