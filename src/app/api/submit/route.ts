import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data";
import { parseTags, sha256, slugify, sniffImage } from "@/lib/image";

/**
 * Community submission. Server-side validation of every field and of the file bytes.
 * Inserts the artwork as `pending` + a submission row. Nothing becomes public until an admin approves it.
 */
export async function POST(req: Request) {
  const sb = await supabaseServer();
  if (!sb) return NextResponse.json({ error: "Submissions require the database. The site is running in demo mode." }, { status: 503 });
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Please sign in to submit artwork." }, { status: 401 });
  const { data: me } = await sb.from("users").select("suspended").eq("id", auth.user.id).maybeSingle();
  if (!me || me.suspended) return NextResponse.json({ error: "Your account cannot submit artwork." }, { status: 403 });

  const settings = await getSettings();
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const str = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const title = str("title", 120);
  const description = str("description", 2000);
  const categorySlug = str("category", 40);
  const creatorName = str("creator_name", 60);
  const yearRaw = str("creation_year", 4);
  const sourceUrl = str("source_url", 500);
  const tags = parseTags(str("tags", 300));
  const permission = form.get("permission") === "on" || form.get("permission") === "true";
  const file = form.get("image");

  const errors: Record<string, string> = {};
  if (title.length < 2) errors.title = "Title is required.";
  if (!creatorName) errors.creator_name = "Creator display name is required.";
  if (!permission) errors.permission = "You must confirm you own the artwork or have permission to submit it.";
  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && (!Number.isInteger(year) || year < 2005 || year > new Date().getFullYear())) errors.creation_year = "Enter a valid year.";
  if (sourceUrl && !/^https?:\/\/[^\s]+$/i.test(sourceUrl)) errors.source_url = "Enter a valid http(s) URL.";
  const { data: cat } = await sb.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
  if (!cat) errors.category = "Choose a category.";
  if (!(file instanceof File) || file.size === 0) errors.image = "Choose an image.";
  else if (file.size > settings.uploadMaxMb * 1024 * 1024) errors.image = `Maximum file size is ${settings.uploadMaxMb} MB.`;
  if (Object.keys(errors).length) return NextResponse.json({ error: "Please fix the highlighted fields.", errors }, { status: 422 });

  const bytes = new Uint8Array(await (file as File).arrayBuffer());
  const info = sniffImage(bytes);
  if (!info) return NextResponse.json({ error: "Only JPG, PNG, WEBP and GIF images are allowed.", errors: { image: "Unsupported file type." } }, { status: 422 });

  const hash = await sha256(bytes);
  const path = `${auth.user.id}/${crypto.randomUUID()}.${info.ext}`;
  const up = await sb.storage.from("artworks").upload(path, bytes, { contentType: info.mime, upsert: false });
  if (up.error) return NextResponse.json({ error: `Upload failed: ${up.error.message}` }, { status: 500 });
  const imageUrl = sb.storage.from("artworks").getPublicUrl(path).data.publicUrl;

  const slug = `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`;
  const { data: art, error } = await sb
    .from("artworks")
    .insert({
      title, slug, description: description || null, image_url: imageUrl, thumbnail_url: imageUrl,
      width: info.width, height: info.height, category_id: cat!.id, creator_id: auth.user.id, creator_name: creatorName,
      creation_year: year, source_url: sourceUrl || null, license_type: "Submitted by creator — all rights reserved",
      artwork_type: str("artwork_type", 40) || null, tags, status: "pending", image_hash: hash,
    })
    .select("id")
    .single();
  if (error || !art) {
    await sb.storage.from("artworks").remove([path]);
    return NextResponse.json({ error: error?.message ?? "Could not save the artwork." }, { status: 500 });
  }
  await sb.from("submissions").insert({ user_id: auth.user.id, artwork_id: art.id, status: "pending" });
  return NextResponse.json({ ok: true, slug });
}
