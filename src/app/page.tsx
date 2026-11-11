import { Masonry } from "@/components/masonry";
import Link from "next/link";
import { Upload } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { CategoryCard } from "@/components/cards";
import { Hero } from "@/components/home/hero";
import { RandomPepeButton } from "@/components/home/random-pepe";
import { SectionHeader } from "@/components/section";
import { TokenPanel } from "@/components/token";
import { LogoMark } from "@/components/logo";
import { getCategories, getPublicStats, getSettings, queryArtworks } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, featured, trending, latest, categories, stats] = await Promise.all([
    getSettings(),
    queryArtworks({ featured: true, sort: "popular", pageSize: 6 }),
    queryArtworks({ sort: "popular", pageSize: 8 }),
    queryArtworks({ sort: "latest", pageSize: 10 }),
    getCategories(),
    getPublicStats(),
  ]);
  const heroArt = [...featured.items, ...latest.items].filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);

  return (
    <>
      <Hero title={settings.heroTitle} subtitle={settings.heroSubtitle} art={heroArt} stats={stats} />

      {featured.items.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <SectionHeader eyebrow="Curated" title="FEATURED PEPE" subtitle="A selection of artwork worth discovering." href="/explore?featured=1" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
            {featured.items.map((a, i) => (
              <ArtworkCard key={a.id} a={a} ratio="4/5" sizes="(min-width:768px) 33vw, 50vw" priority={i < 2} />
            ))}
          </div>
        </section>
      )}

      <section className="container-x py-16 md:py-20">
        <SectionHeader eyebrow="8 worlds" title="EXPLORE THE PEPEVERSE" subtitle="Pick a corner of the internet and dive in." href="/categories" cta="All categories" />
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {categories.map((c) => <CategoryCard key={c.id} c={c} />)}
        </div>
      </section>

      <section className="border-y border-line bg-bg2/60 py-16 md:py-20">
        <div className="container-x">
          <SectionHeader eyebrow="Ranked by favorites & views" title="TRENDING NOW" href="/explore?sort=popular" />
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {trending.items.map((a, i) => (
              <div key={a.id} className="w-[70%] shrink-0 snap-start sm:w-auto">
                <ArtworkCard a={a} trending rank={i + 1} ratio="4/5" sizes="(min-width:1024px) 25vw, 70vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 md:py-20">
        <SectionHeader eyebrow="Just approved" title="FRESH FROM THE GALLERY" href="/explore?sort=latest" />
        <Masonry>
          {latest.items.map((a) => <ArtworkCard key={a.id} a={a} data-ratio={(a.height ?? 750) / (a.width ?? 600)} />)}
        </Masonry>
      </section>

      <section className="container-x py-10">
        <div className="relative overflow-hidden rounded-[32px] bg-pepe px-6 py-14 text-bg md:px-14 md:py-20">
          <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.15] md:right-10 md:top-1/2 md:-translate-y-1/2 md:opacity-100">
            <div className="animate-[spin_30s_linear_infinite]"><LogoMark className="size-56 md:size-72" /></div>
          </div>
          <div className="relative max-w-2xl">
            <div className="label mb-4">Random discovery</div>
            <h2 className="h-display text-[40px] md:text-[72px]">CAN&apos;T DECIDE? MEET A RANDOM PEPE.</h2>
            <div className="mt-8">
              <RandomPepeButton className="btn h-12 bg-bg px-7 text-pepe hover:bg-black" />
            </div>
          </div>
        </div>
      </section>

      <TokenPanel />

      <section className="container-x pb-6">
        <div className="grid gap-8 rounded-[32px] border border-line bg-card p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-14">
          <div>
            <div className="label mb-4 text-pepe">Community</div>
            <h2 className="h-display text-[40px] md:text-[64px]">YOUR PEPE BELONGS HERE.</h2>
            <p className="mt-4 max-w-lg text-mute">Have an interesting Pepe creation? Share it with the world and become part of the gallery.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link href="/submit" className="btn-primary h-12 px-7"><Upload className="size-4" /> Submit Your Artwork</Link>
            <Link href="/community" className="text-sm text-mute hover:text-pepe">See community creations →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
