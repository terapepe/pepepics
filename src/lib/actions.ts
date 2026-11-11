"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { sniffImage } from "@/lib/image";

export type ActionState = { ok?: boolean; error?: string } | null;

/** Update own profile (username, bio, avatar). RLS + trigger prevent touching role/suspended. */
export async function updateProfile(_: ActionState, fd: FormData): Promise<ActionState> {
  const sb = await supabaseServer();
  if (!sb) return { error: "Database not connected." };
  const { data } = await sb.auth.getUser();
  if (!data.user) return { error: "Please sign in." };
  const username = String(fd.get("username") ?? "").trim().toLowerCase();
  const bio = String(fd.get("bio") ?? "").trim().slice(0, 280);
  if (!/^[a-z0-9_]{3,24}$/.test(username)) return { error: "Username: 3–24 characters, letters, numbers or _." };
  const patch: Record<string, string | null> = { username, bio: bio || null };

  const avatar = fd.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > 2 * 1024 * 1024) return { error: "Avatar must be 2 MB or smaller." };
    const bytes = new Uint8Array(await avatar.arrayBuffer());
    const info = sniffImage(bytes);
    if (!info) return { error: "Avatar must be JPG, PNG, WEBP or GIF." };
    const path = `${data.user.id}/avatar-${Date.now()}.${info.ext}`;
    const up = await sb.storage.from("artworks").upload(path, bytes, { contentType: info.mime });
    if (up.error) return { error: up.error.message };
    patch.avatar_url = sb.storage.from("artworks").getPublicUrl(path).data.publicUrl;
  }
  const { error } = await sb.from("users").update(patch).eq("id", data.user.id);
  if (error) return { error: error.code === "23505" ? "That username is taken." : error.message };
  revalidatePath("/profile");
  return { ok: true };
}
