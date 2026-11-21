LifeBridge weekly update page
=============================

Address: https://lifebridgeic.com/admin/

What it does
- Sets the YouTube link for the latest Sunday message (plays on the Visit and Watch pages).
- Switches individual Sundays off when there is no service. The site then says
  "No service Sunday, <date>" and counts down to the next Sunday that is on.
- Pressing Publish saves both to settings.json at the top of the website's files.
  The website reads that file on every page load.

One-time setup (needs whoever manages the GitHub account)
1. The website's files must be in a GitHub repository published with GitHub Pages.
2. On GitHub: Settings > Developer settings > Personal access tokens > Fine-grained tokens.
   Create a token limited to the website's repository, with
   Repository permissions > Contents set to "Read and write". Nothing else.
3. Open /admin/ on the pastor's device and enter the account, repository name,
   branch (usually "main") and the token. The page remembers them on that device.

Good to know
- The token is the lock. Anyone can open /admin/, but nothing can be saved without it.
  It is stored only in the browser of the device where it was entered. "Sign out" removes it.
- Tokens expire on the date chosen when they were created. When that happens the page
  asks for a new one.
- After Publish, the public site catches up within a few minutes.
- If you re-upload the whole website later, keep the existing settings.json
  or the latest message and switched-off Sundays reset.
- If no YouTube link is set, the site plays the newest upload on the channel automatically.
