# Mazi Prima Reza — Portfolio

A soft-pink, journal-style personal portfolio. Built with **React** (no build step — React + Babel run straight in the browser), so you can host it on **GitHub Pages** by just pushing the files.

## Pages
- **Home** (`#/`) — hero + intro
- **About** (`#/about`) — bio + journey timeline + skills
- **Projects** (`#/projects`) — filterable project cards
- **Contact** (`#/contact`) — social links

Navigation uses hash routing (`#/about`, `#/projects`…) so deep links work on GitHub Pages with no server config.

## File structure
```
index.html        ← entry point (loads React + the scripts below)
src/
  styles.css      ← design tokens, nav, footer, buttons
  pages.css       ← page-specific styles
  components.jsx  ← Nav, Footer, content data (projects, timeline, contacts)
  pages.jsx       ← Home / About / Projects / Contact
  app.jsx         ← hash router + mount
```

## ✏️ Editing your content
All your text lives in **`src/components.jsx`** near the top:
- `TIMELINE` — your experience entries
- `SKILLS` — the skill chips
- `PROJECTS` — each project's title, description, image, tags & links
- `CONTACTS` — your social links

## 🖼️ Adding your photo
The hero & about pages look for `assets/image/profile.jpg`. Until that file exists you'll see a friendly "your photo goes here" placeholder.
1. Create a folder `assets/image/`
2. Drop in your photo named `profile.jpg`
3. Done — it appears automatically.

(You can change the path in `src/pages.jsx`, search for `profile.jpg`.)

---

## 🚀 Deploy to GitHub Pages — step by step

### Option A — your main personal site (`yourname.github.io`)
1. On GitHub, click **New repository**.
2. Name it **exactly** `yourusername.github.io` (replace with your real username).
3. Set it to **Public**, then **Create repository**.
4. Upload these files — either drag-and-drop in the browser ("uploading an existing file"), or with git:
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/yourusername/yourusername.github.io.git
   git push -u origin main
   ```
5. Wait ~1 minute, then visit **https://yourusername.github.io** 🎉

### Option B — a named project repo (e.g. `portfolio`)
1. Create a repo called `portfolio` (Public).
2. Push the files (same git commands as above, with the `portfolio` repo URL).
3. Go to the repo's **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Branch: **main**, folder: **/ (root)**. Click **Save**.
6. After a minute your site is live at **https://yourusername.github.io/portfolio/** 🎉

> Important: keep `index.html` at the repository **root** (not inside a folder), and keep the `src/` folder next to it.

### Updating later
Edit the files, then:
```bash
git add .
git commit -m "Update content"
git push
```
GitHub Pages redeploys automatically in about a minute.

---

## Notes
- Project thumbnail images currently point to the original site's public URLs. To make the repo fully self-contained, download those images into `assets/image/` and update the `img` paths in `src/components.jsx`.
- The chatbot from the original site was intentionally left out — easy to add later.
- No `package.json` / npm install needed. It's pure static files.
