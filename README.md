# PEPE.PICS — The Ultimate Pepe Gallery

**Every Pepe has a story.** A premium digital art gallery for Pepe artwork: masonry discovery, curated collections, community submissions with moderation, favorites, search and an admin dashboard.

Stack: **Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage) · Lucide · Motion**

---

## Quick start

```bash
npm install
cp .env.example .env.local   # leave Supabase vars empty for demo mode
npm run dev                  # http://localhost:3000
```

### Demo mode vs. live mode

| | Demo mode (no Supabase env) | Live mode |
|---|---|---|
| Artwork | 96 labeled **sample** placeholders from `src/data/seed.json` | Database |
| Favorites | Browser (localStorage) | Database for logged-in users, localStorage for guests (synced on login) |
| Accounts, submissions, admin | Disabled, with an explanation on screen | Enabled |

A "Demo mode" banner is shown at the top whenever the database is not connected. No database feature pretends to work without it.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | live | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | live | Supabase anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL, e.g. `https://pepe.pics` (sitemap, Open Graph, auth redirects) |

The **service-role key is never used** by the app. Every admin action runs with the admin's own session and is checked twice: in the server action and by Row Level Security (`public.is_admin()`).

---

## Supabase setup

1. Create a project at supabase.com.
2. SQL Editor → run `supabase/migrations/20261111000000_init.sql` (tables, indexes, RLS, triggers, storage bucket `artworks`).
3. SQL Editor → run `supabase/seed.sql` (8 categories, 8 collections, 96 sample artworks; safe to re-run).
   Or with the CLI: `supabase link && supabase db push && psql … -f supabase/seed.sql`.
4. Authentication → URL configuration: add `https://YOUR_DOMAIN/auth/callback` (and `http://localhost:3000/auth/callback`) to redirect URLs.
5. Optional: Authentication → Providers → **Google** (client ID/secret). The "Continue with Google" button works once enabled.
6. Sign up on the site, then make yourself admin in the SQL Editor:
   ```sql
   update public.users set role = 'admin' where username = 'your_username';
   ```
   After that, admins can promote others from **/admin/users**.

---

## Configuration — `src/config/site.ts`

Everything brand/token related is edited in one file:

| Key | Purpose |
|---|---|
| `brand` | Name, wordmark, taglines, description |
| `token.name`, `token.symbol` | `PEPES` / `PEPES` |
| `token.evmAddress` | One CA shared by **Robinhood, Base and BSC** (add later) |
| `token.solanaMint` | Solana mint address (add later) |
| `mode` | `"multi"` → always Solana, Robinhood, Base, BSC · `"single"` → only `singleNetwork` |
| `singleNetwork` | `solana` \| `robinhood` \| `base` \| `bsc` — in single mode the token section is themed with that network's color, tagline and icon |
| `multiOrder` | Network order in multi mode |
| `networks.<key>` | Name, color, tagline, icon (`public/networks/*.svg`), explorer, optional per-network `ca` override |
| `social.x` | X account (`https://x.com/PepePicture`) |
| `uploads`, `popularSearches` | Upload limits, search suggestions |

Contract addresses are shown with the network SVG, a copy button and an explorer link (header `$PEPES` button, mobile menu and the token section on the home page). Empty CA → "CA coming soon".

Admins can also override site name, logo, hero text, meta description, X link and upload limit from **/admin/settings** (stored in `site_settings`).

---

## Features

- **Home** — editorial hero with floating artwork collage, Featured, 8 categories, Trending (ranked by favorites × 3 + views), Latest, Random Pepe, `$PEPES` token section, community banner.
- **Explore** — search (title, creator, tags, description), category chips, sort (Latest, Oldest, Most Popular, Most Favorited, Random), filters (creation year, artwork type, featured only, community submissions), left-to-right masonry, lazy images, infinite scroll + "Load more", skeletons, empty state.
- **Artwork page** — large image, fullscreen viewer (zoom with buttons / wheel / double-click, `←` `→` navigation, `F`, `Esc`), metadata (year only when set), license, source, tags, collections, favorite/share/copy link/download (only when allowed), related artwork, view counter.
- **Collections**, **Categories**, **Community** (latest, most favorited, creator leaderboard computed from real data), **Creator profiles**.
- **Submit** — drag & drop, preview, real upload progress, client + server validation (magic-byte type check, 10 MB limit, SHA-256 hash for duplicate detection). Everything is `pending` until approved.
- **Favorites** — guest localStorage, database when logged in, guest favorites synced after login, sort newest/oldest.
- **Search overlay** — `/` to open, `Esc` to close, `Enter` for full results; instant results, recent & popular searches, category shortcuts.
- **Auth** — email/password + Google; profile editing (username, bio, avatar).
- **Admin** — overview counts, moderation (preview, approve, reject with reason, duplicate warnings), artworks (add one or many images, edit, category, collections, featured, status, delete), categories (create, edit, cover upload, order), collections (create, edit, cover, add/remove artworks, reorder, delete), users (suspend, grant/revoke admin), settings.
- **SEO / UX** — Open Graph image, per-page metadata, `sitemap.xml`, `robots.txt`, custom 404, error boundary, toasts, keyboard focus styles, reduced-motion support.

## Security model (RLS)

- Public can read approved artwork, categories, collections, public profile columns (email is not readable).
- Authenticated, non-suspended users can upload into their own storage folder and insert `pending` artwork + submission rows. Triggers force `status = pending`, `featured = false`, counters = 0 for non-admin API requests.
- Users can only edit their own profile (role/suspension are protected by a trigger) and their own favorites.
- Only admins can approve/reject, edit published artwork, manage categories/collections/settings and users.

## Sample artwork

`npm run gen:samples` regenerates `public/samples/*.svg`, `src/data/seed.json` and `supabase/seed.sql`. These are abstract generated placeholders, every one marked **SAMPLE** on the image and labeled "Sample artwork" on its page. They are **not** historical originals or Rare Pepe collectibles. Replace them by uploading real artwork you have rights to (admin → Add artwork), then delete the samples (`delete from artworks where is_sample;`).

## Deploy

Any Node host for Next.js (Vercel recommended): set the three env vars and deploy. `npm run build && npm start` for self-hosting.

---

PEPE.PICS is an independent fan-driven gallery and is not affiliated with or endorsed by Matt Furie or the original Pepe the Frog creators. Artwork remains the property of its respective creators and rights holders.
