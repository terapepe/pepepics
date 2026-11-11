# PEPE.PICS — The Ultimate Pepe Gallery

**Every Pepe has a story.** A simple static gallery: plain HTML/CSS/JS, no build step, no framework.
Pictures and uploads are stored in **Supabase** (database + Storage).

## Run / host

Any static host: Hostinger (upload the files to `public_html`), GitHub Pages, Netlify… Locally: `python3 -m http.server` → http://localhost:8000

## Add your pictures

1. Copy images into `pics/<category>/` (`classic`, `rare`, `anime`, `cyber`, `space`, `pixel`, `art`, `crypto`).
2. Run `node scripts/build-pics.mjs` → writes `data/pics.json` (title from file name, size, category from folder).
3. Commit + push (or upload to your host). Prefix a file with `featured-` to put it in the hero.
4. When you have enough of your own, set `gallery.showSamples: false` in `js/config.js`.

## Configure — `js/config.js`

| Key | Purpose |
|---|---|
| `brand` | Name / tagline |
| `token.name`, `token.symbol` | `PEPES` |
| `token.evmAddress` | One CA shared by **Robinhood, Base and BSC** |
| `token.solanaMint` | Solana mint |
| `mode` | `"multi"` = always Solana, Robinhood, Base, BSC · `"single"` = only `singleNetwork` |
| `singleNetwork` | `solana` \| `robinhood` \| `base` \| `bsc` — token section uses that network's color, icon and tagline |
| `multiOrder` | Network order in multi mode |
| `networks.<key>` | Name, color, tagline, icon (`assets/networks/*.svg`), explorer, optional per-network `ca` |
| `social.x` | X account (`@PepePicture`) |
| `supabase` | Project URL + anon (public) key + bucket |
| `upload` | Max size / allowed types |
| `categories` | Gallery categories |

CAs are shown with the network SVG + copy button + explorer link (header `$PEPES` button and the Token section). Empty CA → "CA coming soon".

## Supabase (visitor uploads — currently off: `upload.enabled: false`)

1. SQL Editor → run `supabase/schema.sql` (table `pics`, RLS, `like_pic()` function, public Storage bucket `pics`).
2. SQL Editor → run `supabase/seed.sql` (200 sample pictures).
3. Put the project URL + anon key in `js/config.js`.

**Moderation:** visitor uploads go to Storage (`pics/uploads/…`) and are saved with `status = 'pending'`.
Approve them in Supabase → Table Editor → `pics` → set `status` to `approved` (or `rejected`). Set `featured = true` to show a picture in the hero.

Visitors can only: read approved pictures, upload images (≤ 10 MB, JPG/PNG/WEBP/GIF) into `uploads/`, insert a pending row, and like (+1) an approved picture.

## Sample pictures

`node scripts/generate-samples.mjs` regenerates `samples/*.svg` (200), `data/samples.json` (offline fallback) and `supabase/seed.sql`.
They are abstract generated placeholders labeled **SAMPLE** — not historical originals or Rare Pepe collectibles. Hide them later with
`update pics set status = 'rejected' where is_sample;`.

---

PEPE.PICS is an independent fan-driven gallery and is not affiliated with or endorsed by Matt Furie or the original Pepe the Frog creators.
