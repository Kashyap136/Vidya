## 2026-09-19 - SearchBar clear button focus states
 **Learning:** When adding focus states to interactive `button` elements that act as internal clears for `Input` components, including `focus-visible:ring-offset-2` alongside `focus-visible:ring-2` provides much better visual distinction, particularly when the button overlaps the input border. Additionally, internal clear buttons must specify `type="button"` to prevent submitting surrounding forms.
 **Action:** Always include `focus-visible:ring-offset-2` for internal input buttons and ensure `type="button"` is set.
