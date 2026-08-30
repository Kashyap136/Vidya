## 2026-08-30 - Search Bar Accessibility & UX
**Learning:** Common custom search bar implementations often miss the `type="button"` on the clear button, which can submit forms unexpectedly. They also often lack keyboard shortcuts like Escape to clear the input, and lack proper focus states for the clear button itself.
**Action:** Always check custom input components with internal actions (like clear buttons or password toggles) for `type="button"`, explicit focus-visible styling, and logical keyboard shortcuts like Escape to clear/close.
