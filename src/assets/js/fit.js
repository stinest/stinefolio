(() => {
  const g = document.querySelector(".fit");
  if (!g) return;
  const items = [...g.children];
  const GAP = 12;
  const ratio = (el) => {
    const v = el.tagName === "VIDEO" ? el : null;
    if (v) return v.videoWidth ? v.videoWidth / v.videoHeight : 0.8;
    const img = el.querySelector("img") || el;
    const w = +img.getAttribute("width") || img.naturalWidth, h = +img.getAttribute("height") || img.naturalHeight;
    return w && h ? w / h : 0.8;
  };
  function layout() {
    const media = items.map((el) => el.tagName === "VIDEO" ? el : el.querySelector("img") || el);
    if (innerWidth < 760) { media.forEach((m) => { m.style.height = ""; m.style.width = "100%"; }); return; }
    const ratios = items.map(ratio);
    const W = g.clientWidth;
    const footer = document.querySelector(".site-footer").offsetHeight;
    const H = Math.max(320, innerHeight - g.getBoundingClientRect().top - footer - 40);
    const fits = (h) => {
      let rows = 1, x = 0;
      for (const r of ratios) {
        const w = r * h;
        if (w > W) return false;
        if (x > 0 && x + GAP + w > W) { rows++; x = w; } else x += (x > 0 ? GAP : 0) + w;
      }
      return rows * h + (rows - 1) * GAP <= H;
    };
    let lo = 40, hi = H;
    for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; fits(mid) ? (lo = mid) : (hi = mid); }
    media.forEach((m, i) => { m.style.height = Math.floor(lo) + "px"; m.style.width = Math.floor(ratios[i] * lo) + "px"; });
  }
  addEventListener("resize", layout);
  g.querySelectorAll("video").forEach((v) => v.addEventListener("loadedmetadata", layout));
  document.fonts?.ready.then(layout);
  layout();
})();
