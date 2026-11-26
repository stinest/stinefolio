(() => {
  const preview = document.getElementById("preview");
  const rows = [...document.querySelectorAll(".index tr.row")];
  rows.forEach((r) => {
    r.addEventListener("click", (e) => { if (!e.target.closest("a")) location.href = r.querySelector("a").href; });
    r.addEventListener("mouseenter", () => {
      if (!preview || !r.dataset.preview) return;
      preview.src = r.dataset.preview;
      preview.classList.add("on");
    });
    r.addEventListener("mouseleave", () => preview && preview.classList.remove("on"));
  });
  document.addEventListener("mousemove", (e) => {
    if (!preview) return;
    const w = 220, x = e.clientX + 24 + w > innerWidth ? e.clientX - w - 24 : e.clientX + 24;
    preview.style.left = x + "px";
    preview.style.top = Math.min(e.clientY + 16, innerHeight - preview.offsetHeight - 50) + "px";
  });
})();
