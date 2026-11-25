/* Shared layout (header, footer, cookie banner) and small helpers. */
(function () {
  const SITE = {
    name: "Pickle.ai",
    phone: "9620588009",
    whatsapp: "919620588009",
    email: "info@pickleaiclub.com",
    address: "H-507 Prateek Laurel, Sector 120, Noida, Uttar Pradesh",
    instagram: "https://www.instagram.com/pickleball.ai",
    facebook: "https://www.facebook.com/",
    membershipUrl: "membership.html",
    registerUrl: "https://mypickleapp.com"
  };
  window.SITE = SITE;

  /* [href, label] or [href, label, children] for a dropdown */
  const NAV = [
    ["index.html", "Home"],
    ["tournaments.html", "Tournaments", [
      ["tournaments.html", "All Tournaments"],
      ["dupr-nights.html", "DUPR Nights"],
      ["triple-threat-league.html", "Triple Threat League"],
      ["pickle-ai-league.html", "Pickle.ai League"]
    ]],
    ["bootcamps.html", "Bootcamps"],
    ["past-tournaments.html", "Past Events"],
    ["about.html", "About Us"],
    ["contact.html", "Contact"]
  ];

  let page = location.pathname.split("/").pop() || "index.html";
  if (page === "tournament.html") page = "tournaments.html"; // detail pages light up "Tournaments"

  function navItem([href, label, children]) {
    if (!children) return `<a href="${href}" class="${href === page ? "active" : ""}">${label}</a>`;
    const inGroup = href === page || children.some(([h]) => h === page);
    const sub = children.map(([h, l]) =>
      `<a href="${h}" role="menuitem" class="${h === page ? "active" : ""}">${l}</a>`).join("");
    return `
      <div class="nav-group">
        <div class="nav-group__head">
          <a href="${href}" class="${inGroup ? "active" : ""}">${label}</a>
          <button type="button" class="nav-group__toggle" aria-haspopup="true" aria-expanded="false" aria-label="Show ${label} menu">▾</button>
        </div>
        <div class="nav-sub" role="menu">${sub}</div>
      </div>`;
  }

  function header() {
    const links = NAV.map(navItem).join("");
    return `
      <div class="topbar">🎾 Become a Pickle.ai member and get 10% off tournaments plus exclusive perks.
        <a href="${SITE.registerUrl}" target="_blank" rel="noopener">Register here</a></div>
      <header class="site-header">
        <div class="container">
          <a class="brand" href="index.html"><img class="brand__logo" src="assets/img/logo.png" alt="Pickle.ai"><span>PICKLE<b>.AI</b></span></a>
          <button class="nav-toggle" aria-label="Menu" aria-expanded="false">☰</button>
          <nav class="nav">${links}<a class="btn btn--primary btn--sm" href="admin.html">+ Create Tournament</a></nav>
        </div>
      </header>`;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="cols">
            <div>
              <a class="brand" href="index.html"><img class="brand__logo" src="assets/img/logo.png" alt="Pickle.ai"><span>PICKLE<b>.AI</b></span></a>
              <p>Play. Compete. Connect. We're building a connected pickleball network across Uttar Pradesh.</p>
              <div class="socials">
                <a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">f</a>
                <a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">ig</a>
                <a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">wa</a>
              </div>
            </div>
            <div><h4>Events</h4><ul>
              <li><a href="tournaments.html">All Tournaments</a></li>
              <li><a href="dupr-nights.html">DUPR Nights</a></li>
              <li><a href="triple-threat-league.html">Triple Threat League</a></li>
              <li><a href="pickle-ai-league.html">Pickle.ai League</a></li>
              <li><a href="past-tournaments.html">Past Tournaments</a></li>
            </ul></div>
            <div><h4>Club</h4><ul>
              <li><a href="about.html">About Us</a></li>
              <li><a href="bootcamps.html">Bootcamps</a></li>
              <li><a href="index.html#venues">Venue Partners</a></li>
              <li><a href="index.html#services">Services</a></li>
              <li><a href="membership.html">Membership</a></li>
            </ul></div>
            <div><h4>Contact</h4><ul>
              <li><a href="tel:${SITE.phone}">📞 ${SITE.phone}</a></li>
              <li><a href="mailto:${SITE.email}">✉️ ${SITE.email}</a></li>
              <li>📍 ${SITE.address}</li>
            </ul></div>
          </div>
          <div class="bottom">
            <span>© ${new Date().getFullYear()} Pickle.ai Club. All rights reserved.</span>
            <a href="admin.html">Organiser admin</a>
          </div>
        </div>
      </footer>
      <a class="wa-float" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">💬</a>`;
  }

  function cookieBanner() {
    if (localStorage.getItem("cookie-ok")) return;
    const el = document.createElement("div");
    el.className = "cookie";
    el.innerHTML = `<span>This website uses cookies to analyse traffic and improve your experience.</span>
      <button class="btn btn--blue btn--sm">Accept</button>`;
    el.querySelector("button").onclick = () => { localStorage.setItem("cookie-ok", "1"); el.remove(); };
    document.body.appendChild(el);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("afterbegin", header());
    document.body.insertAdjacentHTML("beforeend", footer());
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    // Dropdown groups: ▾ toggles on click/tap; outside click or Esc closes.
    const groups = [...document.querySelectorAll(".nav-group")];
    const setOpen = (g, open) => {
      g.classList.toggle("open", open);
      g.querySelector(".nav-group__toggle").setAttribute("aria-expanded", String(open));
    };
    const closeAll = (except) => groups.forEach((g) => { if (g !== except) setOpen(g, false); });
    groups.forEach((g) => {
      g.querySelector(".nav-group__toggle").addEventListener("click", (e) => {
        e.stopPropagation();
        closeAll(g);
        setOpen(g, !g.classList.contains("open"));
      });
    });

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      // Opening the mobile menu: expand the section you're currently in.
      if (open) groups.forEach((g) => setOpen(g, !!g.querySelector(".nav-sub a.active")));
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".nav-group, .nav-toggle")) closeAll(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
    cookieBanner();
  });

  /* ---------- helpers shared by pages ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function fmtDate(d) {
    if (!d) return "";
    const dt = new Date(d + "T00:00:00");
    return isNaN(dt) ? d : dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  function dateRange(t) {
    return t.endDate && t.endDate !== t.startDate ? `${fmtDate(t.startDate)} – ${fmtDate(t.endDate)}` : fmtDate(t.startDate);
  }
  function statusOf(t) {
    if (t.status) return t.status;
    const today = new Date().toISOString().slice(0, 10);
    const end = t.endDate || t.startDate;
    if (end < today) return "completed";
    if (t.startDate <= today) return "live";
    return "upcoming";
  }
  function badge(t) {
    const s = statusOf(t);
    const cls = s === "completed" ? "badge--past" : s === "live" ? "badge--live" : "";
    const label = s === "completed" ? "Completed" : s === "live" ? "Live now" : "Upcoming";
    return `<span class="badge ${cls}">${label}</span>`;
  }
  function paragraphs(text) {
    return String(text || "").split(/\n\s*\n/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  }
  function youtubeId(url) {
    const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function tournamentCard(t) {
    const cover = t.coverImage || (t.images && t.images[0]);
    const media = cover
      ? `<img src="${esc(cover)}" alt="${esc(t.name)}" loading="lazy">`
      : `<div class="placeholder">${esc(t.series || t.name)}</div>`;
    return `
      <article class="card t-card">
        <a class="t-card__media" href="tournament.html?id=${encodeURIComponent(t.id)}">${media}${badge(t)}${t._local ? '<span class="badge badge--local">Draft</span>' : ""}</a>
        <div class="card__body">
          <small class="eyebrow">${esc(t.series || "Tournament")}</small>
          <h3><a href="tournament.html?id=${encodeURIComponent(t.id)}">${esc(t.name)}</a></h3>
          <ul class="meta">
            <li>📅 ${dateRange(t)}${t.time ? " · " + esc(t.time) : ""}</li>
            ${t.venue ? `<li>📍 ${esc(t.venue)}${t.city ? ", " + esc(t.city) : ""}</li>` : ""}
            ${t.prizePool ? `<li>🏆 ${esc(t.prizePool)}</li>` : ""}
          </ul>
          ${t.summary ? `<p>${esc(t.summary)}</p>` : ""}
          <a class="btn btn--blue btn--sm" href="tournament.html?id=${encodeURIComponent(t.id)}">View details →</a>
        </div>
      </article>`;
  }

  window.UI = { esc, fmtDate, dateRange, statusOf, badge, paragraphs, youtubeId, tournamentCard };
})();
