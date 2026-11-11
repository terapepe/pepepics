import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "About", description: "What PEPE.PICS is and how the gallery works." };

export default function About() {
  return (
    <ProsePage eyebrow="About" title="EVERY PEPE HAS A STORY.">
      <p>PEPE.PICS is an independent, fan-driven gallery for Pepe art — a place to discover, collect and share the endless creative variations the internet has made of one very famous frog.</p>
      <p>It is built like an art platform, not a meme dump: every piece has a page with its creator, its source, its license and its story. Artwork is grouped into categories and curated collections, and the community can submit new work for review.</p>
      <h2>How the gallery works</h2>
      <ul>
        <li><strong>Explore</strong> — search by title, creator, tag or description, filter by category, and sort by latest, popular or random.</li>
        <li><strong>Collect</strong> — tap the heart to save favorites. They live in your browser, and sync to your account when you log in.</li>
        <li><strong>Submit</strong> — share your own Pepe. A moderator reviews every submission before it becomes public.</li>
      </ul>
      <h2>About the sample artwork</h2>
      <p>Pieces labeled <em>Sample</em> are generated placeholder images made for this site so every category has something to show on day one. They are not historical originals or Rare Pepe collectibles, and they are replaced as real artwork is approved.</p>
      <h2>Credit where it&apos;s due</h2>
      <p>Pepe the Frog was created by Matt Furie. PEPE.PICS is not affiliated with or endorsed by Matt Furie or the original creators. Artwork remains the property of its respective creators and rights holders. See our <Link href="/copyright">Copyright &amp; Takedown Policy</Link>.</p>
      <h2>Community</h2>
      <p>Follow <a href={siteConfig.social.x} target="_blank" rel="noopener noreferrer">{siteConfig.social.xHandle}</a> on X for new collections and featured artists.</p>
    </ProsePage>
  );
}
