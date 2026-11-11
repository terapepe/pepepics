import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { getCurrentUser, isLive } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your Profile", robots: { index: false } };

const badge: Record<string, string> = { pending: "border-yellow-500/40 text-yellow-300", approved: "border-pepe/50 text-pepe", rejected: "border-red-500/40 text-red-300" };

export default async function ProfilePage() {
  if (!isLive) redirect("/login");
  const me = await getCurrentUser();
  if (!me?.profile) redirect("/login?next=/profile");
  const sb = (await supabaseServer())!;
  const [{ data: subs }, { count: favCount }] = await Promise.all([
    sb.from("submissions").select("id,status,moderation_note,created_at,artwork:artworks(slug,title,thumbnail_url)").eq("user_id", me.id).order("created_at", { ascending: false }),
    sb.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", me.id),
  ]);
  const p = me.profile;
  return (
    <div className="container-x pt-10 md:pt-16">
      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4">
          <div className="card p-6">
            <h1 className="h-display text-3xl">@{p.username}</h1>
            <p className="label mt-2 text-mute">Joined {new Date(p.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })} · {p.role}</p>
            <div className="mt-4 flex gap-2">
              <Link href={`/creator/${p.username}`} className="btn-ghost btn-sm">Public profile</Link>
              <Link href="/favorites" className="btn-ghost btn-sm">{favCount ?? 0} favorites</Link>
            </div>
          </div>
          <ProfileForm username={p.username} bio={p.bio ?? ""} avatar={p.avatar_url} />
        </aside>
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="h-display text-3xl">MY SUBMISSIONS</h2>
            <Link href="/submit" className="btn-primary btn-sm">Submit artwork</Link>
          </div>
          {subs?.length ? (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {subs.map((s: any) => (
                <li key={s.id} className="flex items-center gap-4 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.artwork?.thumbnail_url && <img src={s.artwork.thumbnail_url} alt="" className="size-14 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1">
                    <Link href={`/artwork/${s.artwork?.slug}`} className="block truncate font-medium hover:text-pepe">{s.artwork?.title}</Link>
                    <div className="text-[12px] text-mute">{new Date(s.created_at).toLocaleDateString()}</div>
                    {s.status === "rejected" && s.moderation_note && <div className="mt-1 text-[13px] text-red-300">Reason: {s.moderation_note}</div>}
                  </div>
                  <span className={`label rounded-full border px-2.5 py-1 text-[10px] ${badge[s.status]}`}>{s.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="card p-8 text-center text-mute">You haven&apos;t submitted any artwork yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
