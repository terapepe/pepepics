import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, isLive } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";

/** For admin pages: returns a Supabase client for a verified admin, or redirects. */
export async function adminClient() {
  if (!isLive) redirect("/admin");
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin");
  if (me.profile?.role !== "admin" || me.profile.suspended) redirect("/");
  return { sb: (await supabaseServer())!, me };
}
