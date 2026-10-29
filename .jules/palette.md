## 2024-10-30 - Keyboard Accessibility for Input Actions
**Learning:** Using \`tabIndex={-1}\` on internal interactive elements (like password toggles) breaks keyboard accessibility.
**Action:** Never use \`tabIndex={-1}\` on buttons inside custom inputs; rely on the browser's default focus order.
