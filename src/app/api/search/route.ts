import { NextResponse } from "next/server";
import { getCollections, getCreatorLeaderboard, queryArtworks } from "@/lib/data";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ artworks: [], collections: [], creators: [] });
  const [arts, cols, creators] = await Promise.all([queryArtworks({ q, sort: "popular", pageSize: 6 }), getCollections(), getCreatorLeaderboard(100)]);
  return NextResponse.json({
    artworks: arts.items.map((a) => ({ slug: a.slug, title: a.title, thumb: a.thumbnail_url || a.image_url, category: a.category?.name ?? null, creator: a.creator_name })),
    collections: cols.filter((c) => `${c.title} ${c.description}`.toLowerCase().includes(q)).slice(0, 4).map((c) => ({ slug: c.slug, title: c.title, count: c.count })),
    creators: creators.filter((c) => c.username.includes(q)).slice(0, 6).map((c) => ({ username: c.username, artworks: c.artworks })),
  });
}
