(() => {
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  function show() {
    const h = location.hash.slice(1);
    const name = tabs.some((t) => t.dataset.tab === h) ? h : "experience";
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    panels.forEach((p) => (p.hidden = p.dataset.panel !== name));
  }
  tabs.forEach((t) => t.addEventListener("click", (e) => {
    e.preventDefault();
    history.replaceState(null, "", "#" + t.dataset.tab);
    show();
    window.scrollTo(0, 0);
  }));
  window.addEventListener("hashchange", show);
  show();
})();
