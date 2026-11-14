/* Runs before first paint so a saved theme choice never flashes the wrong colors. */
try {
  var t = localStorage.getItem("theme");
  if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
} catch (e) { /* storage blocked: follow the system theme */ }
