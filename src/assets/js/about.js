(() => {
  const items = [...document.querySelectorAll(".interest")];

  function fit(item) {
    const box = item.querySelector(".blurb");
    const fill = item.querySelector(".fill");
    if (!box || !box.clientHeight) return;
    let lo = 5, hi = 20;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      fill.style.fontSize = mid + "px";
      fill.scrollHeight <= box.clientHeight && fill.scrollWidth <= box.clientWidth ? (lo = mid) : (hi = mid);
    }
    fill.style.fontSize = lo + "px";
  }
  const fitAll = () => items.forEach(fit);

  items.forEach((item) => {
    item.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") item.classList.add("open"); });
    item.addEventListener("click", () => item.classList.toggle("open"));
    item.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); item.classList.toggle("open"); } });
  });

  addEventListener("resize", fitAll);
  document.fonts?.ready.then(fitAll);
  addEventListener("load", fitAll);
  fitAll();
})();
