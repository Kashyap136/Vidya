## 2024-07-28 - Unnecessary Renders in Filter Components
**Learning:** Found a common anti-pattern where a text input component was updating state on every single keystroke. When this state is used to filter a large list synchronously (like `TopicList`), it causes expensive re-computations and janky typing experience.
**Action:** Always check if text inputs triggering list filtering or API calls are debounced. Replace raw `<Input>` components with a debouncing `<SearchBar>` when filtering large data arrays locally.
