# CLAUDE.md

Single-page officiant invitation for Chris, Traitors (UK) edition. Hosted on GitHub Pages.

## Rules
- No bundlers, no npm build. Pure HTML (`index.html`), modern CSS (`style.css`), vanilla JS (`app.js`).
- Mobile-first, responsive. Test at 375px wide.
- All asset paths are relative (`./assets/...`, `./style.css`, `./app.js`) so the site works under a repo subpath.
- External libraries load from pinned CDN URLs only (canvas-confetti, Google Fonts).
- The passcode is never stored in plain text. `TARGET_HASH` in `app.js` is SHA-256 of the lowercased, trimmed passcode.
- Auth state lives in `sessionStorage` (key `the-turret-unlocked`).
- Look: castle at night. Peat black #1a1412, oxblood #6e1219, candle gold #c9a24a, vellum #ece2cc. IM Fell English (SC for display). Tartan ticker bands between chapters.
- Motion: castle draws on unlock and one turret window lights up; envelope's wax seal breaks on tap; confetti with black hearts on acceptance. Respect `prefers-reduced-motion`.
- The letter text in the `#letter` article is Dasha & Matt's own words. Don't rewrite it.
- Fan homage only: no show logos, artwork or presenter likenesses.

## Editable content
Search `index.html` for `EDIT:` comments and `[bracketed]` placeholders.
