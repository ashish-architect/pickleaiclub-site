/* Renders tournaments of one series into #series-list. Usage: <div id="series-list" data-series="DUPR Nights"> */
(async () => {
  const el = document.getElementById("series-list");
  if (!el) return;
  const series = el.dataset.series;
  const status = el.dataset.status;
  const rows = (await Store.list()).filter((t) =>
    (!series || t.series === series) && (!status || UI.statusOf(t) === status));
  el.innerHTML = rows.map(UI.tournamentCard).join("") ||
    '<div class="empty" style="grid-column:1/-1">No events published yet. <a href="admin.html">Create one</a>.</div>';
  const imgs = rows.flatMap((t) => t.images || []);
  const g = document.getElementById("series-gallery");
  if (g && imgs.length && window.Lightbox) Lightbox.renderGallery(g, imgs);
  else if (g) g.closest("section").classList.add("hidden");
})();
