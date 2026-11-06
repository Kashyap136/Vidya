## 2024-05-18 - [Fix Keyboard Navigation for Password Input]
**Learning:** Using `tabIndex={-1}` on internal interactive elements completely breaks keyboard navigation.
**Action:** Never use `tabIndex={-1}` on buttons or internal interactive elements of custom inputs. Rely on the browser's default focus order.
## 2024-05-18 - Search Bar Clear Button Accessibility
**Learning:** Clear buttons within interactive components (like search bars) need explicit visual states (`focus-visible:ring-2`) and keyboard shortcuts (`Escape`) to remain accessible, especially when the clear action is nested within an input. Without keyboard support, users relying on keyboard navigation have a harder time clearing text efficiently.
**Action:** Always add keyboard handlers (like `Escape` for clearing) and visual focus states to interactive utility buttons (like clear/close buttons) inside complex inputs.
