## 2024-10-08 - Search bar accessibility and clear action UX
**Learning:** Search bar clear buttons need `type="button"` to avoid unintended form submissions. Furthermore, providing an 'Escape' key shortcut that safely prevents propagation greatly enhances keyboard UX. Also, interactive internal elements must always explicitly define `focus-visible` classes.
**Action:** Always add `type="button"`, explicit focus states, and Esc shortcuts on clear buttons in custom inputs.
