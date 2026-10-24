## 2026-08-09 - Capturing Transient States in Playwright
**Learning:** Next.js Server Actions and standard form submissions can transition very quickly, making it difficult to capture loading states (like spinners) in Playwright tests using simple timeouts.
**Action:** Use Playwright's network interception capabilities (`page.route`) to intentionally delay or pause the backend response. This holds the UI in its loading state indefinitely, allowing for reliable screenshot and video capture.
