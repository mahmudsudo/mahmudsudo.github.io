/* Small progressive enhancements. The page is fully usable without this file. */
(() => {
  const track = (path, title) => { if (typeof window.track === "function") window.track(path, title); };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---- theme toggle ---- */
  const root = document.documentElement;
  const wrap = $(".bar .wrap");
  if (wrap) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme";
    const isDark = () => root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    const paint = () => {
      btn.textContent = isDark() ? "☀" : "☾";
      btn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
      btn.title = btn.getAttribute("aria-label");
    };
    btn.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      paint();
      track("theme/" + next, "Theme: " + next);
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paint);
    paint();
    wrap.appendChild(btn);
  }

  /* ---- nav highlight for the section in view ---- */
  const links = $$('.bar nav a[href^="#"]');
  if (links.length && "IntersectionObserver" in window) {
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute("aria-current"));
        const a = byId.get(en.target.id);
        if (a) a.setAttribute("aria-current", "true");
      }
    }, { rootMargin: "-35% 0px -60% 0px" });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---- project filter ---- */
  const projects = $("#projects > div");
  const items = $$("[data-cat]", projects || document);
  if (projects && items.length) {
    const groups = [
      ["all", "All"],
      ["systems", "Systems & reliability"],
      ["crypto", "Cryptography"],
      ["agents", "AI agents"],
      ["tools", "Developer tools"],
    ];
    const bar = document.createElement("div");
    bar.className = "filters";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Filter projects by theme");
    const status = document.createElement("p");
    status.className = "filter-status";
    status.setAttribute("role", "status");
    const apply = (key) => {
      let shown = 0;
      items.forEach((el) => {
        const on = key === "all" || el.dataset.cat.split(" ").includes(key);
        el.hidden = !on;
        if (on) shown++;
      });
      const more = $(".more", projects), sub = $(".sub", projects);
      const anyMore = more && $$("li", more).some((li) => !li.hidden);
      if (more) more.hidden = !anyMore;
      if (sub) sub.hidden = !anyMore;
      $$(".chip", bar).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.key === key)));
      status.textContent = `Showing ${shown} project${shown === 1 ? "" : "s"}`;
    };
    groups.forEach(([key, label]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.key = key;
      b.textContent = label;
      b.addEventListener("click", () => { apply(key); if (key !== "all") track("filter/" + key, "Filter: " + label); });
      bar.appendChild(b);
    });
    projects.insertBefore(status, projects.firstChild);
    projects.insertBefore(bar, status.nextSibling);
    apply("all");
  }

  /* ---- copy-to-clipboard install commands ---- */
  $$("[data-install]").forEach((card) => {
    const cmd = card.dataset.install;
    const row = document.createElement("div");
    row.className = "install";
    const code = document.createElement("code");
    code.textContent = cmd;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy command: " + cmd);
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(cmd);
        btn.textContent = "Copied";
        track("copy/" + cmd, "Copied: " + cmd);
      } catch (e) {
        const r = document.createRange(); r.selectNodeContents(code);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        btn.textContent = "Press Ctrl+C";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1800);
    });
    row.append(code, btn);
    const tags = $(".tags", card);
    card.insertBefore(row, tags || null);
  });
})();
