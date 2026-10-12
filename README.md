# Behind closed doors: officiant invite

A password-gated, single-page invite asking Chris to officiate, themed on The Traitors. Static HTML/CSS/JS, no build step, deploys to GitHub Pages.

## Personalize (launch checklist)

1. **Passcode.** The default is `traitor`. Pick your inside joke, then generate its hash (lowercase it first; the site ignores case and surrounding spaces):
   ```bash
   echo -n 'yourpasscode' | shasum -a 256      # macOS
   echo -n 'yourpasscode' | sha256sum          # Linux
   ```
   Or open the site, open dev tools, and run `getHash('yourpasscode')`.
   Paste the hash into `TARGET_HASH` at the top of `app.js`, and update the hint text in `index.html`.
2. **Story copy.** In `index.html`, replace every `[bracketed]` placeholder and edit the blocks marked `EDIT:`: the hint, the six Round Table guests (keep Dasha and Matt as the two `traitor`s), venue, date and dress code, the three assessment questions, and the rules of the castle. The letter itself is already in.
3. **Deploy.** See below, then test the link on your phone.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Use a local server rather than double-clicking the file: some browsers block the passcode check (Web Crypto) on `file://` pages.

## Deploy to GitHub Pages

```bash
cd officiant-invite
git init
git add .
git commit -m "Officiant invite"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/officiant-invite.git
git push -u origin main
```

Then in the repo on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**
After a minute the site is live at `https://YOUR-USERNAME.github.io/officiant-invite/`.

With the GitHub CLI you can do the repo creation and push in one step:
```bash
gh repo create officiant-invite --public --source=. --push
```

## Testing tips
- To see the gate again after unlocking, close the tab (sessionStorage clears) or run `sessionStorage.clear()` in the console.
- Test on a phone: the press-and-hold seal, the signature pad and the confetti are the moments that matter.
- On Android the hero tilts with the phone; on desktop it follows the mouse.

## A note on privacy
The passcode gate keeps casual visitors out and keeps the passcode itself secret, but it is not real security: the page content is in the HTML source, which anyone with the URL can read. A free GitHub Pages site also requires a public repo. Don't put anything on the page you wouldn't want a stranger to stumble on, and keep the URL between you and Chris. The page includes a `noindex` tag so search engines skip it.
