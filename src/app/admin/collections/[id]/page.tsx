import Link from "next/link";
import { notFound } from "next/navigation";
import { X } from "lucide-react";
import { adminClient } from "@/lib/admin";
import { collectionItem, deleteCollection, saveCollection } from "@/lib/admin-actions";
import { ActionButton, ActionForm, Field } from "@/components/admin/action-form";

export default async function EditCollection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await adminClient();
  const [{ data: c }, { data: items }] = await Promise.all([
    sb.from("collections").select("*").eq("id", id).maybeSingle(),
    sb.from("collection_artworks").select("artwork:artworks(id,slug,title,thumbnail_url,image_url,status)").eq("collection_id", id),
  ]);
  if (!c) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arts = (items ?? []).map((i: any) => i.artwork).filter(Boolean);
  return (
    <div>
      <Link href="/admin/collections" className="label text-mute hover:text-pepe">← Collections</Link>
      <h1 className="h-display mt-3 text-4xl">{c.title.toUpperCase()}</h1>
      <ActionForm action={saveCollection} className="card mt-8 space-y-3 p-5">
        <input type="hidden" name="id" value={c.id} />
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_100px]">
          <Field label="Title"><input name="title" defaultValue={c.title} className="input" /></Field>
          <Field label="Slug"><input name="slug" defaultValue={c.slug} className="input" /></Field>
          <Field label="Order"><input name="display_order" type="number" defaultValue={c.display_order} className="input" /></Field>
        </div>
        <Field label="Description"><textarea name="description" defaultValue={c.description ?? ""} className="textarea" /></Field>
        <Field label="Cover artwork">
          <select name="cover_artwork" defaultValue={c.cover_image ?? ""} className="input">
            <option value="">Keep current</option>
            {arts.map((a) => <option key={a.id} value={a.image_url}>{a.title}</option>)}
          </select>
        </Field>
      </ActionForm>

      <h2 className="h-display mt-10 text-2xl">ARTWORKS ({arts.length})</h2>
      <form action={collectionItem} className="mt-4 flex gap-2">
        <input type="hidden" name="collection_id" value={c.id} />
        <input type="hidden" name="op" value="add" />
        <input name="slug" required placeholder="Artwork slug or URL (e.g. /artwork/neon-pepe)" className="input h-10 flex-1" />
        <button className="btn-primary btn-sm h-10">Add</button>
      </form>
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5 xl:grid-cols-6">
        {arts.map((a) => (
          <div key={a.id} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.thumbnail_url ?? a.image_url} alt="" className="aspect-square w-full rounded-xl object-cover" />
            <div className="mt-1 truncate text-[12px] text-mute">{a.title}</div>
            <div className="absolute right-1.5 top-1.5">
              <ActionButton action={collectionItem} fields={{ collection_id: c.id, artwork_id: a.id, op: "remove" }} label={<X className="size-3.5" />} className="grid size-7 place-items-center rounded-full bg-black/70 text-ink hover:bg-red-500" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 border-t border-line pt-6">
        <ActionButton action={deleteCollection} fields={{ id: c.id }} label="Delete collection" confirm="Delete this collection? Artworks are not deleted." className="btn btn-sm border border-red-500/50 text-red-300 hover:bg-red-500/10" />
      </div>
    </div>
  );
}
