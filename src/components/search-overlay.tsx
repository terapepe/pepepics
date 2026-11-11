"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Layers, Loader2, Search, TrendingUp, X } from "lucide-react";
import { useSearch } from "@/components/providers";
import { siteConfig } from "@/config/site";
import type { Category } from "@/lib/types";

type Result = {
  artworks: { slug: string; title: string; thumb: string; category: string | null; creator: string | null }[];
  collections: { slug: string; title: string; count: number }[];
  creators: { username: string; artworks: number }[];
};
const RECENT_KEY = "pepepics:recent-searches";

export function SearchOverlay({ categories }: { categories: Pick<Category, "slug" | "name">[] }) {
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      setRecent([]);
    }
    setTimeout(() => input.current?.focus(), 30);
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", k);
    };
  }, [open, setOpen]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setRes(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        setRes(await r.json());
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const go = (term: string) => {
    const v = term.trim();
    if (!v) return;
    const next = [v, ...recent.filter((r) => r !== v)].slice(0, 6);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
    setOpen(false);
    setQ("");
    router.push(`/explore?q=${encodeURIComponent(v)}`);
  };
  const close = () => {
    setOpen(false);
    setQ("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Search">
          <div className="absolute inset-0 bg-bg/90 backdrop-blur-xl" onClick={close} />
          <motion.div initial={{ y: -16 }} animate={{ y: 0 }} className="container-x relative max-w-3xl pt-[10vh]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(q);
              }}
              className="flex items-center gap-3 border-b-2 border-pepe pb-3"
            >
              <Search className="size-6 text-pepe" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Pepe artwork, collections, creators..."
                className="h-display w-full bg-transparent text-2xl font-medium tracking-tight outline-none placeholder:text-mute/60 md:text-4xl"
                aria-label="Search"
              />
              {loading && <Loader2 className="size-5 animate-spin text-mute" />}
              <button type="button" onClick={close} className="icon-btn" aria-label="Close search"><X className="size-5" /></button>
            </form>
            <div className="mt-2 flex gap-3 text-[12px] text-mute"><kbd className="rounded border border-line px-1.5">Enter</kbd> view results <kbd className="rounded border border-line px-1.5">Esc</kbd> close</div>

            <div className="mt-8 max-h-[62vh] space-y-8 overflow-y-auto pb-10">
              {res ? (
                <>
                  {res.artworks.length + res.collections.length + res.creators.length === 0 && (
                    <p className="text-mute">No matches for “{q}”. Try another word or browse a category below.</p>
                  )}
                  {res.artworks.length > 0 && (
                    <div>
                      <div className="label mb-3 text-mute">Artwork</div>
                      <div className="grid gap-1">
                        {res.artworks.map((a) => (
                          <Link key={a.slug} href={`/artwork/${a.slug}`} onClick={close} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
                            <Image src={a.thumb} alt="" width={44} height={44} className="size-11 rounded-lg object-cover" unoptimized={a.thumb.endsWith(".svg")} />
                            <div className="min-w-0">
                              <div className="truncate font-medium">{a.title}</div>
                              <div className="truncate text-[12px] text-mute">{[a.category, a.creator].filter(Boolean).join(" · ")}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button onClick={() => go(q)} className="mt-2 text-sm text-pepe hover:underline">See all results →</button>
                    </div>
                  )}
                  {res.collections.length > 0 && (
                    <div>
                      <div className="label mb-3 text-mute">Collections</div>
                      <div className="flex flex-wrap gap-2">
                        {res.collections.map((c) => (
                          <Link key={c.slug} href={`/collections/${c.slug}`} onClick={close} className="chip"><Layers className="size-3.5" /> {c.title} <span className="text-mute">{c.count}</span></Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {res.creators.length > 0 && (
                    <div>
                      <div className="label mb-3 text-mute">Creators</div>
                      <div className="flex flex-wrap gap-2">
                        {res.creators.map((c) => (
                          <Link key={c.username} href={`/creator/${c.username}`} onClick={close} className="chip">@{c.username}</Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {recent.length > 0 && (
                    <div>
                      <div className="label mb-3 flex items-center justify-between text-mute">
                        <span>Recent searches</span>
                        <button
                          className="normal-case tracking-normal hover:text-ink"
                          onClick={() => {
                            localStorage.removeItem(RECENT_KEY);
                            setRecent([]);
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">{recent.map((r) => <button key={r} onClick={() => go(r)} className="chip"><Clock className="size-3.5" /> {r}</button>)}</div>
                    </div>
                  )}
                  <div>
                    <div className="label mb-3 text-mute">Popular searches</div>
                    <div className="flex flex-wrap gap-2">{siteConfig.popularSearches.map((r) => <button key={r} onClick={() => go(r)} className="chip"><TrendingUp className="size-3.5" /> {r}</button>)}</div>
                  </div>
                  <div>
                    <div className="label mb-3 text-mute">Categories</div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {categories.map((c) => (
                        <Link key={c.slug} href={`/explore?category=${c.slug}`} onClick={close} className="rounded-xl border border-line bg-card px-4 py-3 text-sm font-medium hover:border-pepe/60 hover:text-pepe">{c.name}</Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
