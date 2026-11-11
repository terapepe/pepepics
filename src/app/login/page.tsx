import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/forms/auth-form";
import { getCurrentUser, isLive } from "@/lib/data";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/";
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-14" />
          <h1 className="h-display mt-5 text-4xl">{sp.mode === "signup" ? "JOIN THE GALLERY" : "WELCOME BACK"}</h1>
          <p className="mt-2 text-mute">Save favorites across devices and submit your artwork.</p>
        </div>
        {isLive ? (
          <AuthForm initialMode={sp.mode === "signup" ? "signup" : "login"} next={next} error={sp.error} />
        ) : (
          <div className="card p-6 text-center text-sm text-mute">
            Accounts need the database. This site is in <strong className="text-pepe">demo mode</strong> — favorites are still saved in your browser.
          </div>
        )}
      </div>
    </div>
  );
}
