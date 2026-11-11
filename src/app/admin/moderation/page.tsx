import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { adminClient } from "@/lib/admin";
import { moderate } from "@/lib/admin-actions";

export default async function Moderation() {
  const { sb } = await adminClient();
  const { data } = await sb
    .from("artworks")
    .select("id,slug,title,description,image_url,width,height,creator_name,source_url,tags,image_hash,created_at,category:categories(name),creator:users(username)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50);
  const items = data ?? [];
  // duplicate detection: identical file hash or identical title already in the database
  const hashes = items.map((a) => a.image_hash).filter(Boolean) as string[];
  const titles = items.map((a) => a.title);
  const [{ data: byHash }, { data: byTitle }] = await Promise.all([
    hashes.length ? sb.from("artworks").select("id,slug,title,image_hash").in("image_hash", hashes) : Promise.resolve({ data: [] }),
    titles.length ? sb.from("artworks").select("id,slug,title").in("title", titles) : Promise.resolve({ data: [] }),
  ]);

  return (
    <div>
      <h1 className="h-display text-4xl md:text-5xl">MODERATION</h1>
      <p className="mt-2 text-mute">{items.length} pending submission{items.length === 1 ? "" : "s"} (oldest first).</p>
      <div className="mt-8 space-y-5">
        {items.length === 0 && <div className="card p-10 text-center text-mute">All caught up. No pending submissions.</div>}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {items.map((a: any) => {
          const dupes = [
            ...(byHash ?? []).filter((x) => x.id !== a.id && x.image_hash === a.image_hash).map((x) => ({ ...x, why: "identical file" })),
            ...(byTitle ?? []).filter((x) => x.id !== a.id && x.title === a.title).map((x) => ({ ...x, why: "same title" })),
          ];
          return (
            <article key={a.id} className="card grid gap-5 p-4 md:grid-cols-[260px_1fr]">
              <a href={a.image_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image_url} alt={a.title} className="max-h-[320px] w-full object-contain" />
              </a>
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">{a.title}</h2>
                  <p className="text-sm text-mute">
                    {a.category?.name ?? "No category"} · by {a.creator_name} {a.creator?.username && <>(@{a.creator.username})</>} · {new Date(a.created_at).toLocaleString()}
                    {a.width && <> · {a.width}×{a.height}</>}
                  </p>
                </div>
                {a.description && <p className="text-sm text-ink/80">{a.description}</p>}
                <div className="flex flex-wrap gap-1.5 text-[12px] text-mute">{a.tags.map((t: string) => <span key={t} className="rounded-full border border-line px-2 py-0.5">#{t}</span>)}</div>
                {a.source_url && <a href={a.source_url} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-sm text-pepe underline">{a.source_url}</a>}
                {dupes.length > 0 && (
                  <div className="flex items-start gap-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div>Possible duplicate: {dupes.map((d) => <Link key={d.id + d.why} href={`/artwork/${d.slug}`} className="mr-2 underline">{d.title} ({d.why})</Link>)}</div>
                  </div>
                )}
                <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                  <form action={moderate}>
                    <input type="hidden" name="artwork_id" value={a.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button className="btn-primary btn-sm">Approve</button>
                  </form>
                  <form action={moderate} className="flex flex-1 gap-2">
                    <input type="hidden" name="artwork_id" value={a.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <input name="note" required placeholder="Reason for rejection (shown to the creator)" className="input h-9 flex-1 text-sm" />
                    <button className="btn btn-sm border border-red-500/50 text-red-300 hover:bg-red-500/10">Reject</button>
                  </form>
                  <Link href={`/admin/artworks/${a.id}`} className="btn-ghost btn-sm">Edit</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
