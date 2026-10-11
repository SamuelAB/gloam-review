// Shared by index.html (current work) and archive.html (every entry, a progress log).
// reviews.json: [{id, date, posted (ISO time with offset), title, notes: [paragraphs],
//   media: [{type: "image"|"video", src, caption}],
//   status: "current" | "archived" (missing = current),
//   superseded_by: id of the entry that replaced it, superseded_note: what came next and what we learned}]

// full screen viewer: click an image; Esc, click or the x closes; arrows step through that review's images
(function () {
  const lb = document.getElementById("lightbox"), lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".cap");
  let group = [], at = 0;
  function show(i) { at = (i + group.length) % group.length; lbImg.src = group[at].src; lbCap.textContent = group[at].alt || ""; }
  function openFrom(img) {
    group = Array.from(img.closest(".review").querySelectorAll("figure img"));
    show(group.indexOf(img)); lb.classList.add("open");
    if (lb.requestFullscreen) lb.requestFullscreen().catch(() => {});
  }
  function close() { lb.classList.remove("open"); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }
  lb.addEventListener("click", close);
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement) lb.classList.remove("open"); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(at + 1);
    else if (e.key === "ArrowLeft") show(at - 1);
  });
  document.addEventListener("click", e => { if (e.target.matches("figure img")) openFrom(e.target); });
})();

// mode "current": only current entries. mode "archive": every entry, with a status badge and the superseded note.
function renderReviews(mode) {
  const root = document.getElementById("reviews");
  fetch("reviews.json", { cache: "no-store" })
    .then(r => r.json())
    .then(all => {
      root.innerHTML = "";
      const isCurrent = rv => (rv.status || "current") !== "archived";
      const titles = {};
      for (const rv of all) titles[rv.id] = rv.title;
      // posted: ISO time with offset (e.g. 2026-10-09T13:51-04:00); older entries fall back to date
      const when = (rv) => new Date(rv.posted || (rv.date + "T00:00:00-04:00")).getTime();
      const list = (mode === "archive" ? all.slice() : all.filter(isCurrent));
      list.sort((a, b) => when(b) - when(a));
      if (!list.length) { root.innerHTML = '<p class="empty">Nothing here yet.</p>'; return; }
      for (const rv of list) {
        const sec = document.createElement("section");
        sec.className = "review"; sec.id = rv.id;
        const h = document.createElement("h2"); h.textContent = rv.title; sec.appendChild(h);
        const m = document.createElement("div"); m.className = "meta"; m.textContent = rv.posted
          ? new Date(rv.posted).toLocaleString("en-CA", {timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short"}) + " (Montreal time)"
          : rv.date;
        if (mode === "archive") {
          const b = document.createElement("span");
          b.className = "badge" + (isCurrent(rv) ? " current" : "");
          b.textContent = isCurrent(rv) ? "current" : "superseded";
          m.appendChild(b);
        }
        sec.appendChild(m);
        if (mode === "archive" && !isCurrent(rv) && (rv.superseded_note || rv.superseded_by)) {
          const box = document.createElement("div"); box.className = "next";
          const t = document.createElement("h3"); t.textContent = "What came next (added later)"; box.appendChild(t);
          if (rv.superseded_note) { const p = document.createElement("p"); p.textContent = rv.superseded_note; box.appendChild(p); }
          if (rv.superseded_by && titles[rv.superseded_by]) {
            const p = document.createElement("p"); p.append("Followed by: ");
            const a = document.createElement("a"); a.href = "#" + rv.superseded_by; a.textContent = titles[rv.superseded_by];
            p.appendChild(a); box.appendChild(p);
          }
          sec.appendChild(box);
        }
        const notes = document.createElement("div"); notes.className = "notes";
        for (const para of rv.notes || []) { const p = document.createElement("p"); p.textContent = para; notes.appendChild(p); }
        sec.appendChild(notes);
        const grid = document.createElement("div"); grid.className = "media";
        for (const it of rv.media || []) {
          const fig = document.createElement("figure");
          let el;
          if (it.type === "video") {
            el = document.createElement("video");
            el.src = it.src; el.controls = true; el.loop = true; el.muted = true; el.playsInline = true; el.preload = "metadata";
          } else {
            el = document.createElement("img"); el.src = it.src; el.loading = "lazy"; el.alt = it.caption || "";
          }
          fig.appendChild(el);
          if (it.caption) { const c = document.createElement("figcaption"); c.textContent = it.caption; fig.appendChild(c); }
          grid.appendChild(fig);
        }
        sec.appendChild(grid);
        root.appendChild(sec);
      }
      // the list is built after load, so jump to #id by hand
      if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    })
    .catch(() => { root.innerHTML = '<p class="empty">Could not load reviews.json.</p>'; });
}
