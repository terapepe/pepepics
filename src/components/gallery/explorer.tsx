"use client";

import { Masonry } from "@/components/masonry";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { ArtworkCard, ArtworkCardSkeleton } from "@/components/artwork-card";
import { EmptyState } from "@/components/section";
import type { Artwork, ArtworkQuery, Category, Page } from "@/lib/types";

const SORTS = [
  { v: "latest", l: "Latest" },
  { v: "oldest", l: "Oldest" },
  { v: "popular", l: "Most Popular" },
  { v: "favorited", l: "Most Favorited" },
  { v: "random", l: "Random" },
];

function toParams(q: ArtworkQuery) {
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q);
  if (q.category) p.set("category", q.category);
  if (q.collection) p.set("collection", q.collection);
  if (q.sort && q.sort !== "latest") p.set("sort", q.sort);
  if (q.year) p.set("year", String(q.year));
  if (q.type) p.set("type", q.type);
  if (q.featured) p.set("featured", "1");
  if (q.community) p.set("community", "1");
  if (q.sort === "random" && q.seed) p.set("seed", String(q.seed));
  return p;
}

export function Explorer({
  initial,
  query,
  categories,
  years,
  types,
  lockCollection,
  hideFilters = false,
}: {
  initial: Page<Artwork>;
  query: ArtworkQuery;
  categories: Pick<Category, "slug" | "name">[];
  years: number[];
  types: string[];
  lockCollection?: string;
  hideFilters?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initial.total);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState(query.q ?? "");
  const [panel, setPanel] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  // reset when server sends new initial data (filters changed)
  useEffect(() => {
    setItems(initial.items);
    setTotal(initial.total);
    setPage(1);
  }, [initial]);

  const update = useCallback(
    (patch: Partial<ArtworkQuery>) => {
      const next = { ...query, ...patch, collection: lockCollection ?? query.collection };
      if (patch.sort === "random") next.seed = Math.floor(Math.random() * 1e6);
      const p = toParams(next);
      if (lockCollection) p.delete("collection");
      startTransition(() => router.replace(`${pathname}${p.size ? `?${p}` : ""}`, { scroll: false }));
    },
    [query, router, pathname, lockCollection],
  );

  // debounce text search
  useEffect(() => {
    if ((query.q ?? "") === text) return;
    const t = setTimeout(() => update({ q: text || undefined }), 350);
    return () => clearTimeout(t);
  }, [text, query.q, update]);

  const hasMore = items.length < total;
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const p = toParams({ ...query, collection: lockCollection ?? query.collection });
    p.set("page", String(page + 1));
    try {
      const r = await fetch(`/api/artworks?${p}`);
      const j: Page<Artwork> = await r.json();
      setItems((prev) => [...prev, ...j.items.filter((x) => !prev.some((y) => y.id === x.id))]);
      setPage(page + 1);
      setTotal(j.total);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, query, page, lockCollection]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  const activeCount = [query.year, query.type, query.featured, query.community].filter(Boolean).length;

  return (
    <div>
      {!hideFilters && (
        <div className="sticky top-16 z-30 -mx-4 mb-8 border-b border-line/60 bg-bg/85 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4 md:top-[76px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1 lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" />
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search title, creator, tags…" className="input h-10 pl-10" aria-label="Search the gallery" />
              {text && (
                <button onClick={() => setText("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-mute hover:text-ink" aria-label="Clear search"><X className="size-4" /></button>
              )}
            </label>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-1 lg:px-0" role="tablist" aria-label="Categories">
              <button role="tab" aria-selected={!query.category} onClick={() => update({ category: undefined })} className={`chip h-9 ${!query.category ? "chip-active" : ""}`}>All</button>
              {categories.map((c) => (
                <button key={c.slug} role="tab" aria-selected={query.category === c.slug} onClick={() => update({ category: c.slug })} className={`chip h-9 ${query.category === c.slug ? "chip-active" : ""}`}>
                  {c.name.replace(" Pepe", "")}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={query.sort ?? "latest"} onChange={(e) => update({ sort: e.target.value as ArtworkQuery["sort"] })} className="input h-10 w-auto flex-1 cursor-pointer pr-8 text-sm lg:flex-none" aria-label="Sort">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
              <button onClick={() => setPanel((v) => !v)} className={`chip h-10 ${panel || activeCount ? "border-pepe/60 text-ink" : ""}`} aria-expanded={panel}>
                <SlidersHorizontal className="size-4" /> Filters {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-pepe text-[11px] font-bold text-bg">{activeCount}</span>}
              </button>
            </div>
          </div>
          {panel && (
            <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2 lg:grid-cols-4">
              <select value={query.year ?? ""} onChange={(e) => update({ year: e.target.value ? Number(e.target.value) : undefined })} className="input h-10 text-sm" aria-label="Creation year">
                <option value="">Any creation year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={query.type ?? ""} onChange={(e) => update({ type: e.target.value || undefined })} className="input h-10 text-sm" aria-label="Artwork type">
                <option value="">Any artwork type</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="chip h-10 cursor-pointer justify-between">
                Featured only <input type="checkbox" checked={!!query.featured} onChange={(e) => update({ featured: e.target.checked || undefined })} className="accent-[#A6E56D]" />
              </label>
              <label className="chip h-10 cursor-pointer justify-between">
                Community submissions <input type="checkbox" checked={!!query.community} onChange={(e) => update({ community: e.target.checked || undefined })} className="accent-[#A6E56D]" />
              </label>
              {years.length === 0 && <p className="text-[12px] text-mute sm:col-span-2 lg:col-span-4">Creation year appears only for artworks with a verified year.</p>}
            </div>
          )}
        </div>
      )}

      <div className="mb-5 flex items-center gap-3 text-sm text-mute" aria-live="polite">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        <span>{total} artwork{total === 1 ? "" : "s"}</span>
        {(query.q || query.category || activeCount > 0) && !hideFilters && (
          <button className="text-pepe hover:underline" onClick={() => { setText(""); update({ q: undefined, category: undefined, year: undefined, type: undefined, featured: undefined, community: undefined }); }}>
            Reset filters
          </button>
        )}
      </div>

      {items.length === 0 && !pending ? (
        <EmptyState title="No Pepe found" text={query.q ? `Nothing matches “${query.q}”. Try a different word, tag or category.` : "No artwork matches these filters yet."} />
      ) : (
        <Masonry className={`transition-opacity ${pending ? "opacity-50" : ""}`}>
          {items.map((a, i) => <ArtworkCard key={a.id} a={a} data-ratio={(a.height ?? 750) / (a.width ?? 600)} priority={i < 4} />)}
          {loadingMore && [0, 1, 2, 3].map((i) => <ArtworkCardSkeleton key={`s${i}`} i={i} />)}
        </Masonry>
      )}
      <div ref={sentinel} className="h-px" />
      {hasMore && !loadingMore && (
        <div className="mt-6 text-center">
          <button onClick={loadMore} className="btn-ghost">Load more</button>
        </div>
      )}
    </div>
  );
}
