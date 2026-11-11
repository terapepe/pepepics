import Link from "next/link";
import { adminClient } from "@/lib/admin";
import { updateUser } from "@/lib/admin-actions";
import { ActionButton } from "@/components/admin/action-form";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminUsers({ searchParams }: Props) {
  const { sb, me } = await adminClient();
  const q = ((await searchParams).q ?? "").replace(/[^\w]/g, "").toLowerCase();
  let query = sb.from("users").select("id,username,avatar_url,role,suspended,created_at,submissions:submissions(count)").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.ilike("username", `%${q}%`);
  const { data } = await query;
  return (
    <div>
      <h1 className="h-display text-4xl md:text-5xl">USERS</h1>
      <form className="mt-6 flex gap-2"><input name="q" defaultValue={q} placeholder="Search username…" className="input h-10 max-w-xs" /><button className="btn-ghost btn-sm h-10">Search</button></form>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-bg2 text-left text-mute"><tr><th className="p-3">User</th><th className="p-3">Joined</th><th className="p-3">Submissions</th><th className="p-3">Role</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-line">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(data ?? []).map((u: any) => (
              <tr key={u.id} className={`bg-card ${u.suspended ? "opacity-60" : ""}`}>
                <td className="p-3"><Link href={`/creator/${u.username}`} className="font-medium hover:text-pepe">@{u.username}</Link>{u.suspended && <span className="label ml-2 text-[10px] text-red-300">suspended</span>}</td>
                <td className="p-3 text-mute">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-mute">{u.submissions?.[0]?.count ?? 0}</td>
                <td className="p-3"><span className={`label text-[10px] ${u.role === "admin" ? "text-pepe" : "text-mute"}`}>{u.role}</span></td>
                <td className="p-3">
                  {u.id === me.id ? (
                    <span className="block text-right text-[12px] text-mute">You</span>
                  ) : (
                    <div className="flex justify-end gap-1.5">
                      <ActionButton action={updateUser} fields={{ id: u.id, field: "suspended", value: u.suspended ? "0" : "1" }} label={u.suspended ? "Unsuspend" : "Suspend"} confirm={u.suspended ? undefined : `Suspend @${u.username}? They will no longer be able to submit.`} />
                      <ActionButton action={updateUser} fields={{ id: u.id, field: "role", value: u.role === "admin" ? "user" : "admin" }} label={u.role === "admin" ? "Remove admin" : "Make admin"} confirm={u.role === "admin" ? `Remove admin rights from @${u.username}?` : `Give @${u.username} full admin rights?`} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
