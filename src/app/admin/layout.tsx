import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isLive } from "@/lib/data";
import { AdminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isLive)
    return (
      <div className="container-x max-w-2xl py-20">
        <h1 className="h-display text-5xl">ADMIN</h1>
        <div className="card mt-8 space-y-3 p-6 text-mute">
          <p>The admin dashboard needs the database. This site is running in <strong className="text-pepe">demo mode</strong>.</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Create a Supabase project and run the migration in <code>supabase/migrations</code>, then <code>supabase/seed.sql</code>.</li>
            <li>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
            <li>Sign up, then promote your account in the SQL editor (see README).</li>
          </ol>
          <Link href="/" className="btn-ghost btn-sm mt-2">Back to gallery</Link>
        </div>
      </div>
    );
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin");
  if (me.profile?.role !== "admin" || me.profile.suspended) redirect("/");
  return (
    <div className="container-x grid gap-8 pt-8 lg:grid-cols-[220px_1fr]">
      <AdminNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
