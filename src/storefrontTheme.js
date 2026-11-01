/* SlowRender 2020 — Storefront theme engine.
   Sets the data-st-theme attribute on <html> before first paint so the
   correct stylesheet variant applies without a flash of the wrong theme.
   Chooses between the two user-selectable storefront themes:
     - "modern"   → the new design system (src/storefrontTheme.css)
     - "original" → the legacy Bootstrap / MDB look
   The selection persists in localStorage and can be changed from the
   theme toggle rendered in the top navigation bar (Menu.js). */
(function setTheme(theme) {
    if (!theme) {
        try {
            theme = window.localStorage.getItem('st-theme');
        } catch (e) { /* ignore storage errors (private mode) */ }
    }
    if (theme !== 'modern' && theme !== 'original') {
        theme = 'modern'; // default for the revamped storefront
    }
    document.documentElement.setAttribute('data-st-theme', theme);
    window.__stTheme = theme;
})(window.__stTheme);