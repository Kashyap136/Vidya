## 2026-08-07 - Custom Button ARIA and Event handling
**Learning:** Custom components with role="button" (like PdfUploadZone) need explicit keydown e.preventDefault() for Space/Enter so page doesn't scroll, plus explicit dynamic tabIndex and aria-disabled mappings.
**Action:** Always verify keyboard event handlers on custom "buttons" include e.preventDefault() and manage focus states.
