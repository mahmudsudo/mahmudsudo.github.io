# mahmudsudo.github.io

Personal site and resume of Mahmud Bello. Plain HTML and CSS, no build step, no JavaScript.

```
site/
  index.html     the whole site (also the source of resume.pdf via its print stylesheet)
  css/style.css  light and dark themes, print styles
  fonts/         self-hosted EB Garamond and JetBrains Mono
  js/            theme toggle, project filter, copy buttons, analytics (all optional enhancements)
  resume.pdf     generated from index.html with `npm run resume`
  og.png         social preview image
```

## Preview

```console
$ python3 -m http.server -d site 8080
```

## Update the resume PDF

`site/resume.pdf` is the homepage rendered with its `@media print` styles, so it always matches the website.
After changing `site/index.html` or `site/css/style.css`, regenerate it:

```console
$ npm install                      # first time only
$ npx playwright install chromium  # first time only
$ npm run resume
```

Commit the new `site/resume.pdf` together with the change.

## Analytics

`site/js/analytics.js` sends page views and a few interaction events (outbound clicks, email, resume
download, section views, scroll depth) to [GoatCounter](https://www.goatcounter.com): no cookies, no personal data,
no consent banner. Set `CODE` at the top of that file to your GoatCounter site code to switch it on. It stays
off on localhost and for visitors with Do Not Track enabled. Tag shared links like `/?ref=linkedin` to see which
post or application brought each visit.

## Deploy

`.github/workflows/static.yml` publishes `site/` with GitHub Pages on every push to `main`, after checking that
every local link and asset in the HTML files exists. In the repository settings, Pages should use
**Source: GitHub Actions**.
