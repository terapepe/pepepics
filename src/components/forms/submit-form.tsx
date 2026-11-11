"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CircleCheck, ImagePlus, Loader2, X } from "lucide-react";
import { siteConfig } from "@/config/site";

type Errors = Record<string, string>;
const TYPES = ["Digital Illustration", "Pixel Art", "Painting", "Vector", "3D Render", "Collage", "Photography", "Animation (GIF)"];

export function SubmitForm({ categories, maxMb, enabled, defaultCreator }: { categories: { slug: string; name: string }[]; maxMb: number; enabled: boolean; defaultCreator: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const pick = (f: File | undefined) => {
    if (!f) return;
    const e: Errors = {};
    if (!siteConfig.uploads.types.includes(f.type)) e.image = "Only JPG, PNG, WEBP and GIF images are allowed.";
    else if (f.size > maxMb * 1024 * 1024) e.image = `File is ${(f.size / 1048576).toFixed(1)} MB — maximum is ${maxMb} MB.`;
    setErrors((x) => ({ ...x, image: e.image ?? "" }));
    if (e.image) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const validate = (fd: FormData): Errors => {
    const e: Errors = {};
    if (String(fd.get("title") ?? "").trim().length < 2) e.title = "Title is required.";
    if (!fd.get("category")) e.category = "Choose a category.";
    if (!String(fd.get("creator_name") ?? "").trim()) e.creator_name = "Creator display name is required.";
    const y = String(fd.get("creation_year") ?? "");
    if (y && (!/^\d{4}$/.test(y) || +y < 2005 || +y > new Date().getFullYear())) e.creation_year = "Enter a valid year.";
    const u = String(fd.get("source_url") ?? "");
    if (u && !/^https?:\/\/\S+$/i.test(u)) e.source_url = "Enter a valid http(s) URL.";
    if (!file) e.image = "Choose an image.";
    if (!fd.get("permission")) e.permission = "Please confirm you own the artwork or have permission.";
    return e;
  };

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setMsg(null);
    const fd = new FormData(ev.currentTarget);
    const e = validate(fd);
    setErrors(e);
    if (Object.keys(e).length) return setMsg("Please fix the highlighted fields.");
    if (!enabled) return setMsg("Submissions are not available right now (see the notice above).");
    fd.set("image", file!);
    // XHR for real upload progress
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/submit");
    xhr.upload.onprogress = (p) => p.lengthComputable && setProgress(Math.round((p.loaded / p.total) * 100));
    xhr.onload = () => {
      setProgress(null);
      let j: { ok?: boolean; slug?: string; error?: string; errors?: Errors } = {};
      try {
        j = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status === 200 && j.ok) {
        setDone(j.slug ?? "");
        formRef.current?.reset();
        setFile(null);
        setPreview(null);
      } else {
        setErrors(j.errors ?? {});
        setMsg(j.error ?? "Submission failed. Please try again.");
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setMsg("Network error. Please try again.");
    };
    setProgress(0);
    xhr.send(fd);
  };

  if (done !== null)
    return (
      <div className="card grid place-items-center gap-4 p-10 text-center">
        <CircleCheck className="size-14 text-pepe" />
        <h2 className="h-display text-4xl">SUBMITTED!</h2>
        <p className="max-w-md text-mute">Thanks for sharing. Your artwork is now <strong className="text-ink">pending review</strong>. You can follow its status on your profile.</p>
        <div className="flex gap-2">
          <Link href="/profile" className="btn-primary">View my submissions</Link>
          <button onClick={() => setDone(null)} className="btn-ghost">Submit another</button>
        </div>
      </div>
    );

  const err = (k: string) => errors[k] ? <p className="mt-1.5 text-[13px] text-red-400">{errors[k]}</p> : null;
  const busy = progress !== null;

  return (
    <form ref={formRef} onSubmit={submit} className="card space-y-5 p-5 md:p-7" noValidate>
      <div>
        <span className="label mb-2 block text-mute">Image *</span>
        {preview ? (
          <div className="relative overflow-hidden rounded-2xl border border-line bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="mx-auto max-h-[420px] object-contain" />
            <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="icon-btn absolute right-3 top-3 bg-black/60" aria-label="Remove image"><X className="size-4" /></button>
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[12px]">{file?.name} · {((file?.size ?? 0) / 1048576).toFixed(2)} MB</div>
          </div>
        ) : (
          <label
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${drag ? "border-pepe bg-pepe/5" : "border-line hover:border-pepe/50"}`}
          >
            <ImagePlus className="size-10 text-pepe" />
            <span className="font-medium">Drop your image here or <span className="text-pepe">browse</span></span>
            <span className="text-[13px] text-mute">JPG, PNG, WEBP, GIF · max {maxMb} MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
        )}
        {err("image")}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="label mb-2 block text-mute">Artwork title *</span>
          <input name="title" maxLength={120} className="input" placeholder="e.g. Midnight Synthwave Pepe" />
          {err("title")}
        </label>
        <label>
          <span className="label mb-2 block text-mute">Category *</span>
          <select name="category" defaultValue="" className="input">
            <option value="" disabled>Select a category</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          {err("category")}
        </label>
        <label>
          <span className="label mb-2 block text-mute">Artwork type</span>
          <select name="artwork_type" defaultValue="" className="input">
            <option value="">Not specified</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>
          <span className="label mb-2 block text-mute">Creator display name *</span>
          <input name="creator_name" maxLength={60} defaultValue={defaultCreator} className="input" />
          {err("creator_name")}
        </label>
        <label>
          <span className="label mb-2 block text-mute">Year created (optional)</span>
          <input name="creation_year" inputMode="numeric" maxLength={4} className="input" placeholder="2026" />
          {err("creation_year")}
        </label>
        <label className="md:col-span-2">
          <span className="label mb-2 block text-mute">Description</span>
          <textarea name="description" maxLength={2000} className="textarea" placeholder="What's the story behind this Pepe?" />
        </label>
        <label>
          <span className="label mb-2 block text-mute">Tags</span>
          <input name="tags" className="input" placeholder="space, neon, smug" />
          <span className="mt-1.5 block text-[12px] text-mute">Comma separated, up to 12.</span>
        </label>
        <label>
          <span className="label mb-2 block text-mute">Original source URL (optional)</span>
          <input name="source_url" type="url" className="input" placeholder="https://" />
          {err("source_url")}
        </label>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-bg2 p-4 text-sm">
        <input type="checkbox" name="permission" className="mt-0.5 size-4 accent-[#A6E56D]" />
        <span>I confirm that I created this artwork or have permission from the rights holder to submit it, and I agree to the <Link href="/terms" className="underline">Terms of Service</Link>.</span>
      </label>
      {err("permission")}

      {msg && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">{msg}</p>}

      {busy && (
        <div className="space-y-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-bg2"><div className="h-full bg-pepe transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="text-[12px] text-mute">{progress! < 100 ? `Uploading… ${progress}%` : "Processing…"}</p>
        </div>
      )}

      <button type="submit" disabled={busy} className="btn-primary h-12 w-full">
        {busy ? <Loader2 className="size-4 animate-spin" /> : null} Submit for review
      </button>
    </form>
  );
}
