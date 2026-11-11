"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useFavorites } from "@/components/providers";

export function FavoriteButton({ id, title, className = "", withLabel = false }: { id: string; title?: string; className?: string; withLabel?: boolean }) {
  const { has, toggle } = useFavorites();
  const on = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id, title);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
      className={className || `grid size-9 place-items-center rounded-full backdrop-blur-md transition ${on ? "bg-pepe text-bg" : "bg-black/45 text-ink hover:bg-black/70"}`}
    >
      <motion.span key={String(on)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className="flex items-center gap-2">
        <Heart className="size-4" fill={on ? "currentColor" : "none"} />
        {withLabel && <span>{on ? "Favorited" : "Add to Favorites"}</span>}
      </motion.span>
    </button>
  );
}
