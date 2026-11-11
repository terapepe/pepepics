import Link from "next/link";
import { Logo, XIcon } from "@/components/logo";
import { siteConfig } from "@/config/site";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/categories", label: "Categories" },
  { href: "/collections", label: "Collections" },
  { href: "/community", label: "Community" },
  { href: "/submit", label: "Submit Artwork" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/copyright", label: "Copyright & Takedown Policy" },
];

export function Footer({ siteName, logoUrl, xUrl }: { siteName: string; logoUrl: string; xUrl: string }) {
  const handle = "@" + xUrl.replace(/\/$/, "").split("/").pop();
  return (
    <footer className="mt-24 border-t border-line bg-bg2">
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.2fr_2fr]">
        <div className="space-y-4">
          <Logo name={siteName} logoUrl={logoUrl} />
          <p className="h-display text-2xl text-ink/90">Every Pepe Has a Story.</p>
          <div className="flex items-center gap-2">
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className="chip" aria-label={`Follow ${handle} on X`}>
              <XIcon className="size-3.5" /> {handle}
            </a>
            {siteConfig.social.community.map((c) => (
              <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="chip">{c.label}</a>
            ))}
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-3" aria-label="Footer">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-mute transition hover:text-pepe">{l.label}</Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-x space-y-3 py-6 text-[12px] leading-relaxed text-mute">
          <p>
            {siteName} is an independent fan-driven gallery and is not affiliated with or endorsed by Matt Furie or the original Pepe the Frog creators.
            Artwork remains the property of its respective creators and rights holders.
          </p>
          <p>© 2026 {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
