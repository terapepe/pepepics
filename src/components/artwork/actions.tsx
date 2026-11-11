"use client";

import { Download, Link2, Share2 } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { useToast } from "@/components/providers";
import type { Artwork } from "@/lib/types";

export function ArtworkActions({ a }: { a: Artwork }) {
  const toast = useToast();
  const url = () => window.location.href;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      toast("Artwork link copied");
    } catch {
      toast("Copy failed", "error");
    }
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: a.title, text: `${a.title} on PEPE.PICS`, url: url() });
      } catch {
        /* cancelled */
      }
    } else {
      window.open(`https://x.com/intent/post?text=${encodeURIComponent(`${a.title} on PEPE.PICS`)}&url=${encodeURIComponent(url())}`, "_blank", "noopener");
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <FavoriteButton id={a.id} title={a.title} withLabel className="btn-primary" />
      <button onClick={share} className="btn-ghost"><Share2 className="size-4" /> Share</button>
      <button onClick={copy} className="btn-ghost"><Link2 className="size-4" /> Copy link</button>
      {a.allow_download && (
        <a href={a.image_url} download className="btn-ghost"><Download className="size-4" /> Download</a>
      )}
    </div>
  );
}
