import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;

async function auth() {
  const sb = await supabaseServer();
  if (!sb) return { error: NextResponse.json({ error: "Database not connected" }, { status: 503 }) };
  const { data } = await sb.auth.getUser();
  if (!data.user) return { error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  return { sb, uid: data.user.id };
}

async function ids(req: Request) {
  const body = await req.json().catch(() => ({}));
  return Array.isArray(body.ids) ? body.ids.filter((x: unknown): x is string => typeof x === "string" && UUID.test(x)).slice(0, 200) : [];
}

export async function GET() {
  const a = await auth();
  if (a.error) return a.error;
  const { data } = await a.sb.from("favorites").select("artwork_id,created_at").eq("user_id", a.uid).order("created_at", { ascending: false });
  return NextResponse.json({ items: (data ?? []).map((r) => ({ id: r.artwork_id, at: r.created_at })) });
}

export async function POST(req: Request) {
  const a = await auth();
  if (a.error) return a.error;
  const list = await ids(req);
  if (list.length) {
    const { error } = await a.sb.from("favorites").upsert(list.map((artwork_id: string) => ({ user_id: a.uid, artwork_id })), { onConflict: "user_id,artwork_id", ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const a = await auth();
  if (a.error) return a.error;
  const list = await ids(req);
  if (list.length) await a.sb.from("favorites").delete().eq("user_id", a.uid).in("artwork_id", list);
  return NextResponse.json({ ok: true });
}
