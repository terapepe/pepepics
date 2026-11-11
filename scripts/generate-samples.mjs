/**
 * Generates the clearly-labeled SAMPLE placeholder artwork (SVG) + seed data.
 *
 *   node scripts/generate-samples.mjs
 *
 * Outputs:
 *   public/samples/*.svg          placeholder images (labeled "SAMPLE")
 *   src/data/seed.json            dataset used by DEMO MODE (no Supabase)
 *   supabase/seed.sql             same dataset for the real database
 *
 * These are NOT historical Pepe originals or Rare Pepe collectibles. They are abstract,
 * generated placeholders so the gallery is complete until real artwork is uploaded.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PER_CATEGORY = 12;

let seed = 20261111;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => Math.floor(a + rnd() * (b - a + 1));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const categories = [
  { slug: "classic", name: "Classic Pepe", description: "The timeless faces and feelings that started it all." },
  { slug: "rare", name: "Rare Pepe", description: "Card-style pieces inspired by the culture of rare collecting." },
  { slug: "anime", name: "Anime Pepe", description: "Speed lines, big feelings and dramatic anime energy." },
  { slug: "cyber", name: "Cyber Pepe", description: "Neon nights, glitches and futures that never ended." },
  { slug: "space", name: "Space Pepe", description: "Orbits, nebulae and frogs far from the pond." },
  { slug: "pixel", name: "Pixel Pepe", description: "Retro sprites and 8-bit nostalgia, one pixel at a time." },
  { slug: "art", name: "Art Pepe", description: "Painterly takes, fine-art homages and studio experiments." },
  { slug: "crypto", name: "Crypto Pepe", description: "Internet-money culture, chains, coins and memes." },
];

const named = {
  classic: ["Classic Smug Pepe", "Feels Good Pepe", "Sad Pepe"],
  rare: ["Rare Pepe Genesis", "Golden Pepe"],
  anime: ["Samurai Pepe"],
  cyber: ["Cyberpunk Pepe", "Neon Pepe"],
  space: ["Space Explorer Pepe", "Astronaut Pepe"],
  pixel: ["Pixel Pepe"],
  art: ["Pepe in Wonderland"],
  crypto: [],
};
const adjectives = {
  classic: ["Sunday", "Morning", "Comfy", "Rainy Day", "Old School", "Lazy", "Pondside", "Late Night", "Thinking"],
  rare: ["Foil", "First Edition", "Holo", "Mythic", "Vault", "Emerald", "Obsidian", "Prism", "Relic", "Ancient"],
  anime: ["Ronin", "Shonen", "Cherry Blossom", "Mecha", "Final Form", "Ninja", "Tokyo Drift", "Spirit", "Opening Scene", "Kawaii", "Sensei"],
  cyber: ["Glitch", "Synthwave", "Netrunner", "Chrome", "Hologram", "Grid", "Overclocked", "Signal", "Neon Rain", "Firewall"],
  space: ["Nebula", "Moonwalk", "Orbit", "Supernova", "Comet", "Red Planet", "Zero Gravity", "Starlight", "Deep Field", "Eclipse"],
  pixel: ["8-Bit", "Arcade", "Sprite", "Cartridge", "Low Poly", "Dungeon", "Speedrun", "Bonus Level", "Boss Fight", "Retro", "Mosaic"],
  art: ["Impressionist", "Cubist", "Watercolor", "Gallery", "Portrait", "Ukiyo-e", "Still Life", "Bauhaus", "Fresco", "Ink", "Pop Art"],
  crypto: ["Diamond Hands", "To The Moon", "Hodl", "Gas Fee", "Genesis Block", "Bull Run", "Mempool", "Whale", "Airdrop", "Ledger", "Multichain", "Onchain"],
};

const tagPool = {
  classic: ["smug", "feels", "meme", "classic", "mood", "reaction"],
  rare: ["rare", "card", "foil", "collectible", "golden", "vault"],
  anime: ["anime", "samurai", "manga", "katana", "kawaii", "speedlines"],
  cyber: ["cyberpunk", "neon", "glitch", "synthwave", "future", "hologram"],
  space: ["space", "astronaut", "planet", "stars", "nebula", "moon"],
  pixel: ["pixel", "8bit", "retro", "arcade", "sprite", "game"],
  art: ["painting", "fineart", "abstract", "portrait", "studio", "homage"],
  crypto: ["crypto", "chain", "coin", "hodl", "onchain", "web3"],
};
const types = ["Digital Illustration", "Pixel Art", "Painting", "Vector", "3D Render", "Collage"];
const typeFor = { pixel: "Pixel Art", art: "Painting", cyber: "3D Render", rare: "Digital Illustration" };

const ratios = [[600, 800], [600, 600], [600, 900], [600, 450], [600, 750], [600, 700]];

// ---------- SVG painters ----------
const eyes = (x, y, s, ink = "#0B0D0B", white = "#F3F4EC") => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="-11" cy="0" r="9" fill="${white}" stroke="${ink}" stroke-width="2.5"/>
    <circle cx="11" cy="0" r="9" fill="${white}" stroke="${ink}" stroke-width="2.5"/>
    <circle cx="-8.5" cy="1" r="3.6" fill="${ink}"/><circle cx="13.5" cy="1" r="3.6" fill="${ink}"/>
  </g>`;

function paint(cat, w, h, i) {
  const c = [];
  const cx = w / 2, cy = h / 2;
  switch (cat) {
    case "classic": {
      const bg = pick(["#1E2A17", "#22301B", "#182114", "#2A3A1E"]);
      c.push(`<rect width="${w}" height="${h}" fill="${bg}"/>`);
      for (let y = 20; y < h; y += 22) for (let x = 20; x < w; x += 22)
        c.push(`<circle cx="${x}" cy="${y}" r="${(1.5 + 3 * (y / h)).toFixed(1)}" fill="#75B94A" opacity=".18"/>`);
      const r = w * 0.32;
      c.push(`<circle cx="${cx}" cy="${cy + h * 0.08}" r="${r}" fill="#A6E56D"/>`);
      c.push(`<rect x="0" y="${cy + h * 0.08 + r * 0.25}" width="${w}" height="${h}" fill="${bg}"/>`);
      c.push(`<rect x="0" y="${cy + h * 0.08 + r * 0.25}" width="${w}" height="6" fill="#75B94A"/>`);
      c.push(eyes(cx, cy + h * 0.08 - r * 0.1, r / 26));
      break;
    }
    case "rare": {
      const gold = pick(["#E8C35A", "#A6E56D", "#9BD3FF", "#E79BFF"]);
      c.push(`<rect width="${w}" height="${h}" fill="#0E100E"/>`);
      c.push(`<defs><linearGradient id="f${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${gold}"/><stop offset=".5" stop-color="#F3F4EC"/><stop offset="1" stop-color="${gold}"/></linearGradient></defs>`);
      c.push(`<rect x="30" y="30" width="${w - 60}" height="${h - 60}" rx="22" fill="#171B17" stroke="url(#f${i})" stroke-width="8"/>`);
      for (let k = 0; k < 7; k++) c.push(`<rect x="${-w + k * 140}" y="0" width="40" height="${h * 2}" fill="${gold}" opacity=".06" transform="rotate(25)"/>`);
      c.push(`<rect x="60" y="60" width="${w - 120}" height="${(h - 120) * 0.62}" rx="10" fill="#1F261C"/>`);
      c.push(`<circle cx="${cx}" cy="${60 + (h - 120) * 0.36}" r="${w * 0.17}" fill="${gold}" opacity=".9"/>`);
      c.push(eyes(cx, 60 + (h - 120) * 0.33, w / 260));
      const yb = 60 + (h - 120) * 0.62 + 30;
      c.push(`<rect x="60" y="${yb}" width="${w * 0.5}" height="14" rx="7" fill="${gold}" opacity=".85"/>`);
      c.push(`<rect x="60" y="${yb + 26}" width="${w * 0.35}" height="10" rx="5" fill="#92988F" opacity=".5"/>`);
      for (let s = 0; s < int(1, 5); s++) c.push(`<polygon points="${w - 90 - s * 28},${yb + 6} ${w - 84 - s * 28},${yb + 18} ${w - 96 - s * 28},${yb + 18}" fill="${gold}"/>`);
      break;
    }
    case "anime": {
      const a = pick(["#FF7AB6", "#FFB86B", "#7AD7FF", "#C9A6FF"]);
      c.push(`<rect width="${w}" height="${h}" fill="#131613"/>`);
      for (let k = 0; k < 48; k++) {
        const ang = (k / 48) * Math.PI * 2, L = Math.max(w, h);
        c.push(`<polygon points="${cx},${cy} ${cx + Math.cos(ang) * L},${cy + Math.sin(ang) * L} ${cx + Math.cos(ang + 0.04) * L},${cy + Math.sin(ang + 0.04) * L}" fill="${k % 2 ? a : "#A6E56D"}" opacity=".22"/>`);
      }
      c.push(`<circle cx="${cx}" cy="${cy}" r="${w * 0.3}" fill="${a}" opacity=".9"/>`);
      c.push(`<path d="M0 ${h * 0.78} Q ${w * 0.5} ${h * 0.62} ${w} ${h * 0.8} L ${w} ${h} L 0 ${h} Z" fill="#0B0D0B"/>`);
      c.push(`<rect x="${w * 0.18}" y="${h * 0.72}" width="${w * 0.64}" height="6" fill="#F3F4EC" transform="rotate(-8 ${cx} ${h * 0.72})"/>`);
      c.push(eyes(cx, cy - 6, w / 240));
      for (let p = 0; p < 14; p++) c.push(`<ellipse cx="${int(0, w)}" cy="${int(0, h)}" rx="6" ry="3.5" fill="#FFC3DD" opacity=".8" transform="rotate(${int(0, 180)})"/>`);
      break;
    }
    case "cyber": {
      const n1 = pick(["#FF2BD6", "#00E5FF", "#A6E56D", "#FF6A00"]), n2 = pick(["#00E5FF", "#7A5CFF", "#FF2BD6"]);
      c.push(`<rect width="${w}" height="${h}" fill="#07080C"/>`);
      const hz = h * 0.55;
      c.push(`<circle cx="${cx}" cy="${hz}" r="${w * 0.26}" fill="${n1}" opacity=".85"/>`);
      for (let k = 0; k < 6; k++) c.push(`<rect x="0" y="${hz - w * 0.2 + k * 14}" width="${w}" height="${3 + k}" fill="#07080C"/>`);
      c.push(`<rect x="0" y="${hz}" width="${w}" height="${h - hz}" fill="#0B0D14"/>`);
      for (let k = 0; k <= 16; k++) c.push(`<line x1="${cx}" y1="${hz}" x2="${(k / 16) * w * 3 - w}" y2="${h}" stroke="${n2}" stroke-width="1.5" opacity=".7"/>`);
      for (let k = 1; k < 10; k++) { const y = hz + (h - hz) * Math.pow(k / 10, 1.8); c.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${n2}" stroke-width="1.5" opacity=".6"/>`); }
      c.push(eyes(cx, hz - w * 0.12, w / 230, "#07080C", "#F3F4EC"));
      for (let g = 0; g < 6; g++) c.push(`<rect x="${int(0, w)}" y="${int(0, hz)}" width="${int(30, 140)}" height="${int(2, 8)}" fill="${pick([n1, n2, "#F3F4EC"])}" opacity=".7"/>`);
      break;
    }
    case "space": {
      c.push(`<rect width="${w}" height="${h}" fill="#05070A"/>`);
      c.push(`<defs><radialGradient id="n${i}"><stop offset="0" stop-color="${pick(["#5B3BFF", "#2BB3A3", "#B03BFF", "#3B7BFF"])}" stop-opacity=".55"/><stop offset="1" stop-color="#05070A" stop-opacity="0"/></radialGradient></defs>`);
      c.push(`<ellipse cx="${int(w * 0.2, w * 0.8)}" cy="${int(h * 0.2, h * 0.6)}" rx="${w * 0.6}" ry="${h * 0.35}" fill="url(#n${i})"/>`);
      for (let s = 0; s < 140; s++) c.push(`<circle cx="${int(0, w)}" cy="${int(0, h)}" r="${(rnd() * 1.6 + 0.3).toFixed(1)}" fill="#F3F4EC" opacity="${(rnd() * 0.8 + 0.2).toFixed(2)}"/>`);
      const pr = w * 0.22, px = int(w * 0.3, w * 0.7), py = int(h * 0.45, h * 0.65);
      c.push(`<circle cx="${px}" cy="${py}" r="${pr}" fill="#A6E56D"/>`);
      c.push(`<ellipse cx="${px}" cy="${py}" rx="${pr * 1.7}" ry="${pr * 0.35}" fill="none" stroke="#F3F4EC" stroke-width="5" opacity=".7" transform="rotate(-18 ${px} ${py})"/>`);
      c.push(eyes(px, py - pr * 0.15, pr / 34));
      c.push(`<circle cx="${int(40, w - 40)}" cy="${int(40, h * 0.3)}" r="${int(10, 26)}" fill="#E8C35A" opacity=".9"/>`);
      break;
    }
    case "pixel": {
      const pal = pick([["#0F380F", "#306230", "#8BAC0F", "#9BBC0F"], ["#1A1C2C", "#5D275D", "#B13E53", "#A6E56D"], ["#222034", "#45283C", "#75B94A", "#F3F4EC"]]);
      const s = 30;
      for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
        const d = Math.hypot(x - cx, y - cy) / Math.max(w, h);
        c.push(`<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${pal[Math.min(3, Math.floor(d * 4 + rnd() * 0.6))]}"/>`);
      }
      const bx = Math.floor((cx - 120) / s) * s, by = Math.floor((cy - 90) / s) * s;
      const sprite = ["..GGGG....GGGG..", ".GWWWWG..GWWWWG.", ".GWWBBG..GWWBBG.", ".GWWBBGGGGWWBBG.", "GGGGGGGGGGGGGGGG", "GGGGGGGGGGGGGGGG", "GGDDDDDDDDDDDDGG", "GGGGGGGGGGGGGGGG"];
      const ps = 15;
      sprite.forEach((row, ry) => [...row].forEach((ch, rx) => {
        if (ch === ".") return;
        const col = ch === "G" ? "#A6E56D" : ch === "W" ? "#F3F4EC" : ch === "B" ? "#0B0D0B" : "#2C5A1A";
        c.push(`<rect x="${bx + rx * ps}" y="${by + ry * ps}" width="${ps}" height="${ps}" fill="${col}"/>`);
      }));
      break;
    }
    case "art": {
      const pal = pick([["#E9DCC2", "#C0492B", "#2B4C7E", "#A6E56D"], ["#F2E8CF", "#386641", "#BC4749", "#6A994E"], ["#EDE6D6", "#D9A441", "#2E3A59", "#75B94A"]]);
      c.push(`<rect width="${w}" height="${h}" fill="${pal[0]}"/>`);
      for (let k = 0; k < 9; k++) c.push(`<rect x="${int(-40, w - 80)}" y="${int(-40, h - 80)}" width="${int(80, w * 0.7)}" height="${int(60, h * 0.5)}" fill="${pick(pal.slice(1))}" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}" transform="rotate(${int(-12, 12)} ${cx} ${cy})"/>`);
      for (let k = 0; k < 6; k++) c.push(`<path d="M${int(0, w)} ${int(0, h)} q ${int(-200, 200)} ${int(-200, 200)} ${int(-260, 260)} ${int(-60, 60)}" stroke="${pick(pal.slice(1))}" stroke-width="${int(8, 26)}" fill="none" stroke-linecap="round" opacity=".7"/>`);
      c.push(`<rect x="${w * 0.12}" y="${h * 0.12}" width="${w * 0.76}" height="${h * 0.76}" fill="none" stroke="#1B1B14" stroke-width="10"/>`);
      c.push(eyes(cx, cy, w / 220, "#1B1B14", "#FBF7EC"));
      break;
    }
    case "crypto": {
      const a = pick(["#F0B90B", "#3C7BFF", "#14F195", "#CCFF00", "#A6E56D"]);
      c.push(`<rect width="${w}" height="${h}" fill="#0C0F0C"/>`);
      const R = 34;
      for (let y = 0, row = 0; y < h + R; y += R * 1.5, row++) for (let x = row % 2 ? R * 0.87 : 0; x < w + R; x += R * 1.74) {
        const pts = [...Array(6)].map((_, k) => `${(x + R * Math.cos(Math.PI / 6 + (k * Math.PI) / 3)).toFixed(1)},${(y + R * Math.sin(Math.PI / 6 + (k * Math.PI) / 3)).toFixed(1)}`).join(" ");
        c.push(`<polygon points="${pts}" fill="none" stroke="${a}" stroke-width="1.2" opacity="${(0.1 + rnd() * 0.3).toFixed(2)}"/>`);
      }
      const cr = w * 0.26;
      c.push(`<circle cx="${cx}" cy="${cy}" r="${cr}" fill="${a}"/><circle cx="${cx}" cy="${cy}" r="${cr * 0.82}" fill="none" stroke="#0C0F0C" stroke-width="5" stroke-dasharray="6 9"/>`);
      c.push(eyes(cx, cy - cr * 0.05, cr / 40));
      for (let k = 0; k < 4; k++) c.push(`<circle cx="${int(30, w - 30)}" cy="${int(30, h - 30)}" r="${int(10, 22)}" fill="none" stroke="${a}" stroke-width="3" opacity=".7"/>`);
      break;
    }
  }
  // sample label
  c.push(`<g><rect x="${w - 118}" y="${h - 44}" width="100" height="26" rx="13" fill="#0B0D0B" opacity=".78"/><text x="${w - 68}" y="${h - 26.5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#A6E56D">SAMPLE</text></g>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${c.join("")}</svg>`;
}

// ---------- build dataset ----------
const outDir = path.join(root, "public/samples");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const now = Date.UTC(2026, 10, 10, 12);
const artworks = [];
let idx = 0;
for (const cat of categories) {
  const titles = [...named[cat.slug]];
  const adj = [...adjectives[cat.slug]];
  while (titles.length < PER_CATEGORY) {
    const a = adj.splice(Math.floor(rnd() * adj.length), 1)[0];
    titles.push(`${a} ${cat.name.replace(" Pepe", "")} Pepe`.replace("Classic Pepe", "Pepe"));
  }
  titles.forEach((title, k) => {
    idx++;
    const [w, h] = pick(ratios);
    const slug = slugify(title);
    const file = `${slug}.svg`;
    fs.writeFileSync(path.join(outDir, file), paint(cat.slug, w, h, idx));
    const tags = [...new Set([pick(tagPool[cat.slug]), pick(tagPool[cat.slug]), pick(tagPool[cat.slug]), "sample"])];
    artworks.push({
      slug,
      title,
      description: `${title} — a generated placeholder piece for the ${cat.name} category. This is sample artwork created for PEPE.PICS so the gallery is complete before real community artwork is uploaded. It is not a historical original or a Rare Pepe collectible.`,
      image_url: `/samples/${file}`,
      thumbnail_url: `/samples/${file}`,
      width: w,
      height: h,
      category: cat.slug,
      creator_name: "PEPE.PICS Studio (sample)",
      creation_year: null,
      source_url: null,
      license_type: "Sample placeholder — free to use",
      artwork_type: typeFor[cat.slug] ?? pick(types),
      tags,
      featured: k === 0 || (cat.slug === "space" && k === 1),
      is_sample: true,
      allow_download: true,
      created_at: "",
    });
  });
}

// spread upload dates so categories are interleaved in "latest"
const order = artworks.map((_, i) => i).sort(() => rnd() - 0.5);
order.forEach((ai, k) => { artworks[ai].created_at = new Date(now - (k * 29 + int(0, 20)) * 3600 * 1000).toISOString(); });

const collections = [
  { slug: "the-original-pepe", title: "The Original Pepe", description: "Back to the pond: the classic faces and feelings.", match: (a) => a.category === "classic" },
  { slug: "rare-pepe-archive", title: "Rare Pepe Archive", description: "Card-style pieces celebrating collecting culture.", match: (a) => a.category === "rare" },
  { slug: "pepe-through-the-ages", title: "Pepe Through The Ages", description: "From classic to pixel to fine art — one frog, many eras.", match: (a) => ["classic", "pixel", "art"].includes(a.category) && a.tags.length % 2 === 0 },
  { slug: "pepe-in-space", title: "Pepe in Space", description: "Orbits, nebulae and frogs far from home.", match: (a) => a.category === "space" },
  { slug: "cyberpunk-pepe", title: "Cyberpunk Pepe", description: "Neon, chrome and glitches after midnight.", match: (a) => a.category === "cyber" },
  { slug: "pixel-world", title: "Pixel World", description: "8-bit adventures and retro sprites.", match: (a) => a.category === "pixel" },
  { slug: "anime-universe", title: "Anime Universe", description: "Speed lines, katanas and big feelings.", match: (a) => a.category === "anime" },
  { slug: "crypto-culture", title: "Crypto Culture", description: "Internet money, chains and coin-shaped memes.", match: (a) => a.category === "crypto" || (a.category === "rare" && a.featured) },
];
const collOut = collections.map((c, i) => {
  const items = artworks.filter(c.match).map((a) => a.slug);
  return { slug: c.slug, title: c.title, description: c.description, display_order: i + 1, cover: items[0], artworks: items };
});

const catOut = categories.map((c, i) => ({ ...c, display_order: i + 1, cover: artworks.find((a) => a.category === c.slug).image_url }));

fs.mkdirSync(path.join(root, "src/data"), { recursive: true });
fs.writeFileSync(path.join(root, "src/data/seed.json"), JSON.stringify({ categories: catOut, collections: collOut, artworks }, null, 1));

// ---------- seed.sql ----------
const q = (v) => (v === null || v === undefined ? "null" : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(",")}]::text[]`;
let sql = `-- Generated by scripts/generate-samples.mjs — SAMPLE placeholder content.\n-- Safe to re-run: uses ON CONFLICT on slugs.\n\n`;
for (const c of catOut)
  sql += `insert into public.categories (name, slug, description, cover_image, display_order) values (${q(c.name)}, ${q(c.slug)}, ${q(c.description)}, ${q(c.cover)}, ${c.display_order}) on conflict (slug) do update set name = excluded.name, description = excluded.description, cover_image = excluded.cover_image, display_order = excluded.display_order;\n`;
sql += "\n";
for (const a of artworks)
  sql += `insert into public.artworks (title, slug, description, image_url, thumbnail_url, width, height, category_id, creator_name, creation_year, source_url, license_type, artwork_type, tags, status, featured, is_sample, allow_download, created_at) values (${q(a.title)}, ${q(a.slug)}, ${q(a.description)}, ${q(a.image_url)}, ${q(a.thumbnail_url)}, ${a.width}, ${a.height}, (select id from public.categories where slug = ${q(a.category)}), ${q(a.creator_name)}, null, null, ${q(a.license_type)}, ${q(a.artwork_type)}, ${arr(a.tags)}, 'approved', ${a.featured}, true, true, ${q(a.created_at)}) on conflict (slug) do nothing;\n`;
sql += "\n";
for (const c of collOut) {
  sql += `insert into public.collections (title, slug, description, cover_image, display_order) values (${q(c.title)}, ${q(c.slug)}, ${q(c.description)}, ${q(artworks.find((a) => a.slug === c.cover)?.image_url ?? null)}, ${c.display_order}) on conflict (slug) do update set title = excluded.title, description = excluded.description, display_order = excluded.display_order;\n`;
  for (const s of c.artworks)
    sql += `insert into public.collection_artworks (collection_id, artwork_id) select c.id, a.id from public.collections c, public.artworks a where c.slug = ${q(c.slug)} and a.slug = ${q(s)} on conflict do nothing;\n`;
}
fs.writeFileSync(path.join(root, "supabase/seed.sql"), sql);

console.log(`Generated ${artworks.length} sample artworks, ${catOut.length} categories, ${collOut.length} collections.`);
