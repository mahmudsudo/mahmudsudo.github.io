# mahmudsudo.github.io

Personal site and resume of Mahmud Bello. Plain HTML and CSS, no build step, no JavaScript.

```
site/
  index.html     the whole site (also the source of resume.pdf via its print stylesheet)
  css/style.css  light and dark themes, print styles
  fonts/         self-hosted EB Garamond and JetBrains Mono
  resume.pdf     generated from index.html, see below
  og.png         social preview image
```

## Preview

```console
$ python3 -m http.server -d site 8080
```

## Update the resume PDF

The PDF is the homepage rendered with its `@media print` styles:

```console
$ npx playwright pdf --paper-format=A4 site/index.html site/resume.pdf
```

## Deploy

`.github/workflows/ci.yml` publishes `site/` to the `gh-pages` branch on every push to `master`.
In the repository settings, Pages should be set to deploy from the `gh-pages` branch.
