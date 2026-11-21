LifeBridge website update page
==============================

Address: https://lifebridgeic.com/admin/

What it does
- Sets the YouTube link for the latest Sunday message (plays on the Visit and Watch pages).
- Sets each upcoming week: as usual (Sunday 10:00 AM), a different day or start time
  that week, or no service. The site's countdown, dates and "See you ..." line follow.
- Adds an optional note for visitors on any week, limited to 90 characters.
- Under "Site details" (rarely needed): the welcome video, the usual service time,
  the address and map links, the weekly email link, and the giving details.
  The photos and walking directions on the Visit and Sundays pages describe the
  current building and do not change from this page.
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
- settings.json is created by the first Publish and is not part of the website's
  own files, so re-uploading the website does not reset it. Do not delete it.
- Some streams cannot be played outside YouTube because of music rights. The site
  detects this and offers a "Watch on YouTube" button instead.
- If no YouTube link is set, the site plays the newest upload on the channel automatically.

Contact form and LifeGroup sign-up
- Both forms email pastor@lifebridgeic.com through FormSubmit (formsubmit.co), a free
  form-to-email service. No account is needed.
- One-time activation: the first message sent from the live site makes FormSubmit email
  that inbox a link. Until the pastor clicks it, messages are not delivered.
- The receiving address can be changed under Site details > Messages from the website.
  A new address needs the same one-time activation.
