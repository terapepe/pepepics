import "server-only";
import { cache } from "react";
import seed from "@/data/seed.json";
import { siteConfig } from "@/config/site";
import { isLive } from "@/lib/env";
import { supabasePublic, supabaseServer } from "@/lib/supabase/server";
import type { Artwork, ArtworkQuery, Category, Collection, Page, Profile, SiteSettings } from "@/lib/types";

/* =====================================================================
 * Data access. With Supabase configured → real database (RLS applies).
 * Without credentials → DEMO MODE: read-only sample dataset (src/data/seed.json).
 * ===================================================================== */

export const ARTWORK_COLUMNS =
  "id,slug,title,description,image_url,thumbnail_url,width,height,creator_id,creator_name,creation_year,source_url,license_type,artwork_type,tags,status,featured,is_sample,allow_download,views,favorites_count,created_at,category:categories(slug,name),creator:users(username)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapArtwork(r: any): Artwork {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    image_url: r.image_url,
    thumbnail_url: r.thumbnail_url,
    width: r.width,
    height: r.height,
    category: r.category ?? null,
    creator_id: r.creator_id ?? null,
    creator_name: r.creator_name,
    creator_username: r.creator?.username ?? null,
    creation_year: r.creation_year,
    source_url: r.source_url,
    license_type: r.license_type,
    artwork_type: r.artwork_type,
    tags: r.tags ?? [],
    status: r.status,
    featured: r.featured,
    is_sample: r.is_sample,
    allow_download: r.allow_download,
    views: r.views ?? 0,
    favorites_count: r.favorites_count ?? 0,
    created_at: r.created_at,
  };
}

/* ---------------------------------------------------------------- demo dataset */
const demoCats = new Map(seed.categories.map((c) => [c.slug, c]));
const demoArtworks: Artwork[] = seed.artworks.map((a) => ({
  id: a.slug,
  slug: a.slug,
  title: a.title,
  description: a.description,
  image_url: a.image_url,
  thumbnail_url: a.thumbnail_url,
  width: a.width,
  height: a.height,
  category: { slug: a.category, name: demoCats.get(a.category)!.name },
  creator_id: null,
  creator_name: a.creator_name,
  creator_username: null,
  creation_year: a.creation_year,
  source_url: a.source_url,
  license_type: a.license_type,
  artwork_type: a.artwork_type,
  tags: a.tags,
  status: "approved",
  featured: a.featured,
  is_sample: a.is_sample,
  allow_download: a.allow_download,
  views: 0,
  favorites_count: 0,
  created_at: a.created_at,
}));

