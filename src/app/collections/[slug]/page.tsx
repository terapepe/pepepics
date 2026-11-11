import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Explorer } from "@/components/gallery/explorer";
import { getCollection, getCollections, queryArtworks } from "@/lib/data";
import { parseArtworkQuery } from "@/lib/query";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCollection((await params).slug);
  return c ? { title: c.title, description: c.description ?? undefined, alternates: { canonical: `/collections/${c.slug}` } } : { title: "Collection not found" };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = await getCollection(slug);
  if (!c) notFound();
  const query = { ...parseArtworkQuery(await searchParams), collection: slug };
  const [initial, all] = await Promise.all([queryArtworks(query), getCollections()]);
  const others = all.filter((x) => x.slug !== slug).slice(0, 6);
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        {c.cover_image && <Image src={c.cover_image} alt="" fill priority sizes="100vw" unoptimized={c.cover_image.endsWith(".svg")} className="object-cover opacity-25 blur-sm" />}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        <div className="container-x relative py-16 md:py-24">
          <Link href="/collections" className="label text-mute hover:text-pepe">← Collections</Link>
          <h1 className="h-display mt-5 text-[48px] md:text-[96px]">{c.title.toUpperCase()}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/80">{c.description}</p>
          <div className="label mt-6 text-pepe">{c.count} artworks</div>
        </div>
      </section>
      <div className="container-x pt-10">
        <Explorer initial={initial} query={query} categories={[]} years={[]} types={[]} lockCollection={slug} hideFilters />
        {others.length > 0 && (
          <div className="mt-16 flex flex-wrap items-center gap-2">
            <span className="label mr-2 text-mute">More collections</span>
            {others.map((o) => <Link key={o.slug} href={`/collections/${o.slug}`} className="chip">{o.title}</Link>)}
          </div>
        )}
      </div>
    </div>
  );
}
