## 2026-08-01 - TaskCard Toggle Interactive States
**Learning:** Found that the custom toggle buttons (acting as checkboxes) in list items were missing proper keyboard focus indicators (`focus-visible:ring`), making them difficult to navigate for keyboard users.
**Action:** Always ensure custom interactive elements like icon buttons implement `focus-visible` states explicitly if standard outline styles are removed, and utilize `transition-all scale` for tactile feedback.
