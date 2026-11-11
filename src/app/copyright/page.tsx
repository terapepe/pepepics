import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Copyright & Takedown Policy" };

export default function Copyright() {
  return (
    <ProsePage eyebrow="Legal" title="COPYRIGHT & TAKEDOWN" updated="November 11, 2026">
      <p>PEPE.PICS is an independent fan-driven gallery and is not affiliated with or endorsed by Matt Furie or the original Pepe the Frog creators. Artwork remains the property of its respective creators and rights holders.</p>
      <h2>Requesting a takedown</h2>
      <p>If you own the rights to an artwork shown here and did not authorize it, send us:</p>
      <ul>
        <li>the URL of the artwork page on PEPE.PICS;</li>
        <li>a link or description of your original work;</li>
        <li>your contact details and a statement that you are the rights holder (or authorized to act for them).</li>
      </ul>
      <p>Contact us via direct message on X at <a href={siteConfig.social.x} target="_blank" rel="noopener noreferrer">{siteConfig.social.xHandle}</a>. We review every request and remove infringing artwork promptly.</p>
      <h2>Repeat infringers</h2>
      <p>Accounts that repeatedly submit infringing work are suspended.</p>
    </ProsePage>
  );
}
