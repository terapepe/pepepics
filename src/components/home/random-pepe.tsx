"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Shuffle } from "lucide-react";
import { useToast } from "@/components/providers";

export function RandomPepeButton({ className = "btn-primary h-12 px-7" }: { className?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await fetch("/api/random", { cache: "no-store" });
          const j = await r.json();
          if (j.slug) router.push(`/artwork/${j.slug}`);
          else toast("The gallery is empty right now", "info");
        } catch {
          toast("Could not pick a random Pepe", "error");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Shuffle className="size-4" />} Discover Random Pepe
    </button>
  );
}
