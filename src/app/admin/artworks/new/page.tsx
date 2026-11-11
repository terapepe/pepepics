import Link from "next/link";
import { adminClient } from "@/lib/admin";
import { createArtworks } from "@/lib/admin-actions";
import { ActionForm, Field } from "@/components/admin/action-form";
import { ArtworkFields } from "@/components/admin/artwork-fields";

export default async function NewArtwork() {
  const { sb } = await adminClient();
  const [{ data: cats }, { data: cols }] = await Promise.all([
    sb.from("categories").select("id,name").order("display_order"),
    sb.from("collections").select("id,title").order("display_order"),
  ]);
  return (
    <div>
      <Link href="/admin/artworks" className="label text-mute hover:text-pepe">← Artworks</Link>
      <h1 className="h-display mt-3 text-4xl">ADD ARTWORK</h1>
      <p className="mt-2 text-mute">Upload one or many images. Artwork added here is published immediately (status: approved).</p>
      <ActionForm action={createArtworks} submitLabel="Upload & publish" resetOnSuccess className="card mt-8 space-y-5 p-5">
        <Field label="Images (multiple allowed)" hint="JPG, PNG, WEBP, GIF · max 10 MB each">
          <input type="file" name="images" multiple required accept="image/jpeg,image/png,image/webp,image/gif" className="input h-auto py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-pepe file:px-3 file:py-1 file:text-bg" />
        </Field>
        <ArtworkFields categories={cats ?? []} titleHint="Leave empty to use file names. With several files, “ #1, #2…” is appended." />
        <Field label="Add to collection">
          <select name="collection_id" defaultValue="" className="input max-w-sm">
            <option value="">None</option>
            {(cols ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
      </ActionForm>
    </div>
  );
}
