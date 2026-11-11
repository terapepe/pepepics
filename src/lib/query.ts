import type { ArtworkQuery, SortKey } from "@/lib/types";

const SORTS: SortKey[] = ["latest", "oldest", "popular", "favorited", "random"];

/** Parse explore filters from URL search params (shared by page + API). */
export function parseArtworkQuery(sp: URLSearchParams | Record<string, string | string[] | undefined>): ArtworkQuery {
  const get = (k: string) => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const sort = get("sort") as SortKey | undefined;
  const year = Number(get("year"));
  const page = Number(get("page"));
  const seed = Number(get("seed"));
  return {
    q: get("q")?.slice(0, 80) || undefined,
    category: get("category") || undefined,
    collection: get("collection") || undefined,
    sort: sort && SORTS.includes(sort) ? sort : "latest",
    year: Number.isInteger(year) && year > 1999 ? year : undefined,
    type: get("type") || undefined,
    featured: get("featured") === "1" || undefined,
    community: get("community") === "1" || undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    seed: Number.isInteger(seed) ? seed : undefined,
    ids: get("ids") ? get("ids")!.split(",").slice(0, 200) : undefined,
    pageSize: 24,
  };
}
