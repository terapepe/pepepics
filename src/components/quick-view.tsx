"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { ArtworkImage } from "@/components/artwork-card";
import { FavoriteButton } from "@/components/favorite-button";
import type { Artwork } from "@/lib/types";

const Ctx = createContext<(a: Artwork) => void>(() => {});
export const useQuickView = () => useContext(Ctx);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [a, setA] = useState<Artwork | null>(null);
  const open = useCallback((x: Artwork) => setA(x), []);
  useEffect(() => {
    if (!a) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setA(null);
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [a]);
  return (
    <Ctx.Provider value={open}>
      {children}
      <AnimatePresence>
        {a && (
          <motion.div className="fixed inset-0 z-[60] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={a.title}>
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setA(null)} />
            <motion.div initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }} className="relative grid max-h-[90dvh] w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-bg2 md:grid-cols-[1.4fr_1fr]">
              <div className="grid max-h-[60dvh] place-items-center overflow-hidden bg-black md:max-h-[90dvh]">
                <ArtworkImage a={a} sizes="(min-width:768px) 60vw, 100vw" className="max-h-[60dvh] w-full md:max-h-[90dvh] [&_img]:object-contain" />
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto p-6">
                <button onClick={() => setA(null)} className="icon-btn absolute right-3 top-3 bg-black/40" aria-label="Close"><X className="size-5" /></button>
                {a.category && <span className="label text-pepe">{a.category.name}</span>}
                <h2 className="h-display text-3xl">{a.title}</h2>
                {a.creator_name && <p className="text-sm text-mute">by {a.creator_name}</p>}
                {a.description && <p className="line-clamp-5 text-[15px] leading-relaxed text-ink/80">{a.description}</p>}
                <div className="flex flex-wrap gap-1.5">{a.tags.map((t) => <Link key={t} href={`/explore?q=${encodeURIComponent(t)}`} className="chip h-7 px-2.5 text-[12px]" onClick={() => setA(null)}>#{t}</Link>)}</div>
                <div className="mt-auto flex gap-2 pt-2">
                  <Link href={`/artwork/${a.slug}`} onClick={() => setA(null)} className="btn-primary flex-1">View details <ArrowRight className="size-4" /></Link>
                  <FavoriteButton id={a.id} title={a.title} className="btn-ghost px-4" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
