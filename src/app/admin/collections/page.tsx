import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { adminClient } from "@/lib/admin";
import { moveCollection, saveCollection } from "@/lib/admin-actions";
import { ActionButton, ActionForm, Field } from "@/components/admin/action-form";

export default async function AdminCollections() {
  const { sb } = await adminClient();
  const { data } = await sb.from("collections").select("id,slug,title,cover_image,display_order,collection_artworks(count)").order("display_order").order("created_at");
  return (
    <div>
      <h1 className="h-display text-4xl md:text-5xl">COLLECTIONS</h1>
      <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(data ?? []).map((c: any, i: number, arr: any[]) => (
          <li key={c.id} className="flex items-center gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.cover_image ? <img src={c.cover_image} alt="" className="size-12 rounded-lg object-cover" /> : <div className="size-12 rounded-lg bg-bg2" />}
            <div className="min-w-0 flex-1">
              <Link href={`/admin/collections/${c.id}`} className="font-medium hover:text-pepe">{c.title}</Link>
              <div className="text-[12px] text-mute">/{c.slug} · {c.collection_artworks?.[0]?.count ?? 0} artworks</div>
            </div>
            {i > 0 && <ActionButton action={moveCollection} fields={{ id: c.id, dir: "up" }} label={<ArrowUp className="size-4" />} className="icon-btn size-8" />}
            {i < arr.length - 1 && <ActionButton action={moveCollection} fields={{ id: c.id, dir: "down" }} label={<ArrowDown className="size-4" />} className="icon-btn size-8" />}
            <Link href={`/admin/collections/${c.id}`} className="chip h-8 text-[12px]">Edit</Link>
          </li>
        ))}
      </ul>
      <div className="card mt-6 p-4">
        <h2 className="mb-3 font-display text-lg font-semibold">New collection</h2>
        <ActionForm action={saveCollection} submitLabel="Create" resetOnSuccess className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Title"><input name="title" className="input" /></Field>
            <Field label="Slug"><input name="slug" placeholder="auto from title" className="input" /></Field>
          </div>
          <Field label="Description"><input name="description" className="input" /></Field>
          <input type="hidden" name="display_order" value={(data?.length ?? 0) + 1} />
        </ActionForm>
      </div>
    </div>
  );
}
