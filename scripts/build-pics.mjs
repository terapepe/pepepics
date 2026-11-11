/**
 * Scan pics/ and write data/pics.json for the gallery.
 *
 *   node scripts/build-pics.mjs
 *
 * Folder layout (category = sub-folder name, see js/config.js → categories):
 *   pics/classic/smug-pepe.png
 *   pics/space/astronaut_pepe.webp
 *   pics/whatever.jpg            ← files directly in pics/ go to "classic"
 *
 * Title comes from the file name ("astronaut_pepe-2.webp" → "Astronaut Pepe 2").
 * Name a file "featured-....png" to show it in the hero collage.
 * Titles/tags you edit by hand in data/pics.json are kept on the next run.
 * No dependencies — plain Node 18+.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dir = path.join(root, "pics");
const out = path.join(root, "data/pics.json");
const CATS = ["classic", "rare", "anime", "cyber", "space", "pixel", "art", "crypto"];
const EXT = /\.(jpe?g|png|gif|webp|svg)$/i;

function size(file) {
  const b = fs.readFileSync(file);
  try {
    if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)]; // PNG
    if (b.toString("ascii", 0, 3) === "GIF") return [b.readUInt16LE(6), b.readUInt16LE(8)]; // GIF
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const c = b.toString("ascii", 12, 16);
      if (c === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
      if (c === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
      if (c === "VP8L") { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
    }
    if (b[0] === 0xff && b[1] === 0xd8) { // JPEG
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1], len = b.readUInt16BE(i + 2);
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
        i += 2 + len;
      }
    }
    if (/\.svg$/i.test(file)) {
      const s = b.toString("utf8", 0, 2000);
      const vb = s.match(/viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"/);
      if (vb) return [Math.round(+vb[1]), Math.round(+vb[2])];
    }
  } catch {}
  return [null, null];
}

const titleOf = (name) =>
  name.replace(EXT, "").replace(/^featured[-_ ]*/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Pepe";

const prev = new Map((fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : []).map((p) => [p.image_url, p]));
const files = [];
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (EXT.test(e.name)) files.push(f);
  }
})(dir);

const used = new Set();
const pics = files.map((f) => {
  const rel = path.relative(root, f).split(path.sep).join("/");
  const sub = path.relative(dir, path.dirname(f)).split(path.sep)[0].toLowerCase();
  const name = path.basename(f);
  const old = prev.get(rel);
  let slug = rel.replace(/^pics\//, "").replace(EXT, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  while (used.has(slug)) slug += "-2";
  used.add(slug);
  const [w, h] = size(f);
  return {
    slug,
    title: old?.title ?? titleOf(name),
    category: CATS.includes(sub) ? sub : old?.category ?? "classic",
    image_url: rel,
    width: w,
    height: h,
    tags: old?.tags ?? [],
    creator: old?.creator ?? null,
    featured: old?.featured ?? /^featured/i.test(name),
    likes: 0,
    created_at: old?.created_at ?? fs.statSync(f).mtime.toISOString(),
  };
});
pics.sort((a, b) => b.created_at.localeCompare(a.created_at));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(pics, null, 1));
console.log(`data/pics.json: ${pics.length} pictures`);
for (const c of CATS) { const n = pics.filter((p) => p.category === c).length; if (n) console.log(`  ${c}: ${n}`); }
