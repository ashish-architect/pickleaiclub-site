/*
 * Tournament store for a static site.
 *  - Published tournaments come from data/tournaments.js (window.TOURNAMENTS).
 *  - Tournaments created/edited in admin.html are saved as drafts in the
 *    browser's IndexedDB, including uploaded image/video files (as Blobs).
 *  - "Export" builds a zip with data/tournaments.js + assets/uploads/... that
 *    you unzip over the repo and commit to publish for everyone.
 */
(function () {
  const DB_NAME = "pickleai-site";
  const STORE = "tournaments";

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function tx(mode, fn) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const result = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(result && "result" in result ? result.result : undefined);
      t.onerror = () => reject(t.error);
    });
  }

  const drafts = {
    all: () => tx("readonly", (s) => s.getAll()).then((r) => r || []),
    get: (id) => tx("readonly", (s) => s.get(id)),
    put: (t) => tx("readwrite", (s) => s.put(t)),
    remove: (id) => tx("readwrite", (s) => s.delete(id))
  };

  /* A media item is either a string (URL/path) or {name, type, blob}. */
  const urlCache = new WeakMap();
  function mediaUrl(m) {
    if (!m) return "";
    if (typeof m === "string") return m;
    if (!urlCache.has(m.blob)) urlCache.set(m.blob, URL.createObjectURL(m.blob));
    return urlCache.get(m.blob);
  }
  function isVideoItem(m) {
    if (typeof m === "string") return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(m) || !!UI.youtubeId(m) || /vimeo\.com/.test(m);
    return (m.type || "").startsWith("video/");
  }

  /* Turn a stored draft into a renderable tournament (blob -> object URLs). */
  function hydrate(t, isLocal) {
    return {
      ...t,
      _local: isLocal,
      coverImage: mediaUrl(t.coverImage),
      images: (t.images || []).map(mediaUrl),
      videos: (t.videos || []).map((v) => (typeof v === "string" ? v : { src: mediaUrl(v), type: v.type }))
    };
  }

  /* Published + drafts (drafts override published entries with the same id). */
  async function list() {
    const map = new Map();
    (window.TOURNAMENTS || []).forEach((t) => map.set(t.id, hydrate(t, false)));
    let local = [];
    try { local = await drafts.all(); } catch (e) { console.warn("IndexedDB unavailable", e); }
    local.forEach((t) => map.set(t.id, hydrate(t, true)));
    return [...map.values()].sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""));
  }
  async function find(id) {
    return (await list()).find((t) => t.id === id);
  }

  function slugify(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "")
      .trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60) || "tournament";
  }

  /* ---------------- export: tiny "stored" zip writer (no deps) ---------------- */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  async function makeZip(files) {
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    for (const f of files) {
      const data = f.data instanceof Blob ? new Uint8Array(await f.data.arrayBuffer())
        : typeof f.data === "string" ? enc.encode(f.data) : f.data;
      const name = enc.encode(f.name);
      const crc = crc32(data);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true);
      local.setUint16(8, 0, true); local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true); local.setUint32(22, data.length, true);
      local.setUint16(26, name.length, true);
      parts.push(new Uint8Array(local.buffer), name, data);
      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true);
      cen.setUint32(16, crc, true); cen.setUint32(20, data.length, true); cen.setUint32(24, data.length, true);
      cen.setUint16(28, name.length, true); cen.setUint32(42, offset, true);
      central.push(new Uint8Array(cen.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const cenSize = central.reduce((n, p) => n + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cenSize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: "application/zip" });
  }

  function safeName(name, i) {
    const clean = String(name || "file").toLowerCase().replace(/[^\w.-]+/g, "-");
    return `${String(i + 1).padStart(2, "0")}-${clean}`;
  }

  /* Build data/tournaments.js + uploaded media for published + draft tournaments. */
  async function exportZip() {
    const map = new Map();
    (window.TOURNAMENTS || []).forEach((t) => map.set(t.id, t));
    (await drafts.all()).forEach((t) => map.set(t.id, t));
    const files = [];
    const out = [];
    for (const t of map.values()) {
      const copy = { ...t };
      let n = 0;
      const place = (m) => {
        if (!m || typeof m === "string") return m;
        const path = `assets/uploads/${t.id}/${safeName(m.name, n++)}`;
        files.push({ name: path, data: m.blob });
        return path;
      };
      copy.coverImage = place(t.coverImage);
      copy.images = (t.images || []).map(place);
      copy.videos = (t.videos || []).map(place);
      if (!copy.coverImage) delete copy.coverImage;
      out.push(copy);
    }
    out.sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""));
    const js = "/* Generated by admin.html export. See README.md for field reference. */\n" +
      "window.TOURNAMENTS = " + JSON.stringify(out, null, 2) + ";\n";
    files.unshift({ name: "data/tournaments.js", data: js });
    return makeZip(files);
  }

  window.Store = { list, find, drafts, slugify, exportZip, isVideoItem, mediaUrl };
})();
