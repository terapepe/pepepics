"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, Flame, Heart } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { useQuickView } from "@/components/quick-view";
import type { Artwork } from "@/lib/types";

export function ArtworkImage({ a, sizes, priority = false, className = "", ratio }: { a: Artwork; sizes: string; priority?: boolean; className?: string; ratio?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const w = a.width ?? 600;
  const h = a.height ?? 750;
  if (failed)
    return (
      <div className={`grid place-items-center bg-card text-center text-sm text-mute ${className}`} style={{ aspectRatio: `${w}/${h}` }}>
        Image unavailable
      </div>
    );
  return (
    <div className={`relative overflow-hidden bg-card ${className}`} style={{ aspectRatio: ratio ?? `${w}/${h}` }}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-white/[0.03]" />}
      <Image
        src={a.thumbnail_url || a.image_url}
        alt={a.title}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={a.image_url.endsWith(".svg") || a.image_url.endsWith(".gif")}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`object-cover transition duration-700 ease-out-soft ${loaded ? "opacity-100" : "opacity-0"} group-hover:scale-[1.04]`}
      />
    </div>
  );
}

export function ArtworkCard({
  a,
  rank,
  trending = false,
  sizes = "(min-width:1500px) 20vw, (min-width:1100px) 25vw, (min-width:768px) 33vw, 50vw",
  priority = false,
  ratio,
}: {
  a: Artwork;
  ratio?: string;
  "data-ratio"?: number;
  rank?: number;
  trending?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const quick = useQuickView();
  return (
    <article className="group">
      <Link href={`/artwork/${a.slug}`} className="relative block overflow-hidden rounded-2xl border border-line/60" aria-label={a.title}>
        <ArtworkImage a={a} sizes={sizes} priority={priority} ratio={ratio} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {trending && (
            <span className="label flex items-center gap-1 rounded-full bg-pepe px-2.5 py-1 text-[10px] text-bg">
              <Flame className="size-3" /> {rank ? `#${rank}` : "Trending"}
            </span>
          )}
          {a.featured && !trending && <span className="label rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-pepe backdrop-blur">Featured</span>}
        </div>
        <div className="absolute right-3 top-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <FavoriteButton id={a.id} title={a.title} />
        </div>
        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-end justify-between gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="font-display text-[15px] font-semibold leading-tight">{a.title}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              quick(a);
            }}
            className="label flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[10px] text-bg hover:bg-pepe"
          >
            <Eye className="size-3" /> Quick view
          </button>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-3 px-1 pt-2.5">
        <div className="min-w-0">
          <Link href={`/artwork/${a.slug}`} className="block truncate text-[14px] font-medium hover:text-pepe">{a.title}</Link>
          <div className="mt-0.5 truncate text-[12px] text-mute">
            {a.category && (
              <Link href={`/explore?category=${a.category.slug}`} className="hover:text-pepe">{a.category.name}</Link>
            )}
            {a.creator_name && <> · {a.creator_username ? <Link href={`/creator/${a.creator_username}`} className="hover:text-ink">{a.creator_name}</Link> : a.creator_name}</>}
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 pt-0.5 text-[12px] text-mute" title="Favorites">
          <Heart className="size-3" /> {a.favorites_count}
        </span>
      </div>
    </article>
  );
}

export function ArtworkCardSkeleton({ i = 0 }: { i?: number }) {
  const ratios = ["3/4", "1/1", "2/3", "4/3", "4/5"];
  return (
    <div>
      <div className="skeleton" style={{ aspectRatio: ratios[i % ratios.length] }} />
      <div className="mt-3 h-3.5 w-2/3 rounded bg-card" />
      <div className="mt-2 h-3 w-1/3 rounded bg-card" />
    </div>
  );
}
