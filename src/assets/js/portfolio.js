(() => {
  const filters = document.getElementById("filters");
  const cards = [...document.querySelectorAll("#grid .card")];
  let cat = "all";

  function render() {
    for (const b of filters.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.value === cat));
    cards.forEach((c) => c.classList.toggle("is-hidden", cat !== "all" && c.dataset.cat !== cat));
  }
  function fromHash() {
    const h = location.hash.slice(1);
    cat = h && filters.querySelector(`[data-value="${CSS.escape(h)}"]`) ? h : "all";
  }
  filters.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    cat = b.dataset.value;
    history.replaceState(null, "", cat === "all" ? location.pathname : "#" + cat);
    render();
  });
  window.addEventListener("hashchange", () => { fromHash(); render(); });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause()));
  }, { rootMargin: "100px" });
  document.querySelectorAll("video[data-autoplay]").forEach((v) => io.observe(v));

  fromHash();
  render();
})();
