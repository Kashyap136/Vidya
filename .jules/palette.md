## 2024-05-15 - Interactive Custom Elements Focus Flow
 **Learning:** Avoid using tabIndex={-1} on internal toggle controls (like password show/hide) because it breaks standard keyboard navigation order and a11y focus states.
 **Action:** Always allow the browser's default DOM focus order to control tabbing inside custom interactive inputs.
