import type { Metadata } from "next";
import { FavoritesView } from "@/components/gallery/favorites-view";

export const metadata: Metadata = { title: "Your Favorites", robots: { index: false } };

export default function FavoritesPage() {
  return (
    <div className="container-x pt-10 md:pt-16">
      <header className="mb-10">
        <div className="label mb-4 text-pepe">Saved</div>
        <h1 className="h-display text-[48px] md:text-[88px]">YOUR FAVORITES</h1>
      </header>
      <FavoritesView />
    </div>
  );
}
