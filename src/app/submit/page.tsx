import type { Metadata } from "next";
import Link from "next/link";
import { SubmitForm } from "@/components/forms/submit-form";
import { getCategories, getCurrentUser, getSettings, isLive } from "@/lib/data";

export const metadata: Metadata = { title: "Submit Artwork", description: "Share your Pepe artwork with the PEPE.PICS community." };

export default async function SubmitPage() {
  const [cats, user, settings] = await Promise.all([getCategories(), getCurrentUser(), getSettings()]);
  return (
    <div className="container-x pt-10 md:pt-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <header className="lg:sticky lg:top-28 lg:self-start">
          <div className="label mb-4 text-pepe">Submit</div>
          <h1 className="h-display text-[48px] md:text-[80px]">YOUR PEPE BELONGS HERE.</h1>
          <p className="mt-5 max-w-md text-lg text-mute">Have an interesting Pepe creation? Share it with the world and become part of the gallery.</p>
          <ul className="mt-8 space-y-3 text-sm text-mute">
            <li>• JPG, PNG, WEBP or GIF up to {settings.uploadMaxMb} MB.</li>
            <li>• Every submission is reviewed by a moderator before it goes public.</li>
            <li>• Only submit work you made or have permission to share.</li>
            <li>• Read our <Link href="/terms" className="underline hover:text-ink">Terms</Link> and <Link href="/copyright" className="underline hover:text-ink">Copyright Policy</Link>.</li>
          </ul>
        </header>
        <div>
          {!isLive ? (
            <div className="mb-6 rounded-2xl border border-pepe/40 bg-pepe/10 p-4 text-sm text-pepe">
              <strong>Demo mode:</strong> the database is not connected, so submissions cannot be saved. You can still try the form and image preview.
            </div>
          ) : !user ? (
            <div className="mb-6 rounded-2xl border border-line bg-card p-5">
              <p className="text-ink">Sign in to submit artwork and track its review status.</p>
              <div className="mt-3 flex gap-2">
                <Link href="/login?next=/submit" className="btn-primary btn-sm">Log in</Link>
                <Link href="/login?mode=signup&next=/submit" className="btn-ghost btn-sm">Create account</Link>
              </div>
            </div>
          ) : user.profile?.suspended ? (
            <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">Your account is suspended and cannot submit artwork.</div>
          ) : null}
          <SubmitForm
            categories={cats.map(({ slug, name }) => ({ slug, name }))}
            maxMb={settings.uploadMaxMb}
            enabled={isLive && !!user && !user.profile?.suspended}
            defaultCreator={user?.profile?.username ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
