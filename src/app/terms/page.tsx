import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <ProsePage eyebrow="Legal" title="TERMS OF SERVICE" updated="November 11, 2026">
      <p>By using PEPE.PICS you agree to these terms.</p>
      <h2>Submitting artwork</h2>
      <ul>
        <li>Only submit artwork you created or have permission from the rights holder to share.</li>
        <li>You keep ownership of your work. By submitting, you allow PEPE.PICS to display it in the gallery, in thumbnails and in social previews.</li>
        <li>Every submission is reviewed. We may reject or remove any artwork at our discretion.</li>
      </ul>
      <h2>Not allowed</h2>
      <ul>
        <li>Hateful, harassing, violent, sexual or illegal content — including hateful uses of the Pepe character.</li>
        <li>Content that infringes someone else&apos;s copyright or trademark.</li>
        <li>Spam, scams, impersonation, or misleading claims about an artwork&apos;s origin or rarity.</li>
      </ul>
      <p>Accounts that break these rules may be suspended.</p>
      <h2>Downloads</h2>
      <p>Downloads are offered only where the license allows it. Respect each artwork&apos;s license and credit the creator.</p>
      <h2>No financial advice</h2>
      <p>Mentions of tokens or networks on this site are informational only and are not financial advice.</p>
      <h2>Copyright</h2>
      <p>See the <Link href="/copyright">Copyright &amp; Takedown Policy</Link>.</p>
    </ProsePage>
  );
}
