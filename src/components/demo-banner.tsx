import { isLive } from "@/lib/env";

/** Shown only when Supabase env vars are missing. */
export function DemoBanner() {
  if (isLive) return null;
  return (
    <div className="border-b border-line bg-pepe/10 text-center text-[12px] text-pepe">
      <div className="container-x py-2">
        <strong className="font-semibold">Demo mode</strong> — database not connected. Showing labeled sample artwork; favorites are saved in this browser only.
        Set <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code> &amp; <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to go live.
      </div>
    </div>
  );
}
