import { Field } from "@/components/admin/action-form";

const TYPES = ["Digital Illustration", "Pixel Art", "Painting", "Vector", "3D Render", "Collage", "Photography", "Animation (GIF)"];

type A = {
  title?: string; description?: string | null; category_id?: string | null; creator_name?: string | null; creation_year?: number | null;
  source_url?: string | null; license_type?: string | null; artwork_type?: string | null; tags?: string[]; featured?: boolean; allow_download?: boolean;
};

export function ArtworkFields({ a = {}, categories, titleHint }: { a?: A; categories: { id: string; name: string }[]; titleHint?: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><Field label="Title" hint={titleHint}><input name="title" defaultValue={a.title} className="input" /></Field></div>
      <Field label="Category">
        <select name="category_id" defaultValue={a.category_id ?? ""} className="input">
          <option value="">None</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Artwork type">
        <select name="artwork_type" defaultValue={a.artwork_type ?? ""} className="input">
          <option value="">Not specified</option>
          {[...new Set([...(a.artwork_type ? [a.artwork_type] : []), ...TYPES])].map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Creator name"><input name="creator_name" defaultValue={a.creator_name ?? ""} className="input" /></Field>
      <Field label="Year created" hint="Only if verified"><input name="creation_year" defaultValue={a.creation_year ?? ""} inputMode="numeric" className="input" /></Field>
      <div className="md:col-span-2"><Field label="Description"><textarea name="description" defaultValue={a.description ?? ""} className="textarea" /></Field></div>
      <Field label="Tags" hint="Comma separated"><input name="tags" defaultValue={(a.tags ?? []).join(", ")} className="input" /></Field>
      <Field label="Source / original URL"><input name="source_url" defaultValue={a.source_url ?? ""} className="input" /></Field>
      <Field label="License / usage"><input name="license_type" defaultValue={a.license_type ?? ""} placeholder="e.g. CC BY 4.0, All rights reserved" className="input" /></Field>
      <div className="flex flex-wrap items-end gap-3">
        <label className="chip h-11 cursor-pointer"><input type="checkbox" name="featured" defaultChecked={a.featured} className="accent-[#A6E56D]" /> Featured</label>
        <label className="chip h-11 cursor-pointer"><input type="checkbox" name="allow_download" defaultChecked={a.allow_download} className="accent-[#A6E56D]" /> Allow download</label>
      </div>
    </div>
  );
}
