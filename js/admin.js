/* Create / edit tournaments with image + video uploads (saved to IndexedDB). */
(function () {
  const form = document.getElementById("form");
  const $ = (id) => document.getElementById(id);
  const esc = UI.esc;

  let editingId = null;
  let media = { cover: null, images: [], videos: [] };

  /* ---------- repeatable rows ---------- */
  const ROWS = {
    schedule: { fields: [["time", "Time / Day"], ["item", "What happens"]] },
    results: { fields: [["category", "Category"], ["winner", "Winner"], ["runnerUp", "Runner-up"], ["third", "Third (optional)"]] },
    stats: { fields: [["label", "Label (e.g. Teams)"], ["value", "Value (e.g. 12)"]] }
  };
  function addRow(kind, data = {}) {
    const row = document.createElement("div");
    row.className = "repeat-row";
    row.style.gridTemplateColumns = `repeat(${ROWS[kind].fields.length}, 1fr) auto`;
    row.innerHTML = ROWS[kind].fields.map(([k, ph]) =>
      `<input data-k="${k}" placeholder="${ph}" value="${esc(data[k] || "")}">`).join("") +
      `<button type="button" class="btn btn--sm btn--danger" aria-label="Remove">×</button>`;
    row.querySelector("button").onclick = () => row.remove();
    $(kind).appendChild(row);
  }
  function readRows(kind) {
    return [...$(kind).children].map((row) => {
      const o = {};
      row.querySelectorAll("input").forEach((i) => { if (i.value.trim()) o[i.dataset.k] = i.value.trim(); });
      return o;
    }).filter((o) => Object.keys(o).length);
  }
  document.querySelectorAll("[data-add]").forEach((b) => (b.onclick = () => addRow(b.dataset.add)));

  /* ---------- media ---------- */
  const MAX_MB = { cover: 10, images: 10, videos: 200 };
  function fileToItem(f) { return { name: f.name, type: f.type, blob: f }; }

  function renderThumbs() {
    const thumb = (m, kind, i) => {
      const src = Store.mediaUrl(m);
      const isVid = Store.isVideoItem(m);
      const yt = typeof m === "string" && UI.youtubeId(m);
      const inner = yt ? `<img src="https://img.youtube.com/vi/${yt}/mqdefault.jpg" alt="">`
        : isVid ? `<video src="${esc(src)}" muted preload="metadata"></video>`
        : `<img src="${esc(src)}" alt="">`;
      return `<div class="thumb" title="${esc(typeof m === "string" ? m : m.name)}">${inner}
        <button type="button" data-kind="${kind}" data-i="${i}" aria-label="Remove">×</button></div>`;
    };
    $("cover-thumbs").innerHTML = media.cover ? thumb(media.cover, "cover", 0) : "";
    $("images-thumbs").innerHTML = media.images.map((m, i) => thumb(m, "images", i)).join("");
    $("videos-thumbs").innerHTML = media.videos.map((m, i) => thumb(m, "videos", i)).join("");
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".thumb button");
    if (!b) return;
    const { kind, i } = b.dataset;
    if (kind === "cover") media.cover = null; else media[kind].splice(+i, 1);
    renderThumbs();
  });

  function acceptFiles(kind, files) {
    const wantVideo = kind === "videos";
    const errs = [];
    [...files].forEach((f) => {
      const ok = wantVideo ? f.type.startsWith("video/") : f.type.startsWith("image/");
      if (!ok) return errs.push(`${f.name}: wrong file type`);
      if (f.size > MAX_MB[kind] * 1024 * 1024) return errs.push(`${f.name}: larger than ${MAX_MB[kind]} MB`);
      if (kind === "cover") media.cover = fileToItem(f); else media[kind].push(fileToItem(f));
    });
    if (errs.length) flash(errs.join("<br>"), true);
    renderThumbs();
  }

  document.querySelectorAll("[data-drop]").forEach((zone) => {
    const input = zone.querySelector("input");
    const kind = zone.dataset.drop;
    zone.onclick = () => input.click();
    input.onchange = () => { acceptFiles(kind, input.files); input.value = ""; };
    zone.ondragover = (e) => { e.preventDefault(); zone.classList.add("drag"); };
    zone.ondragleave = () => zone.classList.remove("drag");
    zone.ondrop = (e) => { e.preventDefault(); zone.classList.remove("drag"); acceptFiles(kind, e.dataTransfer.files); };
  });
  $("add-image-url").onclick = () => {
    const v = $("image-url").value.trim();
    if (v) { media.images.push(v); $("image-url").value = ""; renderThumbs(); }
  };
  $("add-video-url").onclick = () => {
    const v = $("video-url").value.trim();
    if (v) { media.videos.push(v); $("video-url").value = ""; renderThumbs(); }
  };

  /* ---------- load / save ---------- */
  const LIST_FIELDS = ["categories", "rules", "partners"];
  function fill(t) {
    form.reset();
    ["schedule", "results", "stats"].forEach((k) => ($(k).innerHTML = ""));
    for (const el of form.elements) {
      if (!el.name || !(el.name in t)) continue;
      el.value = LIST_FIELDS.includes(el.name) ? (t[el.name] || []).join("\n") : t[el.name] ?? "";
    }
    (t.schedule || []).forEach((r) => addRow("schedule", r));
    (t.results || []).forEach((r) => addRow("results", r));
    (t.stats || []).forEach((r) => addRow("stats", r));
    media = { cover: t.coverImage || null, images: [...(t.images || [])], videos: [...(t.videos || [])] };
    renderThumbs();
  }

  function flash(html, isErr) {
    $("msg").innerHTML = `<div class="notice ${isErr ? "" : "notice--ok"}" style="${isErr ? "background:#fdecec;border-color:#f5c2c2" : ""}">${html}</div>`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form));
    if (d.endDate && d.endDate < d.startDate) return flash("The end date can't be before the start date.", true);

    const t = {};
    for (const [k, v] of Object.entries(d)) {
      const val = String(v).trim();
      if (!val) continue;
      t[k] = LIST_FIELDS.includes(k) ? val.split("\n").map((s) => s.trim()).filter(Boolean) : val;
    }
    t.schedule = readRows("schedule");
    t.results = readRows("results");
    t.stats = readRows("stats");
    t.coverImage = media.cover || undefined;
    t.images = media.images;
    t.videos = media.videos;

    if (editingId) t.id = editingId;
    else {
      const taken = new Set([...(window.TOURNAMENTS || []).map((x) => x.id), ...(await Store.drafts.all()).map((x) => x.id)]);
      let base = Store.slugify(`${t.name} ${t.startDate.slice(0, 4)}`), id = base, n = 2;
      while (taken.has(id)) id = `${base}-${n++}`;
      t.id = id;
    }
    t.updatedAt = new Date().toISOString();

    try {
      await Store.drafts.put(t);
    } catch (err) {
      return flash("Couldn't save: " + esc(err.message || err) + ". The browser storage may be full, so try fewer or smaller videos.", true);
    }
    editingId = t.id;
    history.replaceState(null, "", `?edit=${encodeURIComponent(t.id)}`);
    $("page-title").textContent = "Edit Tournament";
    flash(`Saved ✓ <a href="tournament.html?id=${encodeURIComponent(t.id)}" target="_blank">Preview the tournament page →</a>`);
    renderDrafts();
  });

  $("reset").onclick = () => {
    editingId = null;
    history.replaceState(null, "", "admin.html");
    $("page-title").textContent = "Create Tournament";
    fill({});
    $("msg").innerHTML = "";
  };

  async function renderDrafts() {
    const list = (await Store.drafts.all()).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    $("drafts").innerHTML = list.length ? list.map((t) => `
      <div class="row">
        <div><b>${esc(t.name)}</b><br><small style="color:var(--muted)">${UI.fmtDate(t.startDate)} · ${(t.images || []).length} photos · ${(t.videos || []).length} videos</small></div>
        <div style="display:flex;gap:.3rem">
          <a class="btn btn--sm btn--blue" href="tournament.html?id=${encodeURIComponent(t.id)}" target="_blank">View</a>
          <button class="btn btn--sm btn--ghost" style="color:var(--navy)" data-edit="${esc(t.id)}">Edit</button>
          <button class="btn btn--sm btn--danger" data-del="${esc(t.id)}" aria-label="Delete">×</button>
        </div>
      </div>`).join("") : '<p style="color:var(--muted)">No drafts yet.</p>';
  }
  $("drafts").addEventListener("click", async (e) => {
    const ed = e.target.dataset.edit, del = e.target.dataset.del;
    if (ed) location.href = `admin.html?edit=${encodeURIComponent(ed)}`;
    if (del && confirm("Delete this draft? This can't be undone.")) {
      await Store.drafts.remove(del);
      if (editingId === del) $("reset").click();
      renderDrafts();
    }
  });

  $("export").onclick = async (e) => {
    e.target.disabled = true;
    e.target.textContent = "Preparing…";
    try {
      const blob = await Store.exportZip();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `pickleai-tournaments-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
    } finally {
      e.target.disabled = false;
      e.target.textContent = "⬇️ Export for publishing";
    }
  };

  /* ---------- init ---------- */
  (async () => {
    const id = new URLSearchParams(location.search).get("edit");
    if (id) {
      // Edit a draft, or start a draft from a published tournament.
      const t = (await Store.drafts.get(id)) || (window.TOURNAMENTS || []).find((x) => x.id === id);
      if (t) { editingId = id; $("page-title").textContent = "Edit Tournament"; fill(t); }
    }
    renderDrafts();
  })();
})();
