import { adminClient } from "@/lib/admin";
import { deleteCategory, saveCategory } from "@/lib/admin-actions";
import { ActionButton, ActionForm, Field } from "@/components/admin/action-form";

export default async function AdminCategories() {
  const { sb } = await adminClient();
  const { data } = await sb.from("categories").select("*").order("display_order");
  const fields = (c?: { id: string; name: string; slug: string; description: string | null; display_order: number; cover_image: string | null }) => (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_100px]">
        <Field label="Name"><input name="name" defaultValue={c?.name} className="input" /></Field>
        <Field label="Slug"><input name="slug" defaultValue={c?.slug} placeholder="auto from name" className="input" /></Field>
        <Field label="Order"><input name="display_order" type="number" defaultValue={c?.display_order ?? (data?.length ?? 0) + 1} className="input" /></Field>
      </div>
      <Field label="Description"><input name="description" defaultValue={c?.description ?? ""} className="input" /></Field>
      <Field label="Cover image" hint="Optional — upload to replace"><input type="file" name="cover" accept="image/*" className="input h-auto py-2 text-sm" /></Field>
    </>
  );
  return (
    <div>
      <h1 className="h-display text-4xl md:text-5xl">CATEGORIES</h1>
      <div className="mt-8 space-y-4">
        {(data ?? []).map((c) => (
          <div key={c.id} className="card grid gap-4 p-4 md:grid-cols-[120px_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.cover_image ? <img src={c.cover_image} alt="" className="aspect-[3/4] w-full rounded-xl object-cover" /> : <div className="aspect-[3/4] rounded-xl bg-bg2" />}
            <div className="space-y-3">
              <ActionForm action={saveCategory} className="space-y-3">{fields(c)}</ActionForm>
              <ActionButton action={deleteCategory} fields={{ id: c.id }} label="Delete category" confirm={`Delete “${c.name}”? Artworks keep existing but lose this category.`} className="text-[12px] text-mute hover:text-red-300" />
            </div>
          </div>
        ))}
        <div className="card p-4">
          <h2 className="mb-3 font-display text-lg font-semibold">New category</h2>
          <ActionForm action={saveCategory} submitLabel="Create" resetOnSuccess className="space-y-3">{fields()}</ActionForm>
        </div>
      </div>
    </div>
  );
}