/** deterministic shuffle */
function shuffle<T>(arr: T[], seedNum: number): T[] {
  const a = [...arr];
  let s = seedNum >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const engagement = (a: Artwork) => a.favorites_count * 3 + a.views;

function sortArtworks(list: Artwork[], sort: ArtworkQuery["sort"], seedNum = 1) {
  switch (sort) {
    case "oldest":
      return [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    case "popular":
      return [...list].sort((a, b) => engagement(b) - engagement(a) || b.created_at.localeCompare(a.created_at));
    case "favorited":
      return [...list].sort((a, b) => b.favorites_count - a.favorites_count || b.created_at.localeCompare(a.created_at));
    case "random":
      return shuffle(list, seedNum);
    default:
      return [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

function clean(q?: string) {
  return (q ?? "").toLowerCase().replace(/[^a-z0-9 _\-#]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

function demoQuery(p: ArtworkQuery): Page<Artwork> {
  const page = Math.max(1, p.page ?? 1);
  const pageSize = Math.min(60, p.pageSize ?? 24);
  const q = clean(p.q).replace(/^#/, "");
  let list = demoArtworks;
  if (p.ids) list = list.filter((a) => p.ids!.includes(a.id));
  if (p.category) list = list.filter((a) => a.category?.slug === p.category);
  if (p.collection) {
    const c = seed.collections.find((c) => c.slug === p.collection);
    list = c ? list.filter((a) => c.artworks.includes(a.slug)) : [];
  }
  if (p.year) list = list.filter((a) => a.creation_year === p.year);
  if (p.type) list = list.filter((a) => a.artwork_type === p.type);
  if (p.featured) list = list.filter((a) => a.featured);
  if (p.community) list = list.filter((a) => a.creator_id !== null);
  if (p.creatorId) list = list.filter((a) => a.creator_id === p.creatorId);
  if (q)
    list = list.filter((a) =>
      `${a.title} ${a.creator_name} ${a.description} ${a.tags.join(" ")} ${a.category?.name}`.toLowerCase().includes(q),
    );
  const sorted = sortArtworks(list, p.sort, p.seed);
  return { items: sorted.slice((page - 1) * pageSize, page * pageSize), total: sorted.length, page, pageSize };
}

/* ---------------------------------------------------------------- categories */
export const getCategories = cache(async (): Promise<Category[]> => {
  const sb = supabasePublic();
  if (!sb) {
    return seed.categories.map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      description: c.description,
      cover_image: c.cover,
      display_order: c.display_order,
      count: demoArtworks.filter((a) => a.category?.slug === c.slug).length,
    }));
  }
  const { data } = await sb.from("categories").select("id,slug,name,description,cover_image,display_order").order("display_order");
  const { data: counts } = await sb.from("artworks").select("category_id").eq("status", "approved");
  const tally = new Map<string, number>();
  (counts ?? []).forEach((r) => r.category_id && tally.set(r.category_id, (tally.get(r.category_id) ?? 0) + 1));
  return (data ?? []).map((c) => ({ ...c, count: tally.get(c.id) ?? 0 }));
});

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

/* ---------------------------------------------------------------- artworks */
export async function queryArtworks(p: ArtworkQuery): Promise<Page<Artwork>> {
  const sb = await supabaseServer();
  if (!sb) return demoQuery(p);

  const page = Math.max(1, p.page ?? 1);
  const pageSize = Math.min(60, p.pageSize ?? 24);
  let qb = sb.from("artworks").select(ARTWORK_COLUMNS, { count: "exact" }).eq("status", "approved");

  if (p.ids) qb = qb.in("id", p.ids.filter((x) => /^[0-9a-f-]{36}$/i.test(x)));
  if (p.category) {
    const cat = await getCategory(p.category);
    if (!cat) return { items: [], total: 0, page, pageSize };
    qb = qb.eq("category_id", cat.id);
  }
  if (p.collection) {
    const { data: col } = await sb.from("collections").select("id").eq("slug", p.collection).maybeSingle();
    if (!col) return { items: [], total: 0, page, pageSize };
    const { data: links } = await sb.from("collection_artworks").select("artwork_id").eq("collection_id", col.id);
    qb = qb.in("id", (links ?? []).map((l) => l.artwork_id));
  }
  if (p.year) qb = qb.eq("creation_year", p.year);
  if (p.type) qb = qb.eq("artwork_type", p.type);
  if (p.featured) qb = qb.eq("featured", true);
  if (p.community) qb = qb.not("creator_id", "is", null);
  if (p.creatorId) qb = qb.eq("creator_id", p.creatorId);
  const q = clean(p.q).replace(/^#/, "");
  if (q) qb = qb.or(`title.ilike.%${q}%,creator_name.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q.replace(/ /g, "-")}}`);

  if (p.sort === "random") {
    // random order over (up to) 500 matches, stable per seed, paginated in memory
    const { data, count } = await qb.order("created_at", { ascending: false }).limit(500);
    const list = shuffle((data ?? []).map(mapArtwork), p.seed ?? 1);
    return { items: list.slice((page - 1) * pageSize, page * pageSize), total: count ?? list.length, page, pageSize };
  }
  if (p.sort === "oldest") qb = qb.order("created_at", { ascending: true });
  else if (p.sort === "popular") qb = qb.order("favorites_count", { ascending: false }).order("views", { ascending: false }).order("created_at", { ascending: false });
  else if (p.sort === "favorited") qb = qb.order("favorites_count", { ascending: false }).order("created_at", { ascending: false });
  else qb = qb.order("created_at", { ascending: false });

  const { data, count } = await qb.range((page - 1) * pageSize, page * pageSize - 1);
  return { items: (data ?? []).map(mapArtwork), total: count ?? 0, page, pageSize };
}

export async function getArtwork(slug: string): Promise<Artwork | null> {
  const sb = await supabaseServer();
  if (!sb) return demoArtworks.find((a) => a.slug === slug) ?? null;
  const { data } = await sb.from("artworks").select(ARTWORK_COLUMNS).eq("slug", slug).maybeSingle();
  return data ? mapArtwork(data) : null;
}

export async function getRelated(a: Artwork, limit = 6): Promise<Artwork[]> {
  const sameCat = await queryArtworks({ category: a.category?.slug, sort: "popular", pageSize: 30 });
  const scored = sameCat.items
    .filter((x) => x.id !== a.id)
    .map((x) => ({ x, s: x.tags.filter((t) => a.tags.includes(t) && t !== "sample").length }))
    .sort((p, q) => q.s - p.s);
  return scored.slice(0, limit).map((r) => r.x);
}

/** neighbours by upload date (for keyboard navigation on detail pages) */
export async function getNeighbours(a: Artwork) {
  const sb = await supabaseServer();
  if (!sb) {
    const list = sortArtworks(demoArtworks, "latest");
    const i = list.findIndex((x) => x.id === a.id);
    return { prev: list[i - 1]?.slug ?? null, next: list[i + 1]?.slug ?? null };
  }
  const [{ data: newer }, { data: older }] = await Promise.all([
    sb.from("artworks").select("slug").eq("status", "approved").gt("created_at", a.created_at).order("created_at", { ascending: true }).limit(1),
    sb.from("artworks").select("slug").eq("status", "approved").lt("created_at", a.created_at).order("created_at", { ascending: false }).limit(1),
  ]);
  return { prev: newer?.[0]?.slug ?? null, next: older?.[0]?.slug ?? null };
}

export async function getArtworkCollections(a: Artwork): Promise<{ slug: string; title: string }[]> {
  const sb = await supabaseServer();
  if (!sb) return seed.collections.filter((c) => c.artworks.includes(a.slug)).map((c) => ({ slug: c.slug, title: c.title }));
  const { data } = await sb.from("collection_artworks").select("collection:collections(slug,title)").eq("artwork_id", a.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => r.collection).filter(Boolean);
}

export async function getRandomSlug(): Promise<string | null> {
  const sb = await supabaseServer();
  if (!sb) return demoArtworks[Math.floor(Math.random() * demoArtworks.length)]?.slug ?? null;
  const { count } = await sb.from("artworks").select("id", { count: "exact", head: true }).eq("status", "approved");
  if (!count) return null;
  const off = Math.floor(Math.random() * count);
  const { data } = await sb.from("artworks").select("slug").eq("status", "approved").order("created_at").range(off, off);
  return data?.[0]?.slug ?? null;
}

export async function getArtworkFilters(): Promise<{ years: number[]; types: string[] }> {
  const sb = supabasePublic();
  const rows = sb
    ? ((await sb.from("artworks").select("creation_year,artwork_type").eq("status", "approved")).data ?? [])
    : demoArtworks;
  const years = [...new Set(rows.map((r) => r.creation_year).filter((y): y is number => !!y))].sort((a, b) => b - a);
  const types = [...new Set(rows.map((r) => r.artwork_type).filter((t): t is string => !!t))].sort();
  return { years, types };
}

/* ---------------------------------------------------------------- collections */
export const getCollections = cache(async (): Promise<Collection[]> => {
  const sb = supabasePublic();
  if (!sb)
    return seed.collections.map((c) => ({
      id: c.slug,
      slug: c.slug,
      title: c.title,
      description: c.description,
      cover_image: demoArtworks.find((a) => a.slug === c.cover)?.image_url ?? null,
      display_order: c.display_order,
      count: c.artworks.length,
    }));
  const { data } = await sb.from("collections").select("id,slug,title,description,cover_image,display_order,collection_artworks(artwork:artworks(status))").order("display_order");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map(({ collection_artworks, ...c }: any) => ({
    ...c,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    count: (collection_artworks ?? []).filter((l: any) => l.artwork?.status === "approved").length,
  }));
});

export async function getCollection(slug: string) {
  return (await getCollections()).find((c) => c.slug === slug) ?? null;
}

/* ---------------------------------------------------------------- community */
export async function getCreatorLeaderboard(limit = 10) {
  const sb = supabasePublic();
  if (!sb) return [] as { id: string; username: string; avatar_url: string | null; artworks: number; favorites: number }[];
  const { data } = await sb.from("creator_leaderboard").select("*").order("favorites", { ascending: false }).order("artworks", { ascending: false }).limit(limit);
  return data ?? [];
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const sb = supabasePublic();
  if (!sb) return null;
  const { data } = await sb.from("users").select("id,username,avatar_url,bio,role,suspended,created_at").eq("username", username).maybeSingle();
  return data;
}

/* ---------------------------------------------------------------- stats (real counts only) */
export async function getPublicStats() {
  const sb = supabasePublic();
  if (!sb) return { artworks: demoArtworks.length, categories: seed.categories.length, collections: seed.collections.length };
  const [a, c, k] = await Promise.all([
    sb.from("artworks").select("id", { count: "exact", head: true }).eq("status", "approved"),
    sb.from("categories").select("id", { count: "exact", head: true }),
    sb.from("collections").select("id", { count: "exact", head: true }),
  ]);
  return { artworks: a.count ?? 0, categories: c.count ?? 0, collections: k.count ?? 0 };
}

/* ---------------------------------------------------------------- settings */
export const defaultSettings: SiteSettings = {
  siteName: siteConfig.brand.wordmark,
  heroTitle: "EVERY PEPE\nHAS A STORY.",
  heroSubtitle: "Explore the culture, creativity, and endless evolution of Pepe through an ever-growing collection of internet art.",
  metaDescription: siteConfig.brand.description,
  xUrl: siteConfig.social.x,
  logoUrl: "",
  uploadMaxMb: siteConfig.uploads.maxMb,
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const sb = supabasePublic();
  if (!sb) return defaultSettings;
  const { data } = await sb.from("site_settings").select("key,value");
  const s = { ...defaultSettings } as Record<string, unknown>;
  (data ?? []).forEach((r) => {
    if (r.key in s && r.value !== null && r.value !== "") s[r.key] = r.value;
  });
  return s as SiteSettings;
});

/* ---------------------------------------------------------------- current user */
export async function getCurrentUser(): Promise<{ id: string; email: string | null; profile: Profile | null } | null> {
  const sb = await supabaseServer();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await sb.from("users").select("id,username,avatar_url,bio,role,suspended,created_at").eq("id", data.user.id).maybeSingle();
  return { id: data.user.id, email: data.user.email ?? null, profile };
}

export { isLive };
