import Link from "next/link";
import { notFound } from "next/navigation";
import { adminClient } from "@/lib/admin";
import { deleteArtwork, saveArtwork } from "@/lib/admin-actions";
import { ActionButton, ActionForm, Field } from "@/components/admin/action-form";
import { ArtworkFields } from "@/components/admin/artwork-fields";

export default async function EditArtwork({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await adminClient();
  const [{ data: a }, { data: cats }, { data: cols }, { data: links }, { data: sub }] = await Promise.all([
    sb.from("artworks").select("*").eq("id", id).maybeSingle(),
    sb.from("categories").select("id,name").order("display_order"),
    sb.from("collections").select("id,title").order("display_order"),
    sb.from("collection_artworks").select("collection_id").eq("artwork_id", id),
    sb.from("submissions").select("moderation_note,user:users(username)").eq("artwork_id", id).maybeSingle(),
  ]);
  if (!a) notFound();
  const inCol = new Set((links ?? []).map((l) => l.collection_id));
  return (
    <div>
      <Link href="/admin/artworks" className="label text-mute hover:text-pepe">← Artworks</Link>
      <h1 className="h-display mt-3 text-4xl">EDIT ARTWORK</h1>
      <div className="mt-8 grid gap-8 xl:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.image_url} alt="" className="w-full rounded-2xl border border-line bg-black object-contain" />
          <p className="text-[12px] text-mute">{a.width}×{a.height} · {a.views} views · {a.favorites_count} favorites</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(sub as any)?.user?.username && <p className="text-sm text-mute">Submitted by @{(sub as any).user.username}</p>}
          <div className="flex gap-2">
            <Link href={`/artwork/${a.slug}`} className="chip">View page</Link>
            <ActionButton action={deleteArtwork} fields={{ id: a.id, redirect: "1" }} label="Delete" confirm="Delete this artwork permanently?" className="chip hover:border-red-500/60 hover:text-red-300" />
          </div>
        </div>
        <ActionForm action={saveArtwork} className="card space-y-5 p-5">
          <input type="hidden" name="id" value={a.id} />
          <ArtworkFields a={a} categories={cats ?? []} />
          <Field label="Status">
            <select name="status" defaultValue={a.status} className="input max-w-xs">
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </Field>
          <div>
            <span className="label mb-2 block text-mute">Collections</span>
            <div className="flex flex-wrap gap-2">
              {(cols ?? []).map((c) => (
                <label key={c.id} className="chip cursor-pointer"><input type="checkbox" name="collections" value={c.id} defaultChecked={inCol.has(c.id)} className="accent-[#A6E56D]" /> {c.title}</label>
              ))}
            </div>
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
