import type { MetadataRoute } from "next";
import { getCategories, getCollections, queryArtworks } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, cols] = await Promise.all([getCategories(), getCollections()]);
  const arts = [];
  for (let page = 1; page <= 20; page++) {
    const r = await queryArtworks({ sort: "latest", page, pageSize: 60 });
    arts.push(...r.items);
    if (arts.length >= r.total) break;
  }
  const u = (p: string) => `${SITE_URL}${p}`;
  return [
    ...["/", "/explore", "/categories", "/collections", "/community", "/submit", "/about", "/privacy", "/terms", "/copyright"].map((p) => ({ url: u(p), changeFrequency: "daily" as const, priority: p === "/" ? 1 : 0.7 })),
    ...cats.map((c) => ({ url: u(`/explore?category=${c.slug}`), changeFrequency: "daily" as const, priority: 0.6 })),
    ...cols.map((c) => ({ url: u(`/collections/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...arts.map((a) => ({ url: u(`/artwork/${a.slug}`), lastModified: a.created_at, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
