import type { Metadata } from "next";
import { Explorer } from "@/components/gallery/explorer";
import { getArtworkFilters, getCategories, getCategory, queryArtworks } from "@/lib/data";
import { parseArtworkQuery } from "@/lib/query";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = parseArtworkQuery(await searchParams);
  const cat = q.category ? await getCategory(q.category) : null;
  return {
    title: cat ? `${cat.name} — Explore` : "Explore the Gallery",
    description: cat?.description ?? "Discover thousands of Pepe creations from across internet culture.",
    alternates: { canonical: cat ? `/explore?category=${cat.slug}` : "/explore" },
  };
}

export default async function ExplorePage({ searchParams }: Props) {
  const query = parseArtworkQuery(await searchParams);
  const [initial, categories, filters, cat] = await Promise.all([
    queryArtworks(query),
    getCategories(),
    getArtworkFilters(),
    query.category ? getCategory(query.category) : Promise.resolve(null),
  ]);
  return (
    <div className="container-x pb-10 pt-10 md:pt-16">
      <header className="mb-10 max-w-3xl">
        <div className="label mb-4 text-pepe">{cat ? "Category" : "Gallery"}</div>
        <h1 className="h-display text-[48px] md:text-[88px]">{cat ? cat.name.toUpperCase() : "EXPLORE THE GALLERY"}</h1>
        <p className="mt-4 text-lg text-mute">{cat?.description ?? "Discover thousands of Pepe creations from across internet culture."}</p>
      </header>
      <Explorer initial={initial} query={query} categories={categories} years={filters.years} types={filters.types} />
    </div>
  );
}
