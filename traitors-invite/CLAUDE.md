# CLAUDE.md

Single-page officiant invitation for Chris, Traitors (UK) edition. Hosted on GitHub Pages.

## Rules
- No bundlers, no npm build. Pure HTML (`index.html`), modern CSS (`style.css`), vanilla JS (`app.js`).
- Mobile-first, responsive. Test at 375px wide, portrait and landscape.
- All paths are relative (`./style.css`, `./app.js`) so the site works under a repo subpath.
- External libraries load from pinned CDN URLs only (canvas-confetti, Google Fonts).
- No photographs. All imagery is inline SVG (the night scene, cloaks, candles, wax crest).
- The passcode is never stored in plain text. `TARGET_HASH` in `app.js` is SHA-256 of the lowercased, trimmed passcode.
- Auth state lives in `sessionStorage` (key `the-turret-unlocked`).
- Look: black and violet night (#08060c, #24142f, #6e3f96, lilac #c8b3e0), green cloaks (#2f6a4c), cream letter (#f0e5cb) with a red wax crest (#7a1622). IM Fell English for text, UnifrakturCook blackletter on the letter only.
- No banner strips between sections. Chapters are separated by space, the outlined numeral, and the candle nav in the top bar.
- Shared drawings live as `<symbol>`s in the sprite at the top of `index.html`. Anything inside a symbol is styled through CSS custom properties (`--eye`, `--flame-o`, `--smoke-o`, `--stick`), not selectors.
- Interactions: parallax hero, candles light per chapter, unmask the two Traitors, tap to declassify, three-question assessment, press-and-hold to break the seal, sign (draw or type) and seal. Every interaction has a keyboard path. Respect `prefers-reduced-motion`.
- The letter text in `#letter` is Dasha & Matt's own words. Don't rewrite it.
- Fan homage only: never reproduce the show's logo, hooded emblem, wordmark or artwork. The crest is our own (crossed daggers, D and M).

## Editable content
Search `index.html` for `EDIT:` comments and `[bracketed]` placeholders.
