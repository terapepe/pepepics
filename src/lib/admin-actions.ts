"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { parseTags, sha256, slugify, sniffImage } from "@/lib/image";

/* Every admin action re-checks the caller's role on the server. RLS (is_admin()) enforces it again in the database. */
async function requireAdmin() {
  const sb = await supabaseServer();
  if (!sb) throw new Error("Database not connected");
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  const { data: me } = await sb.from("users").select("role,suspended").eq("id", data.user.id).maybeSingle();
  if (!me || me.role !== "admin" || me.suspended) throw new Error("Admins only");
  return { sb, uid: data.user.id };
}

const s = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);
const refresh = () => {
  revalidatePath("/", "layout");
};

async function uploadImage(sb: NonNullable<Awaited<ReturnType<typeof supabaseServer>>>, file: File, folder = "admin") {
  if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name}: larger than 10 MB`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = sniffImage(bytes);
  if (!info) throw new Error(`${file.name}: only JPG, PNG, WEBP, GIF`);
  const path = `${folder}/${crypto.randomUUID()}.${info.ext}`;
  const up = await sb.storage.from("artworks").upload(path, bytes, { contentType: info.mime });
  if (up.error) throw new Error(up.error.message);
  return { url: sb.storage.from("artworks").getPublicUrl(path).data.publicUrl, info, hash: await sha256(bytes) };
}

export type AdminState = { ok?: boolean; error?: string; message?: string } | null;
const wrap = async (fn: () => Promise<string | void>): Promise<AdminState> => {
  try {
    const message = await fn();
    refresh();
    return { ok: true, message: message ?? "Saved" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
};

/* ---------------------------------------------------------------- moderation */
export async function moderate(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = s(fd, "artwork_id", 40);
  const decision = s(fd, "decision", 10) === "approve" ? "approved" : "rejected";
  const note = s(fd, "note", 500) || null;
  if (decision === "rejected" && !note) throw new Error("A rejection reason is required");
  await sb.from("artworks").update({ status: decision }).eq("id", id);
  await sb.from("submissions").update({ status: decision, moderation_note: decision === "rejected" ? note : null }).eq("artwork_id", id);
  refresh();
}

/* ---------------------------------------------------------------- artworks */
export async function saveArtwork(_: AdminState, fd: FormData): Promise<AdminState> {
  return wrap(async () => {
    const { sb } = await requireAdmin();
    const id = s(fd, "id", 40);
    const year = s(fd, "creation_year", 4);
    const patch = {
      title: s(fd, "title", 120),
      description: s(fd, "description", 2000) || null,
      category_id: s(fd, "category_id", 40) || null,
      creator_name: s(fd, "creator_name", 60) || null,
      creation_year: year ? Number(year) : null,
      source_url: s(fd, "source_url") || null,
      license_type: s(fd, "license_type", 120) || null,
      artwork_type: s(fd, "artwork_type", 40) || null,
      tags: parseTags(s(fd, "tags", 300)),
      status: (["pending", "approved", "rejected"].includes(s(fd, "status")) ? s(fd, "status") : "pending") as string,
      featured: fd.get("featured") === "on",
      allow_download: fd.get("allow_download") === "on",
    };
    if (patch.title.length < 2) throw new Error("Title is required");
    const { error } = await sb.from("artworks").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await sb.from("submissions").update({ status: patch.status }).eq("artwork_id", id);
    // collections
    const wanted = fd.getAll("collections").map(String);
    await sb.from("collection_artworks").delete().eq("artwork_id", id);
    if (wanted.length) await sb.from("collection_artworks").insert(wanted.map((collection_id) => ({ collection_id, artwork_id: id })));
    return "Artwork saved";
  });
}

export async function toggleFeatured(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from("artworks").update({ featured: fd.get("featured") === "1" }).eq("id", s(fd, "id", 40));
  refresh();
}

export async function deleteArtwork(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = s(fd, "id", 40);
  const { data } = await sb.from("artworks").select("image_url").eq("id", id).maybeSingle();
  await sb.from("artworks").delete().eq("id", id);
  const marker = "/storage/v1/object/public/artworks/";
  if (data?.image_url?.includes(marker)) await sb.storage.from("artworks").remove([data.image_url.split(marker)[1]]);
  refresh();
  if (fd.get("redirect")) redirect("/admin/artworks");
}

/** Add one or many artworks manually (published immediately). */
export async function createArtworks(_: AdminState, fd: FormData): Promise<AdminState> {
  return wrap(async () => {
    const { sb, uid } = await requireAdmin();
    const files = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) throw new Error("Choose at least one image");
    const baseTitle = s(fd, "title", 120);
    const common = {
      description: s(fd, "description", 2000) || null,
      category_id: s(fd, "category_id", 40) || null,
      creator_name: s(fd, "creator_name", 60) || null,
      source_url: s(fd, "source_url") || null,
      license_type: s(fd, "license_type", 120) || null,
      artwork_type: s(fd, "artwork_type", 40) || null,
      tags: parseTags(s(fd, "tags", 300)),
      featured: fd.get("featured") === "on",
      allow_download: fd.get("allow_download") === "on",
      status: "approved",
    };
    const collection = s(fd, "collection_id", 40);
    let n = 0;
    for (const [i, f] of files.entries()) {
      const { url, info, hash } = await uploadImage(sb, f);
      const title = baseTitle ? (files.length > 1 ? `${baseTitle} #${i + 1}` : baseTitle) : f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120);
      const { data, error } = await sb
        .from("artworks")
        .insert({ ...common, title, slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`, image_url: url, thumbnail_url: url, width: info.width, height: info.height, image_hash: hash, creator_id: null })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      if (collection) await sb.from("collection_artworks").insert({ collection_id: collection, artwork_id: data.id });
      n++;
    }
    void uid;
    return `${n} artwork${n > 1 ? "s" : ""} published`;
  });
}

/* ---------------------------------------------------------------- categories */
export async function saveCategory(_: AdminState, fd: FormData): Promise<AdminState> {
  return wrap(async () => {
    const { sb } = await requireAdmin();
    const id = s(fd, "id", 40);
    const name = s(fd, "name", 60);
    if (!name) throw new Error("Name is required");
    const row: Record<string, unknown> = {
      name,
      slug: slugify(s(fd, "slug", 60) || name),
      description: s(fd, "description", 300) || null,
      display_order: Number(s(fd, "display_order", 5)) || 0,
    };
    const cover = fd.get("cover");
    if (cover instanceof File && cover.size > 0) row.cover_image = (await uploadImage(sb, cover, "covers")).url;
    const { error } = id ? await sb.from("categories").update(row).eq("id", id) : await sb.from("categories").insert(row);
    if (error) throw new Error(error.code === "23505" ? "Slug already exists" : error.message);
    return id ? "Category saved" : "Category created";
  });
}

export async function deleteCategory(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from("categories").delete().eq("id", s(fd, "id", 40));
  refresh();
}

/* ---------------------------------------------------------------- collections */
export async function saveCollection(_: AdminState, fd: FormData): Promise<AdminState> {
  return wrap(async () => {
    const { sb } = await requireAdmin();
    const id = s(fd, "id", 40);
    const title = s(fd, "title", 80);
    if (!title) throw new Error("Title is required");
    const row: Record<string, unknown> = {
      title,
      slug: slugify(s(fd, "slug", 80) || title),
      description: s(fd, "description", 400) || null,
      display_order: Number(s(fd, "display_order", 5)) || 0,
    };
    const coverArt = s(fd, "cover_artwork", 200);
    if (coverArt) row.cover_image = coverArt;
    const { error } = id ? await sb.from("collections").update(row).eq("id", id) : await sb.from("collections").insert(row);
    if (error) throw new Error(error.code === "23505" ? "Slug already exists" : error.message);
    return id ? "Collection saved" : "Collection created";
  });
}

export async function moveCollection(fd: FormData) {
  const { sb } = await requireAdmin();
  const { data } = await sb.from("collections").select("id,display_order").order("display_order").order("created_at");
  const list = data ?? [];
  const i = list.findIndex((c) => c.id === s(fd, "id", 40));
  const j = i + (s(fd, "dir") === "up" ? -1 : 1);
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((c, k) => sb.from("collections").update({ display_order: k + 1 }).eq("id", c.id)));
  refresh();
}

export async function deleteCollection(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from("collections").delete().eq("id", s(fd, "id", 40));
  refresh();
  redirect("/admin/collections");
}

export async function collectionItem(fd: FormData) {
  const { sb } = await requireAdmin();
  const collection_id = s(fd, "collection_id", 40);
  if (s(fd, "op") === "remove") {
    await sb.from("collection_artworks").delete().eq("collection_id", collection_id).eq("artwork_id", s(fd, "artwork_id", 40));
  } else {
    const slug = s(fd, "slug", 160).split("/").pop()!;
    const { data } = await sb.from("artworks").select("id").eq("slug", slug).maybeSingle();
    if (data) await sb.from("collection_artworks").upsert({ collection_id, artwork_id: data.id }, { onConflict: "collection_id,artwork_id", ignoreDuplicates: true });
  }
  refresh();
}

/* ---------------------------------------------------------------- users */
export async function updateUser(fd: FormData) {
  const { sb, uid } = await requireAdmin();
  const id = s(fd, "id", 40);
  const field = s(fd, "field");
  if (id === uid) throw new Error("You cannot change your own role or suspension");
  if (field === "suspended") await sb.from("users").update({ suspended: fd.get("value") === "1" }).eq("id", id);
  if (field === "role") await sb.from("users").update({ role: fd.get("value") === "admin" ? "admin" : "user" }).eq("id", id);
  refresh();
}

/* ---------------------------------------------------------------- settings */
export async function saveSettings(_: AdminState, fd: FormData): Promise<AdminState> {
  return wrap(async () => {
    const { sb } = await requireAdmin();
    const rows: { key: string; value: unknown }[] = [
      { key: "siteName", value: s(fd, "siteName", 40) },
      { key: "heroTitle", value: s(fd, "heroTitle", 120) },
      { key: "heroSubtitle", value: s(fd, "heroSubtitle", 300) },
      { key: "metaDescription", value: s(fd, "metaDescription", 300) },
      { key: "xUrl", value: s(fd, "xUrl", 200) },
      { key: "uploadMaxMb", value: Math.min(10, Math.max(1, Number(s(fd, "uploadMaxMb", 3)) || 10)) },
    ];
    const logo = fd.get("logo");
    if (logo instanceof File && logo.size > 0) rows.push({ key: "logoUrl", value: (await uploadImage(sb, logo, "brand")).url });
    if (fd.get("resetLogo") === "on") rows.push({ key: "logoUrl", value: "" });
    const { error } = await sb.from("site_settings").upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })));
    if (error) throw new Error(error.message);
    return "Settings saved";
  });
}
