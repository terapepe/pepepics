import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase/server";

/** Counts one view for an approved artwork (database mode only). */
export async function POST(req: Request) {
  const { slug } = await req.json().catch(() => ({ slug: null }));
  const sb = supabasePublic();
  if (sb && typeof slug === "string" && /^[a-z0-9-]{1,140}$/.test(slug)) await sb.rpc("increment_artwork_view", { p_slug: slug });
  return NextResponse.json({ ok: true });
}
