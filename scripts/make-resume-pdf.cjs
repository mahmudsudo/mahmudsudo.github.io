#!/usr/bin/env node
/*
 * Builds site/resume.pdf from the live site/index.html using its @media print styles,
 * so the PDF always matches the website. Run:  npm run resume
 *
 * It serves site/ on a temporary local port (the page uses root-relative URLs, so opening the
 * file directly would lose the CSS and fonts), prints it with headless Chromium, and exits.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright is not installed. Run:  npm install && npx playwright install chromium");
  process.exit(1);
}

const root = path.resolve(__dirname, "..", "site");
const out = path.join(root, "resume.pdf");
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".pdf": "application/pdf",
  ".txt": "text/plain", ".xml": "application/xml",
};

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(root, rel.endsWith("/") ? rel + "index.html" : rel);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" }).end(data);
  });
});

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  try {
    const page = await (await browser.newContext({ colorScheme: "light" })).newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log("Wrote " + path.relative(process.cwd(), out));
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
