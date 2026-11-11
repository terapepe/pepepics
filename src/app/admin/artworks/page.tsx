import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { adminClient } from "@/lib/admin";
import { deleteArtwork, toggleFeatured } from "@/lib/admin-actions";
import { ActionButton } from "@/components/admin/action-form";

type Props = { searchParams: Promise<Record<string, string | undefined>> };
const PAGE = 30;

export default async function AdminArtworks({ searchParams }: Props) {
  const { sb } = await adminClient();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").replace(/[^\w\s-]/g, "").trim();
  let query = sb.from("artworks").select("id,slug,title,thumbnail_url,status,featured,favorites_count,views,is_sample,created_at,category:categories(name)", { count: "exact" }).order("created_at", { ascending: false });
  if (sp.status) query = query.eq("status", sp.status);
  if (q) query = query.ilike("title", `%${q}%`);
  const { data, count } = await query.range((page - 1) * PAGE, page * PAGE - 1);
  const pages = Math.ceil((count ?? 0) / PAGE);
  const link = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams(Object.entries({ q: q || undefined, status: sp.status, page, ...p }).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]));
    return `/admin/artworks?${u}`;
  };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-display text-4xl md:text-5xl">ARTWORKS</h1>
        <Link href="/admin/artworks/new" className="btn-primary btn-sm"><Plus className="size-4" /> Add artwork</Link>
      </div>
      <form className="mt-6 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search title…" className="input h-10 max-w-xs" />
        <select name="status" defaultValue={sp.status ?? ""} className="input h-10 w-auto">
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="btn-ghost btn-sm h-10">Filter</button>
      </form>
      <p className="mt-4 text-sm text-mute">{count ?? 0} artworks</p>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-bg2 text-left text-mute">
            <tr><th className="p-3">Artwork</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">♥ / views</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(data ?? []).map((a: any) => (
              <tr key={a.id} className="bg-card">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.thumbnail_url} alt="" className="size-11 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <Link href={`/admin/artworks/${a.id}`} className="block max-w-[260px] truncate font-medium hover:text-pepe">{a.title}</Link>
                      <span className="text-[12px] text-mute">{new Date(a.created_at).toLocaleDateString()}{a.is_sample && " · sample"}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-mute">{a.category?.name ?? "—"}</td>
                <td className="p-3"><span className={`label text-[10px] ${a.status === "approved" ? "text-pepe" : a.status === "pending" ? "text-yellow-300" : "text-red-300"}`}>{a.status}</span></td>
                <td className="p-3 text-mute">{a.favorites_count} / {a.views}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1.5">
                    <ActionButton action={toggleFeatured} fields={{ id: a.id, featured: a.featured ? "0" : "1" }} label={<><Star className="size-3.5" fill={a.featured ? "currentColor" : "none"} /> {a.featured ? "Featured" : "Feature"}</>} className={`chip h-8 text-[12px] ${a.featured ? "border-pepe/60 text-pepe" : ""}`} />
                    <Link href={`/admin/artworks/${a.id}`} className="chip h-8 text-[12px]">Edit</Link>
                    <ActionButton action={deleteArtwork} fields={{ id: a.id }} label="Delete" confirm={`Delete “${a.title}” permanently?`} className="chip h-8 text-[12px] hover:border-red-500/60 hover:text-red-300" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex gap-2">
          {page > 1 && <Link href={link({ page: page - 1 })} className="chip">← Prev</Link>}
          <span className="chip pointer-events-none">Page {page} / {pages}</span>
          {page < pages && <Link href={link({ page: page + 1 })} className="chip">Next →</Link>}
        </div>
      )}
    </div>
  );
}
