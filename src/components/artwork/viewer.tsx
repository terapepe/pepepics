"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import type { Artwork } from "@/lib/types";

/** Large image + fullscreen viewer with zoom and keyboard navigation (←/→ prev/next, F fullscreen, +/- zoom, Esc close). */
export function ArtworkViewer({ a, prev, next }: { a: Artwork; prev: string | null; next: string | null }) {
  const router = useRouter();
  const [full, setFull] = useState(false);
  const [zoom, setZoom] = useState(1);
  const svg = a.image_url.endsWith(".svg") || a.image_url.endsWith(".gif");

  useEffect(() => {
    fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: a.slug }) }).catch(() => {});
  }, [a.slug]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "Escape") return setFull(false);
      if (e.key === "f" || e.key === "F") return setFull((v) => !v);
      if (e.key === "+" || e.key === "=") return setZoom((z) => Math.min(4, z + 0.5));
      if (e.key === "-") return setZoom((z) => Math.max(1, z - 0.5));
      if (e.key === "ArrowLeft" && prev) router.push(`/artwork/${prev}`);
      if (e.key === "ArrowRight" && next) router.push(`/artwork/${next}`);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [prev, next, router]);

  useEffect(() => {
    document.body.style.overflow = full ? "hidden" : "";
    if (!full) setZoom(1);
    return () => {
      document.body.style.overflow = "";
    };
  }, [full]);

  return (
    <>
      <div className="group relative overflow-hidden rounded-3xl border border-line bg-[#070807]">
        <button onClick={() => setFull(true)} className="relative block w-full cursor-zoom-in" aria-label="Open fullscreen viewer">
          <div className="relative mx-auto max-h-[78vh]" style={{ aspectRatio: `${a.width ?? 600}/${a.height ?? 750}` }}>
            <Image src={a.image_url} alt={a.title} fill priority sizes="(min-width:1024px) 60vw, 100vw" unoptimized={svg} className="object-contain" />
          </div>
        </button>
        <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <button onClick={() => setFull(true)} className="icon-btn bg-black/50 backdrop-blur" aria-label="Fullscreen (F)"><Maximize2 className="size-4" /></button>
        </div>
        <div className="absolute inset-x-3 bottom-3 flex justify-between">
          {prev ? <Link href={`/artwork/${prev}`} className="icon-btn bg-black/50 backdrop-blur" aria-label="Previous artwork (←)"><ChevronLeft className="size-5" /></Link> : <span />}
          {next ? <Link href={`/artwork/${next}`} className="icon-btn bg-black/50 backdrop-blur" aria-label="Next artwork (→)"><ChevronRight className="size-5" /></Link> : <span />}
        </div>
      </div>

      <AnimatePresence>
        {full && (
          <motion.div className="fixed inset-0 z-[80] bg-black/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${a.title} fullscreen`}>
            <div
              className="absolute inset-0 overflow-auto"
              onWheel={(e) => setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.002)))}
              onClick={(e) => e.target === e.currentTarget && setFull(false)}
            >
              <div className="grid min-h-full min-w-full place-items-center p-4 md:p-10" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }} onClick={(e) => e.target === e.currentTarget && setFull(false)}>
                <div className="relative h-full w-full" onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}>
                  <Image src={a.image_url} alt={a.title} fill sizes="100vw" unoptimized={svg} quality={90} className="object-contain" />
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-bg/80 p-1 backdrop-blur">
              <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="icon-btn size-9" aria-label="Zoom out (-)"><ZoomOut className="size-4" /></button>
              <span className="w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(4, z + 0.5))} className="icon-btn size-9" aria-label="Zoom in (+)"><ZoomIn className="size-4" /></button>
            </div>
            <button onClick={() => setFull(false)} className="icon-btn absolute right-4 top-4 bg-bg/80" aria-label="Close (Esc)"><X className="size-5" /></button>
            {prev && <Link href={`/artwork/${prev}`} className="icon-btn absolute left-4 top-1/2 -translate-y-1/2 bg-bg/80" aria-label="Previous"><ChevronLeft className="size-5" /></Link>}
            {next && <Link href={`/artwork/${next}`} className="icon-btn absolute right-4 top-1/2 -translate-y-1/2 bg-bg/80" aria-label="Next"><ChevronRight className="size-5" /></Link>}
            <div className="absolute inset-x-0 bottom-4 text-center text-[12px] text-mute">Scroll or double-click to zoom · ← → navigate · Esc to close</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
