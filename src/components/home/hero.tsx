"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { Artwork } from "@/lib/types";

const SLOTS = [
  { c: "left-[2%] top-[6%] w-[38%] z-20", d: 0, r: -3 },
  { c: "left-[44%] top-0 w-[30%] z-10", d: 0.6, r: 2 },
  { c: "right-0 top-[14%] w-[24%] z-20", d: 1.2, r: 4 },
  { c: "left-[18%] top-[52%] w-[28%] z-30", d: 0.3, r: 3 },
  { c: "left-[50%] top-[42%] w-[34%] z-20", d: 0.9, r: -2 },
  { c: "left-0 top-[66%] w-[17%] z-10", d: 1.5, r: -5 },
  { c: "right-[2%] top-[62%] w-[19%] z-30", d: 1.8, r: 5 },
];

export function Hero({ title, subtitle, art, stats }: { title: string; subtitle: string; art: Artwork[]; stats: { artworks: number; categories: number; collections: number } }) {
  const lines = title.split("\n");
  return (
    <section className="relative overflow-hidden">
      <div className="grain pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-40 top-20 size-[520px] rounded-full bg-pepe/[0.07] blur-[120px]" />
      <div className="container-x relative grid items-center gap-10 pb-16 pt-10 md:pt-16 lg:grid-cols-[1fr_1.05fr] lg:pb-24">
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label mb-6 flex items-center gap-3 text-pepe">
            <span className="h-px w-10 bg-pepe" /> The Internet&apos;s Home for Pepe Art
          </motion.div>
          <h1 className="h-display text-[clamp(56px,10vw,148px)]">
            {lines.map((l, i) => (
              <motion.span key={i} className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                {i === lines.length - 1 ? <span className="text-pepe">{l}</span> : l}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-7 max-w-md text-[17px] leading-relaxed text-mute">
            {subtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-9 flex flex-wrap gap-3">
            <Link href="/explore" className="btn-primary h-12 px-7">Explore Gallery <ArrowRight className="size-4" /></Link>
            <Link href="/collections" className="btn-ghost h-12 px-7">Discover Collections</Link>
          </motion.div>
          <dl className="mt-12 flex gap-10 border-t border-line pt-6">
            {[
              ["Artworks", stats.artworks],
              ["Categories", stats.categories],
              ["Collections", stats.collections],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="label text-mute">{k}</dt>
                <dd className="h-display mt-1 text-3xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative aspect-[1/0.92] w-full" aria-hidden="true">
          {art.slice(0, SLOTS.length).map((a, i) => {
            const s = SLOTS[i];
            return (
              <motion.div
                key={a.id}
                className={`absolute ${s.c}`}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                animate={{ opacity: 1, y: [0, -10, 0], rotate: s.r }}
                transition={{ opacity: { delay: 0.2 + i * 0.08 }, rotate: { delay: 0.2 + i * 0.08, duration: 0.8 }, y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: s.d } }}
              >
                <Link href={`/artwork/${a.slug}`} tabIndex={-1} className="group block overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] transition hover:border-pepe/70">
                  <div className="relative" style={{ aspectRatio: `${a.width ?? 600}/${a.height ?? 750}` }}>
                    <Image src={a.image_url} alt="" fill sizes="25vw" priority={i < 3} unoptimized={a.image_url.endsWith(".svg")} className="object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
          <div className="label absolute bottom-0 right-0 z-40 rounded-full border border-line bg-bg/80 px-3 py-1.5 text-mute backdrop-blur">
            ● Curated daily
          </div>
        </div>
      </div>
    </section>
  );
}
