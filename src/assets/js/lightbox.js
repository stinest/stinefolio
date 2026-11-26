(() => {
  const box = document.getElementById("lightbox");
  if (!box) return;
  const big = box.querySelector("img");
  const count = box.querySelector(".count");
  const imgs = [...document.querySelectorAll(".fit img")];
  let i = 0;
  const largest = (img) => {
    const set = (img.closest("picture")?.querySelector("source[type='image/webp']")?.srcset || img.srcset || "").split(",");
    return (set[set.length - 1] || "").trim().split(" ")[0] || img.currentSrc || img.src;
  };
  const show = (n) => {
    i = (n + imgs.length) % imgs.length;
    big.src = largest(imgs[i]);
    count.textContent = `${i + 1} / ${imgs.length}`;
    box.classList.add("on");
  };
  imgs.forEach((img, n) => img.addEventListener("click", () => show(n)));
  box.addEventListener("click", () => box.classList.remove("on"));
  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("on")) return;
    if (e.key === "Escape") box.classList.remove("on");
    if (e.key === "ArrowRight") show(i + 1);
    if (e.key === "ArrowLeft") show(i - 1);
  });
})();
