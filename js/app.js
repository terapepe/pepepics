/* PEPE.PICS — gallery app (vanilla JS, no build step).
 * Data: Supabase REST (table `pics`, approved rows). If Supabase is unreachable,
 * falls back to data/samples.json so the gallery never renders empty.
 * Uploads: Supabase Storage bucket → row inserted as `pending` (reviewed before going public). */
(function () {
  const C = window.PEPE_CONFIG;
  const SB = C.supabase;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const catName = Object.fromEntries(C.categories.map((c) => [c.slug, c.name]));
  const LIKED_KEY = "pepepics:liked";
  let liked = new Set();
  try { liked = new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]")); } catch {}

  /* ------------------------------------------------------------ toast */
  let toastT;
  function toast(text) {
    const t = $("#toast");
    t.textContent = text; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2400);
  }
  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); toast(`${label} copied`); } catch { toast("Copy failed"); }
  }

  /* ------------------------------------------------------------ networks / CA */
  const nets = () => (C.mode === "single" ? [C.singleNetwork] : C.multiOrder).map((k) => ({ key: k, ...C.networks[k] }));
  const caOf = (n) => n.ca || (n.type === "solana" ? C.token.solanaMint : C.token.evmAddress);
  const ICON_COPY = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  const ICON_EXT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg>';

  function caRow(n, short) {
    const ca = caOf(n);
    const row = el("div", "ca-row");
    const shown = ca ? (short && ca.length > 18 ? `${ca.slice(0, 6)}…${ca.slice(-6)}` : ca) : "CA coming soon";
    row.innerHTML = `<img src="${esc(n.icon)}" alt="${esc(n.name)}" />
      <div class="ca-info"><div class="ca-net">${esc(n.name)}</div><div class="ca-addr ${ca ? "" : "soon"}" title="${esc(ca)}">${esc(shown)}</div></div>
      ${ca ? `<a href="${esc(n.explorer + ca)}" target="_blank" rel="noopener" aria-label="Explorer">${ICON_EXT}</a>` : ""}
      <button ${ca ? "" : "disabled"} aria-label="Copy ${esc(n.short)} CA">${ICON_COPY}</button>`;
    row.querySelector("button").onclick = () => copy(ca, `${n.short} CA`);
    return row;
  }

  function renderToken() {
    const list = nets();
    const single = C.mode === "single";
    $("#caStack").innerHTML = list.map((n) => `<img src="${esc(n.icon)}" alt="" />`).join("");
    $("#caSym").textContent = "$" + C.token.symbol;
    const menu = $("#caMenu");
    menu.innerHTML = `<div class="ca-net" style="font:600 10px var(--display);letter-spacing:.14em;color:var(--mute);padding:2px 4px">$${esc(C.token.symbol)} CONTRACT ADDRESS</div>`;
    list.forEach((n) => menu.appendChild(caRow(n, true)));
    $("#caBtn").onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; $("#caBtn").setAttribute("aria-expanded", String(!menu.hidden)); };
    menu.onclick = (e) => e.stopPropagation();
    document.addEventListener("click", () => (menu.hidden = true));

    const box = $("#tokenBox");
    const evm = list.filter((n) => n.type === "evm").map((n) => n.short);
    if (single) {
      const n = list[0];
      box.classList.add("single");
      box.style.setProperty("--accent", n.color);
      $("#tokenEyebrow").innerHTML = `<img src="${esc(n.icon)}" width="18" height="18" alt="" style="border-radius:50%" /> Live on ${esc(n.name)}`;
      $("#tokenText").textContent = `${C.token.name} on ${n.name}. ${n.tagline} Always verify the address before interacting.`;
    } else {
      $("#tokenEyebrow").innerHTML = `<span class="net-stack">${list.map((n) => `<img src="${esc(n.icon)}" alt="" />`).join("")}</span> Multichain`;
      $("#tokenText").textContent = `${C.token.name} lives on ${list.map((n) => n.short).join(", ")}. ${evm.join(", ")} share the same contract address. Always verify the address before interacting.`;
    }
    $("#tokenTitle").textContent = "$" + C.token.symbol;
    const cl = $("#caList"); cl.innerHTML = "";
    list.forEach((n) => cl.appendChild(caRow(n, !single)));
    $("#statNets").textContent = list.length;
  }

  /* ------------------------------------------------------------ data */
  const headers = { apikey: SB.anonKey, Authorization: `Bearer ${SB.anonKey}` };
  let all = [];
  async function load() {
    try {
      const r = await fetch(`${SB.url}/rest/v1/pics?select=id,slug,title,category,image_url,width,height,tags,creator,featured,is_sample,likes,created_at&status=eq.approved&order=created_at.desc&limit=5000`, { headers });
      if (!r.ok) throw new Error(r.status);
      const rows = await r.json();
      if (!rows.length) throw new Error("empty");
      return rows;
    } catch {
      const r = await fetch("data/samples.json");
      return (await r.json()).map((p) => ({ ...p, id: null, width: p.w, height: p.h }));
    }
  }

  /* ------------------------------------------------------------ gallery */
  const state = { q: "", cat: "", sort: "latest", shown: 0, list: [], seed: Math.random() };
  let cols = [];

  function colCount() { const w = innerWidth; return w >= 1400 ? 5 : w >= 1050 ? 4 : w >= 700 ? 3 : 2; }

  function filtered() {
    const q = state.q.trim().toLowerCase().replace(/^#/, "");
    let l = all.filter((p) => (!state.cat || p.category === state.cat) && (!q || `${p.title} ${p.tags.join(" ")} ${p.creator || ""} ${catName[p.category]}`.toLowerCase().includes(q)));
    if (state.sort === "popular") l = [...l].sort((a, b) => b.likes - a.likes || b.created_at.localeCompare(a.created_at));
    if (state.sort === "random") { let s = Math.floor(state.seed * 1e9); l = [...l]; for (let i = l.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [l[i], l[j]] = [l[j], l[i]]; } }
    return l;
  }

  function card(p, i) {
    const a = el("article", "card");
    a.tabIndex = 0;
    const ratio = `${p.width || 600}/${p.height || 750}`;
    a.innerHTML = `<div class="ph" style="aspect-ratio:${ratio}">${p.featured ? '<span class="badge">Featured</span>' : p.is_sample ? '<span class="badge">Sample</span>' : ""}<img loading="lazy" decoding="async" alt="${esc(p.title)}" src="${esc(p.image_url)}" /></div>
      <div class="meta"><div style="min-width:0"><div class="t">${esc(p.title)}</div><div class="c">${esc(catName[p.category] || "")}${p.creator && !p.is_sample ? " · " + esc(p.creator) : ""}</div></div><span class="l">♥ ${p.likes}</span></div>`;
    const img = a.querySelector("img");
    img.onload = () => img.classList.add("ok");
    if (img.complete && img.naturalWidth) img.classList.add("ok");
    img.onerror = () => { a.querySelector(".ph").innerHTML = '<div class="muted" style="display:grid;place-items:center;height:100%;font-size:13px">Image unavailable</div>'; };
    a.onclick = () => openLb(i);
    a.onkeydown = (e) => e.key === "Enter" && openLb(i);
    return a;
  }

  function layout(reset) {
    const grid = $("#grid");
    if (reset) {
      state.list = filtered();
      state.shown = 0;
      grid.innerHTML = "";
      cols = Array.from({ length: colCount() }, () => { const c = el("div", "col"); grid.appendChild(c); return { c, h: 0 }; });
    }
    const next = state.list.slice(state.shown, state.shown + C.pageSize);
    next.forEach((p, k) => {
      const col = cols.reduce((m, c) => (c.h < m.h ? c : m), cols[0]);
      col.c.appendChild(card(p, state.shown + k));
      col.h += (p.height || 750) / (p.width || 600) + 0.15;
    });
    state.shown += next.length;
    $("#count").textContent = `${state.list.length} picture${state.list.length === 1 ? "" : "s"}`;
    $("#empty").hidden = state.list.length > 0;
    $("#more").hidden = state.shown >= state.list.length;
  }

  function renderCats() {
    const box = $("#cats");
    const mk = (slug, name) => {
      const b = el("button", "chip" + (state.cat === slug ? " on" : ""), name); // name is trusted config text
      b.setAttribute("role", "tab");
      b.onclick = () => { state.cat = slug; renderCats(); layout(true); };
      return b;
    };
    box.innerHTML = "";
    box.appendChild(mk("", "All"));
    C.categories.forEach((c) => box.appendChild(mk(c.slug, `${esc(c.name)} <span style="opacity:.6">${all.filter((p) => p.category === c.slug).length}</span>`)));
  }

  function renderCollage() {
    const slots = [
      ["2%", "6%", "38%", -3], ["44%", "0", "30%", 2], ["76%", "12%", "24%", 4], ["18%", "54%", "28%", 3],
      ["50%", "42%", "34%", -2], ["0", "68%", "17%", -5], ["80%", "64%", "19%", 5],
    ];
    const pick = [...all.filter((p) => p.featured), ...all].filter((p, i, a) => a.indexOf(p) === i).slice(0, slots.length);
    const box = $("#collage"); box.innerHTML = "";
    pick.forEach((p, i) => {
      const [l, t, w, r] = slots[i];
      const a = el("a");
      a.href = `#pic=${p.slug}`;
      a.style.cssText = `left:${l};top:${t};width:${w};aspect-ratio:${p.width || 600}/${p.height || 750};rotate:${r}deg;animation-delay:${i * -0.9}s`;
      a.innerHTML = `<img src="${esc(p.image_url)}" alt="" />`;
      box.appendChild(a);
    });
  }

  /* ------------------------------------------------------------ lightbox */
  let lbIndex = -1;
  function openLb(i) {
    const p = state.list[i];
    if (!p) return;
    lbIndex = i;
    $("#lbImg").src = p.image_url;
    $("#lbImg").alt = p.title;
    $("#lbTitle").textContent = p.title;
    $("#lbMeta").textContent = [catName[p.category], p.creator, new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }), p.tags.map((t) => "#" + t).join(" ")].filter(Boolean).join(" · ");
    const likeBtn = $("#lbLike");
    likeBtn.textContent = `♥ ${p.likes}`;
    likeBtn.classList.toggle("liked", liked.has(p.slug));
    likeBtn.disabled = !p.id;
    const dl = $("#lbDl"); dl.href = p.image_url; dl.setAttribute("download", p.slug);
    $("#lightbox").hidden = false;
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", `#pic=${p.slug}`);
  }
  function closeLb() {
    $("#lightbox").hidden = true;
    document.body.style.overflow = "";
    lbIndex = -1;
    history.replaceState(null, "", location.pathname + location.search);
  }
  async function like() {
    const p = state.list[lbIndex];
    if (!p || !p.id || liked.has(p.slug)) return toast(liked.has(p?.slug) ? "Already liked" : "Likes need the database");
    try {
      const r = await fetch(`${SB.url}/rest/v1/rpc/like_pic`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ p_id: p.id }) });
      if (!r.ok) throw 0;
      const n = await r.json();
      p.likes = typeof n === "number" ? n : p.likes + 1;
      liked.add(p.slug);
      try { localStorage.setItem(LIKED_KEY, JSON.stringify([...liked])); } catch {}
      openLb(lbIndex);
      toast("Liked ♥");
    } catch { toast("Could not like right now"); }
  }
  function bindLb() {
    $("#lightbox").addEventListener("click", (e) => {
      const act = e.target.closest("[data-lb]")?.dataset.lb;
      if (e.target.id === "lightbox" || act === "close") closeLb();
      else if (act === "prev") openLb(Math.max(0, lbIndex - 1));
      else if (act === "next") { if (lbIndex + 1 >= state.shown) layout(false); openLb(Math.min(state.list.length - 1, lbIndex + 1)); }
      else if (act === "like") like();
      else if (act === "copy") copy(location.href, "Link");
    });
    addEventListener("keydown", (e) => {
      if ($("#lightbox").hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") openLb(Math.max(0, lbIndex - 1));
      if (e.key === "ArrowRight") { if (lbIndex + 1 >= state.shown) layout(false); openLb(Math.min(state.list.length - 1, lbIndex + 1)); }
    });
  }
  function openFromHash() {
    const m = location.hash.match(/^#pic=([\w-]+)/);
    if (!m) return;
    let i = state.list.findIndex((p) => p.slug === m[1]);
    if (i < 0) { state.cat = ""; state.q = ""; $("#search").value = ""; renderCats(); layout(true); i = state.list.findIndex((p) => p.slug === m[1]); }
    while (i >= state.shown && state.shown < state.list.length) layout(false);
    if (i >= 0) openLb(i);
  }

  /* ------------------------------------------------------------ upload */
  function bindUpload() {
    $("#maxMb").textContent = C.upload.maxMb;
    $("#fCat").innerHTML = '<option value="">Category *</option>' + C.categories.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join("");
    let file = null, dims = { w: null, h: null };
    const msg = (t, kind) => { const m = $("#msg"); m.textContent = t; m.className = "msg " + (kind || ""); };
    const pick = (f) => {
      if (!f) return;
      if (!C.upload.types.includes(f.type)) return msg("Only JPG, PNG, WEBP or GIF images.", "err");
      if (f.size > C.upload.maxMb * 1048576) return msg(`File is ${(f.size / 1048576).toFixed(1)} MB — max ${C.upload.maxMb} MB.`, "err");
      file = f; msg("");
      const url = URL.createObjectURL(f);
      const img = $("#preview"); img.src = url; img.hidden = false; $("#dropText").hidden = true;
      img.onload = () => (dims = { w: img.naturalWidth, h: img.naturalHeight });
    };
    $("#file").onchange = (e) => pick(e.target.files[0]);
    const drop = $("#drop");
    drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
    drop.ondragleave = () => drop.classList.remove("over");
    drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove("over"); pick(e.dataTransfer.files[0]); };

    $("#uploadForm").onsubmit = async (e) => {
      e.preventDefault();
      const title = $("#fTitle").value.trim();
      const category = $("#fCat").value;
      if (!file) return msg("Choose an image.", "err");
      if (title.length < 2) return msg("Add a title.", "err");
      if (!category) return msg("Choose a category.", "err");
      if (!$("#fOwn").checked) return msg("Please confirm you made it or have permission.", "err");

      const btn = $("#submitBtn"); btn.disabled = true;
      const bar = $("#bar"); $("#progress").hidden = false; bar.style.width = "0";
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[file.type];
      const id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
      const path = `uploads/${id}.${ext}`;
      try {
        // 1) file → Supabase Storage (XHR for real progress)
        await new Promise((res, rej) => {
          const x = new XMLHttpRequest();
          x.open("POST", `${SB.url}/storage/v1/object/${SB.bucket}/${path}`);
          x.setRequestHeader("apikey", SB.anonKey);
          x.setRequestHeader("Authorization", `Bearer ${SB.anonKey}`);
          x.setRequestHeader("Content-Type", file.type);
          x.setRequestHeader("x-upsert", "false");
          x.upload.onprogress = (p) => p.lengthComputable && (bar.style.width = `${Math.round((p.loaded / p.total) * 100)}%`);
          x.onload = () => (x.status < 300 ? res() : rej(new Error(JSON.parse(x.responseText || "{}").message || `Upload failed (${x.status})`)));
          x.onerror = () => rej(new Error("Network error"));
          x.send(file);
        });
        // 2) row → pics (pending)
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50) || "pepe"}-${id.slice(0, 6)}`;
        const tags = [...new Set($("#fTags").value.toLowerCase().split(/[,\s#]+/).map((t) => t.replace(/[^a-z0-9_-]/g, "")).filter((t) => t.length > 1))].slice(0, 10);
        const r = await fetch(`${SB.url}/rest/v1/pics`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ slug, title, category, tags, creator: $("#fCreator").value.trim() || null, image_url: `${SB.url}/storage/v1/object/public/${SB.bucket}/${path}`, width: dims.w, height: dims.h }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || `Save failed (${r.status})`);
        msg("Uploaded! Your Pepe will appear in the gallery after review.", "ok");
        $("#uploadForm").reset(); file = null;
        $("#preview").hidden = true; $("#dropText").hidden = false;
      } catch (err) {
        msg(err.message || "Upload failed.", "err");
      } finally {
        btn.disabled = false;
        setTimeout(() => ($("#progress").hidden = true), 800);
      }
    };
  }

  /* ------------------------------------------------------------ init */
  async function init() {
    const x = C.social.x;
    $("#navX").href = x; $("#footX").href = x; $("#footX").textContent = "𝕏 " + C.social.xHandle;
    $("#subtitle").textContent = C.brand.subtitle;
    renderToken();
    bindUpload();
    bindLb();

    addEventListener("scroll", () => $("#topbar").classList.toggle("scrolled", scrollY > 10), { passive: true });
    $("#burger").onclick = () => $("#nav").classList.toggle("open");
    $("#nav").onclick = () => $("#nav").classList.remove("open");

    all = await load();
    $("#statPics").textContent = all.length;
    $("#statCats").textContent = C.categories.length;
    renderCats();
    renderCollage();
    layout(true);

    let t;
    $("#search").oninput = (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; layout(true); }, 200); };
    $("#sort").onchange = (e) => { state.sort = e.target.value; state.seed = Math.random(); layout(true); };
    $("#more").onclick = () => layout(false);
    new IntersectionObserver((en) => en[0].isIntersecting && !$("#more").hidden && layout(false), { rootMargin: "600px" }).observe($("#more"));
    let lastCols = colCount();
    addEventListener("resize", () => { if (colCount() !== lastCols) { lastCols = colCount(); const n = state.shown; layout(true); while (state.shown < n) layout(false); } });
    $("#randomBtn").onclick = () => { state.cat = ""; state.q = ""; $("#search").value = ""; renderCats(); layout(true); const i = Math.floor(Math.random() * state.list.length); while (i >= state.shown) layout(false); openLb(i); };
    $("#collage").addEventListener("click", (e) => { const a = e.target.closest("a"); if (a) { e.preventDefault(); location.hash = a.getAttribute("href"); } });
    addEventListener("hashchange", openFromHash);
    openFromHash();
  }
  init();
})();
