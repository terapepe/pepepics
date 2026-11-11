import { Masonry } from "@/components/masonry";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/artwork-card";
import { EmptyState } from "@/components/section";
import { getProfileByUsername, queryArtworks } from "@/lib/data";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function CreatorPage({ params }: Props) {
  const { username } = await params;
  const p = await getProfileByUsername(username.toLowerCase());
  if (!p || p.suspended) notFound();
  const arts = await queryArtworks({ creatorId: p.id, sort: "latest", pageSize: 60 });
  const favs = arts.items.reduce((s, a) => s + a.favorites_count, 0);
  return (
    <div className="container-x pt-10 md:pt-16">
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-center">
        {p.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatar_url} alt="" className="size-28 rounded-full border border-line object-cover" />
        ) : (
          <div className="grid size-28 place-items-center rounded-full bg-pepe/15 font-display text-5xl font-bold uppercase text-pepe">{p.username[0]}</div>
        )}
        <div>
          <h1 className="h-display text-5xl">@{p.username}</h1>
          {p.bio && <p className="mt-3 max-w-xl text-mute">{p.bio}</p>}
          <div className="label mt-4 flex gap-6 text-mute">
            <span>{arts.total} artworks</span>
            <span>{favs} favorites</span>
            <span>Joined {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </header>
      {arts.items.length ? (
        <Masonry>{arts.items.map((a) => <ArtworkCard key={a.id} a={a} data-ratio={(a.height ?? 750) / (a.width ?? 600)} />)}</Masonry>
      ) : (
        <EmptyState title="No approved artwork yet" text="This creator hasn't had any artwork approved yet." />
      )}
    </div>
  );
}
