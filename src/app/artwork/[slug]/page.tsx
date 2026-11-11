import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Eye, Heart } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { ArtworkActions } from "@/components/artwork/actions";
import { ArtworkViewer } from "@/components/artwork/viewer";
import { SectionHeader } from "@/components/section";
import { getArtwork, getArtworkCollections, getNeighbours, getRelated } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArtwork((await params).slug);
  if (!a) return { title: "Artwork not found" };
  const desc = a.description?.slice(0, 160) ?? `${a.title} — ${a.category?.name ?? "Pepe art"} on PEPE.PICS`;
  const img = a.image_url.endsWith(".svg") ? undefined : [{ url: a.image_url, width: a.width ?? undefined, height: a.height ?? undefined, alt: a.title }];
  return {
    title: a.title,
    description: desc,
    alternates: { canonical: `/artwork/${a.slug}` },
    openGraph: { title: a.title, description: desc, type: "article", images: img },
    twitter: { card: "summary_large_image", title: a.title, description: desc, images: img?.map((i) => i.url) },
  };
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default async function ArtworkPage({ params }: Props) {
  const a = await getArtwork((await params).slug);
  // RLS only returns non-approved artwork to its creator or an admin
  if (!a) notFound();
  const art = a;
  const [related, nav, collections] = await Promise.all([getRelated(art), getNeighbours(art), getArtworkCollections(art)]);

  const rows: [string, React.ReactNode][] = [
    ["Category", art.category ? <Link href={`/explore?category=${art.category.slug}`} className="hover:text-pepe">{art.category.name}</Link> : "—"],
    ["Creator", art.creator_username ? <Link href={`/creator/${art.creator_username}`} className="hover:text-pepe">{art.creator_name}</Link> : art.creator_name ?? "Unknown"],
    ...(art.creation_year ? [["Year created", String(art.creation_year)] as [string, React.ReactNode]] : []),
    ["Uploaded", fmt(art.created_at)],
    ["Type", art.artwork_type ?? "—"],
    ["License", art.license_type ?? "All rights reserved by the creator"],
    ["Source", art.source_url ? <a href={art.source_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 break-all hover:text-pepe">{new URL(art.source_url).hostname} <ExternalLink className="size-3" /></a> : "Original upload"],
  ];

  return (
    <div className="container-x pt-8 md:pt-12">
      <nav className="mb-6 text-sm text-mute" aria-label="Breadcrumb">
        <Link href="/explore" className="hover:text-ink">Explore</Link>
        {art.category && <> / <Link href={`/explore?category=${art.category.slug}`} className="hover:text-ink">{art.category.name}</Link></>}
      </nav>

      {art.status !== "approved" && (
        <div className="mb-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          This artwork is <strong>{art.status}</strong> and only visible to you{art.status === "pending" ? " until a moderator approves it" : ""}.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
        <ArtworkViewer a={art} prev={nav.prev} next={nav.next} />

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {art.category && <span className="label text-pepe">{art.category.name}</span>}
              {art.featured && <span className="label rounded-full border border-pepe/40 px-2 py-0.5 text-[10px] text-pepe">Featured</span>}
              {art.is_sample && <span className="label rounded-full border border-line px-2 py-0.5 text-[10px] text-mute" title="Generated placeholder, not a historical original">Sample artwork</span>}
            </div>
            <h1 className="h-display mt-3 text-[40px] md:text-[56px]">{art.title}</h1>
            <div className="mt-3 flex items-center gap-4 text-sm text-mute">
              <span className="flex items-center gap-1.5"><Heart className="size-4" /> {art.favorites_count} favorites</span>
              <span className="flex items-center gap-1.5"><Eye className="size-4" /> {art.views} views</span>
            </div>
          </div>

          <ArtworkActions a={art} />

          {art.description && <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/85">{art.description}</p>}

          <dl className="divide-y divide-line rounded-2xl border border-line bg-card text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 px-4 py-3">
                <dt className="text-mute">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>

          {art.tags.length > 0 && (
            <div>
              <div className="label mb-2 text-mute">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {art.tags.map((t) => <Link key={t} href={`/explore?q=${encodeURIComponent(t)}`} className="chip h-8 text-[12px]">#{t}</Link>)}
              </div>
            </div>
          )}
          {collections.length > 0 && (
            <div>
              <div className="label mb-2 text-mute">In collections</div>
              <div className="flex flex-wrap gap-1.5">
                {collections.map((c) => <Link key={c.slug} href={`/collections/${c.slug}`} className="chip h-8 text-[12px]">{c.title}</Link>)}
              </div>
            </div>
          )}
          <p className="text-[12px] text-mute">
            Is this your work and posted without permission? <Link href="/copyright" className="underline hover:text-ink">Request a takedown</Link>.
          </p>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeader title="RELATED ARTWORK" href={art.category ? `/explore?category=${art.category.slug}` : "/explore"} cta="More like this" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {related.map((r) => <ArtworkCard key={r.id} a={r} ratio="4/5" sizes="(min-width:1024px) 16vw, 50vw" />)}
          </div>
        </section>
      )}
    </div>
  );
}
