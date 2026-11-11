import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category, Collection } from "@/lib/types";

const isSvg = (u?: string | null) => !!u && u.endsWith(".svg");

export function CategoryCard({ c, large = false }: { c: Category; large?: boolean }) {
  return (
    <Link href={`/explore?category=${c.slug}`} className={`group relative block overflow-hidden rounded-2xl border border-line bg-card ${large ? "aspect-[4/5]" : "aspect-[4/5] md:aspect-[3/4]"}`}>
      {c.cover_image && (
        <Image src={c.cover_image} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" unoptimized={isSvg(c.cover_image)} className="object-cover transition duration-700 ease-out-soft group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-pepe/0 transition duration-300 group-hover:bg-pepe/10" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="label text-pepe">{c.count} artworks</div>
        <h3 className="h-display mt-1.5 text-2xl md:text-[28px]">{c.name}</h3>
        <p className="mt-1.5 line-clamp-2 max-h-0 text-[13px] leading-snug text-ink/80 opacity-0 transition-all duration-300 group-hover:max-h-12 group-hover:opacity-100">{c.description}</p>
      </div>
      <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/40 text-ink opacity-0 backdrop-blur transition group-hover:opacity-100">
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}

export function CollectionCard({ c }: { c: Collection }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-line bg-card transition hover:border-pepe/50">
      <Link href={`/collections/${c.slug}`} className="relative block aspect-[16/10] overflow-hidden" tabIndex={-1}>
        {c.cover_image && (
          <Image src={c.cover_image} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" unoptimized={isSvg(c.cover_image)} className="object-cover transition duration-700 ease-out-soft group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </Link>
      <div className="flex flex-col gap-3 p-5 pt-2">
        <div className="label text-pepe">{c.count} artworks</div>
        <h3 className="h-display text-2xl">{c.title}</h3>
        <p className="line-clamp-2 text-[14px] text-mute">{c.description}</p>
        <Link href={`/collections/${c.slug}`} className="btn-ghost btn-sm mt-1 self-start">View Collection</Link>
      </div>
    </article>
  );
}
