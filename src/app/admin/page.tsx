import Link from "next/link";
import { adminClient } from "@/lib/admin";

export default async function AdminOverview() {
  const { sb } = await adminClient();
  const c = (t: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let q = sb.from(t).select("id", { count: "exact", head: true });
    if (f) q = f(q);
    return q.then((r: { count: number | null }) => r.count ?? 0);
  };
  const [total, approved, pending, rejected, users, favorites, collections] = await Promise.all([
    c("artworks"),
    c("artworks", (q) => q.eq("status", "approved")),
    c("artworks", (q) => q.eq("status", "pending")),
    c("artworks", (q) => q.eq("status", "rejected")),
    c("users"),
    c("favorites"),
    c("collections"),
  ]);
  const stats = [
    ["Total artworks", total, "/admin/artworks"],
    ["Approved", approved, "/admin/artworks?status=approved"],
    ["Pending submissions", pending, "/admin/moderation"],
    ["Rejected", rejected, "/admin/artworks?status=rejected"],
    ["Total users", users, "/admin/users"],
    ["Total favorites", favorites, null],
    ["Collections", collections, "/admin/collections"],
  ] as const;
  return (
    <div>
      <h1 className="h-display text-4xl md:text-5xl">DASHBOARD</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([k, v, href]) => {
          const inner = (
            <>
              <div className="label text-mute">{k}</div>
              <div className={`h-display mt-2 text-4xl ${k.startsWith("Pending") && v > 0 ? "text-pepe" : ""}`}>{v}</div>
            </>
          );
          return href ? <Link key={k} href={href} className="card p-5 transition hover:border-pepe/50">{inner}</Link> : <div key={k} className="card p-5">{inner}</div>;
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/moderation" className="btn-primary btn-sm">Review submissions</Link>
        <Link href="/admin/artworks/new" className="btn-ghost btn-sm">Add artwork</Link>
        <Link href="/admin/settings" className="btn-ghost btn-sm">Site settings</Link>
      </div>
    </div>
  );
}
