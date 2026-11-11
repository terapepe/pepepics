import { adminClient } from "@/lib/admin";
import { saveSettings } from "@/lib/admin-actions";
import { getSettings } from "@/lib/data";
import { ActionForm, Field } from "@/components/admin/action-form";

export default async function AdminSettings() {
  await adminClient();
  const s = await getSettings();
  return (
    <div>
      <h1 className="h-display text-4xl md:text-5xl">SETTINGS</h1>
      <p className="mt-2 text-mute">Token, contract addresses, networks and single/multi mode are edited in <code>src/config/site.ts</code>. Featured artworks are set per artwork.</p>
      <ActionForm action={saveSettings} className="card mt-8 max-w-3xl space-y-4 p-5">
        <Field label="Website name"><input name="siteName" defaultValue={s.siteName} className="input" /></Field>
        <Field label="Logo" hint="Upload to replace the built-in SVG logo">
          <div className="flex items-center gap-3">
            <input type="file" name="logo" accept="image/*" className="input h-auto flex-1 py-2 text-sm" />
            {s.logoUrl && <label className="chip cursor-pointer"><input type="checkbox" name="resetLogo" className="accent-[#A6E56D]" /> Use default</label>}
          </div>
        </Field>
        <Field label="Homepage hero title" hint="New line = line break"><textarea name="heroTitle" defaultValue={s.heroTitle} className="textarea min-h-20" /></Field>
        <Field label="Homepage hero text"><textarea name="heroSubtitle" defaultValue={s.heroSubtitle} className="textarea min-h-20" /></Field>
        <Field label="Meta description"><textarea name="metaDescription" defaultValue={s.metaDescription} className="textarea min-h-20" /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="X (Twitter) URL"><input name="xUrl" defaultValue={s.xUrl} className="input" /></Field>
          <Field label="Upload limit (MB, max 10)"><input name="uploadMaxMb" type="number" min={1} max={10} defaultValue={s.uploadMaxMb} className="input" /></Field>
        </div>
      </ActionForm>
    </div>
  );
}
