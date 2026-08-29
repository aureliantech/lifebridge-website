# LifeBridge International Church — website

Static site. No build step, no dependencies. Every page is a single self-contained HTML file
with fonts and images embedded, so it works offline and from any host.

## Structure

```
/                index.html            homepage
/visit           visit/index.html      plan your visit
/sundays         sundays/index.html    times, parking, what a Sunday includes
/kids            kids/index.html       BridgeKids
/community       community/index.html  LifeGroups, serving, next steps
/about           about/index.html      story, beliefs, leadership
/watch           watch/index.html      latest message
/new-to-panama   new-to-panama/        SEO guide for new arrivals
/es              es/index.html         Spanish landing page
/give            give/index.html       giving methods
/contact         contact/index.html    contact routing
404.html         not-found page
sitemap.xml      robots.txt  .nojekyll  favicon.jpg
```

## Push to GitHub

```bash
cd lifebridge-website
git init
git add .
git commit -m "New LifeBridge website"
git branch -M main
git remote add origin https://github.com/aureliantech/lifebridge-website.git
git push -u origin main
```

Create the empty repo on GitHub first (no README, no .gitignore), or with the CLI:

```bash
gh repo create aureliantech/lifebridge-website --public --source=. --remote=origin --push
```

## Publish with GitHub Pages

Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / root → Save.

Links are root-relative (`/visit`), so the site must be served from a domain root.
That means a custom domain, or a repo named `<user>.github.io`. If you publish to
`username.github.io/lifebridge-website`, every internal link will 404.

### Custom domain

1. Add a file named `CNAME` in this folder containing one line: `lifebridgeic.com`
2. At your DNS provider, point the apex record at GitHub Pages:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Add a CNAME record for `www` → `<user>.github.io`
4. Settings → Pages → Custom domain → enter the domain → tick "Enforce HTTPS"

Netlify or Cloudflare Pages also work with zero config — drag the folder in.

## Before launch

- Replace the Google Maps links (`maps.google.com/?q=World+Trade+Center+Panama`) with the
  Google Business Profile pin URL, on every page.
- Set up 301 redirects from the old WordPress URLs.
- Fill in the items flagged in amber "To confirm before launch" boxes, then delete those boxes.
- Swap the YouTube video ID on `/watch` and `/visit` when a newer message should lead.
- Have a native Panamanian Spanish speaker read `/es`.
- Confirm parental photo consent for images showing identifiable children.

## Editing

Open the HTML file and edit the text directly. Images and fonts are base64-embedded in each
file; to replace a photo, swap the `src="data:image/jpeg;base64,..."` string.
