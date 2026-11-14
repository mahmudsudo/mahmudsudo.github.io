/*
 * Privacy-friendly analytics for mahmudsudo.github.io, powered by GoatCounter.
 * No cookies, no personal data, no consent banner needed.
 *
 * Setup (one minute):
 *   1. Sign up free at https://www.goatcounter.com and pick a site code, e.g. "mahmudsudo".
 *   2. Set CODE below to that code and push. Until you do, this script does nothing.
 *
 * What you get in the dashboard: page views, referrers (where visitors come from),
 * countries, browsers and screen sizes, plus the custom events below.
 * Tip: tag the links you share, e.g. https://mahmudsudo.github.io/?ref=linkedin or ?ref=resume-moniepoint,
 * and the dashboard will show which application or post brought each visit.
 */
(() => {
  const CODE = "mahmudsudo";

  if (!CODE || CODE.startsWith("YOUR_")) return;           // not configured yet
  if (navigator.doNotTrack === "1") return;                // respect Do Not Track
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return; // ignore local previews

  window.goatcounter = { endpoint: `https://${CODE}.goatcounter.com/count` };

  const queue = [];
  const send = (path, title) => {
    const gc = window.goatcounter;
    if (gc && typeof gc.count === "function") gc.count({ path, title, event: true });
    else queue.push([path, title]);
  };

  window.track = send;                                     // used by site.js for custom events

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.onload = () => queue.splice(0).forEach(([p, t]) => send(p, t));
  document.head.appendChild(s);

  /* ---- clicks: outbound links, email, resume download ---- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (href.startsWith("mailto:")) return send("click/email", "Email link");
    if (/\.pdf($|\?)/i.test(href)) return send("click/resume-pdf", "Resume PDF");
    let url;
    try { url = new URL(a.href, location.href); } catch { return; }
    if (url.origin !== location.origin) {
      send("click/" + url.hostname.replace(/^www\./, ""), url.href);
    }
  }, { capture: true });

  /* ---- which sections people actually reach ---- */
  if ("IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting && !seen.has(en.target.id)) {
          seen.add(en.target.id);
          send("view/" + en.target.id, "Section: " + en.target.id);
          io.unobserve(en.target);
        }
      }
    }, { threshold: 0.35 });
    document.querySelectorAll("section[id]").forEach((el) => io.observe(el));
  }

  /* ---- scroll depth ---- */
  const marks = [25, 50, 75, 100];
  const hit = new Set();
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      for (const m of marks) {
        if (pct >= m - 1 && !hit.has(m)) { hit.add(m); send("scroll/" + m, "Scrolled " + m + "%"); }
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
})();
