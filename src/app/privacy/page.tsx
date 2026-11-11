import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <ProsePage eyebrow="Legal" title="PRIVACY POLICY" updated="November 11, 2026">
      <p>This policy explains what PEPE.PICS collects and why. We keep it short because we collect very little.</p>
      <h2>What we store</h2>
      <ul>
        <li><strong>Account data</strong> — email address, username, optional avatar and bio, and the date you joined.</li>
        <li><strong>Your activity</strong> — artwork you submit, its moderation status, and the artwork you favorite.</li>
        <li><strong>Browser storage</strong> — as a guest, your favorites and recent searches are stored only in your browser (localStorage).</li>
        <li><strong>Aggregate counters</strong> — an anonymous view count per artwork. We do not store who viewed what.</li>
      </ul>
      <h2>What we don&apos;t do</h2>
      <p>We do not sell personal data, run third-party advertising trackers, or share your email publicly. Your email is never shown on your profile.</p>
      <h2>Service providers</h2>
      <p>Accounts, the database and image storage are hosted by Supabase. If you choose Google login, Google shares your email and basic profile with us.</p>
      <h2>Your choices</h2>
      <p>You can edit your profile at any time. To delete your account and submissions, contact us via our X account and we will remove them.</p>
    </ProsePage>
  );
}
