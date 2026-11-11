"use client";

import Link from "next/link";
import { Masonry } from "@/components/masonry";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { ArtworkCard, ArtworkCardSkeleton } from "@/components/artwork-card";
import { useAuth, useFavorites } from "@/components/providers";
import { EmptyState } from "@/components/section";
import { isLive } from "@/lib/env";
import type { Artwork } from "@/lib/types";

export function FavoritesView() {
  const { entries, ready, toggle } = useFavorites();
  const { user } = useAuth();
  const [arts, setArts] = useState<Artwork[] | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const key = entries.map((e) => e.id).sort().join(",");

  useEffect(() => {
    if (!ready) return;
    if (!key) return setArts([]);
    fetch(`/api/artworks?ids=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((j) => setArts(j.items ?? []))
      .catch(() => setArts([]));
  }, [key, ready]);

  const list = useMemo(() => {
    if (!arts) return [];
    const at = new Map(entries.map((e) => [e.id, e.at]));
    return [...arts].filter((a) => at.has(a.id)).sort((a, b) => (at.get(b.id) ?? "").localeCompare(at.get(a.id) ?? "") * (sort === "newest" ? 1 : -1));
  }, [arts, entries, sort]);

  if (!ready || arts === null)
    return <div className="masonry">{Array.from({ length: 8 }, (_, i) => <ArtworkCardSkeleton key={i} i={i} />)}</div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-mute">
          {list.length} saved artwork{list.length === 1 ? "" : "s"} ·{" "}
          {user ? "synced to your account" : isLive ? <>saved in this browser — <Link href="/login?next=/favorites" className="text-pepe hover:underline">log in</Link> to sync</> : "saved in this browser"}
        </p>
        <div className="flex gap-2">
          {(["newest", "oldest"] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)} className={`chip ${sort === s ? "chip-active" : ""}`}>{s === "newest" ? "Newest" : "Oldest"}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No favorites yet" text="Tap the heart on any artwork to save it here." action={<Link href="/explore" className="btn-primary mt-2">Explore Gallery</Link>} />
      ) : (
        <Masonry>
          {list.map((a) => (
            <div key={a.id} className="relative" data-ratio={(a.height ?? 750) / (a.width ?? 600)}>
              <ArtworkCard a={a} />
              <button onClick={() => toggle(a.id, a.title)} className="mt-1 flex items-center gap-1.5 px-1 text-[12px] text-mute hover:text-red-400">
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
}
