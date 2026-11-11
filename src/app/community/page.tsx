import { Masonry } from "@/components/masonry";
import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Upload } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { EmptyState, SectionHeader } from "@/components/section";
import { getCreatorLeaderboard, queryArtworks } from "@/lib/data";

export const metadata: Metadata = { title: "Community", description: "Pepe artwork made and shared by the PEPE.PICS community." };
export const revalidate = 60;

export default async function CommunityPage() {
  const [latest, top, leaders] = await Promise.all([
    queryArtworks({ community: true, sort: "latest", pageSize: 12 }),
    queryArtworks({ community: true, sort: "favorited", pageSize: 6 }),
    getCreatorLeaderboard(10),
  ]);
  const submitCta = <Link href="/submit" className="btn-primary mt-2"><Upload className="size-4" /> Submit your artwork</Link>;

  return (
    <div className="container-x pt-10 md:pt-16">
      <header className="mb-14 grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end">
        <div>
          <div className="label mb-4 text-pepe">Community gallery</div>
          <h1 className="h-display text-[48px] md:text-[88px]">MADE BY THE COMMUNITY.</h1>
        </div>
        <p className="text-lg text-mute">Every piece here was submitted by a creator and reviewed by a moderator before going public. Upload yours and climb the leaderboard.</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
        <div className="space-y-16">
          <section>
            <SectionHeader title="LATEST SUBMISSIONS" href="/explore?community=1" />
            {latest.items.length ? (
              <Masonry>{latest.items.map((a) => <ArtworkCard key={a.id} a={a} data-ratio={(a.height ?? 750) / (a.width ?? 600)} />)}</Masonry>
            ) : (
              <EmptyState title="Be the first creator" text="No community submissions have been approved yet. Share your Pepe and it will appear here after review." action={submitCta} />
            )}
          </section>
          {top.items.some((a) => a.favorites_count > 0) && (
            <section>
              <SectionHeader title="MOST FAVORITED" href="/explore?community=1&sort=favorited" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{top.items.map((a) => <ArtworkCard key={a.id} a={a} ratio="1/1" />)}</div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="size-5 text-pepe" />
              <h2 className="font-display text-lg font-semibold">Creator leaderboard</h2>
            </div>
            {leaders.length ? (
              <ol className="space-y-1">
                {leaders.map((c, i) => (
                  <li key={c.id}>
                    <Link href={`/creator/${c.username}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
                      <span className={`w-5 text-center font-display font-bold ${i < 3 ? "text-pepe" : "text-mute"}`}>{i + 1}</span>
                      {c.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatar_url} alt="" className="size-8 rounded-full object-cover" />
                      ) : (
                        <span className="grid size-8 place-items-center rounded-full bg-pepe/15 text-xs font-bold uppercase text-pepe">{c.username[0]}</span>
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">@{c.username}</span>
                      <span className="text-right text-[12px] leading-tight text-mute">{c.favorites} ♥<br />{c.artworks} art</span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-mute">The leaderboard ranks creators by favorites on their approved artwork. It fills up as soon as the first submissions are approved.</p>
            )}
          </div>
          <div className="card mt-4 p-5 text-sm text-mute">
            <h3 className="mb-2 font-display text-base font-semibold text-ink">How it works</h3>
            <ol className="list-decimal space-y-1.5 pl-4">
              <li>Create a free account.</li>
              <li>Submit your artwork with a title, category and tags.</li>
              <li>A moderator reviews it (usually within a few days).</li>
              <li>Once approved, it appears in the gallery and your profile.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
