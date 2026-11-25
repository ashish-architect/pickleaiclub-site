/* Image gallery + lightbox. Requires <div class="lightbox" id="lightbox"> on the page. */
(function () {
  let items = [], idx = 0;
  const lb = () => document.getElementById("lightbox");

  function show(i) {
    idx = (i + items.length) % items.length;
    lb().querySelector("img").src = items[idx];
    lb().classList.add("open");
  }
  function close() { lb().classList.remove("open"); }

  document.addEventListener("DOMContentLoaded", () => {
    const el = lb();
    if (!el) return;
    el.querySelector(".lb-close").onclick = close;
    el.querySelector(".lb-prev").onclick = () => show(idx - 1);
    el.querySelector(".lb-next").onclick = () => show(idx + 1);
    el.addEventListener("click", (e) => { if (e.target === el) close(); });
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  });

  function renderGallery(container, srcs) {
    container.innerHTML = srcs.map((s, i) =>
      `<button data-i="${i}" aria-label="Open image ${i + 1}"><img src="${UI.esc(s)}" alt="" loading="lazy"></button>`).join("");
    container.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => { items = srcs; show(+b.dataset.i); }));
  }

  window.Lightbox = { renderGallery };
})();
