import type { Metadata } from "next";
import { CategoryCard } from "@/components/cards";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = { title: "Categories", description: "Browse Pepe art by category: Classic, Rare, Anime, Cyber, Space, Pixel, Art and Crypto." };
export const revalidate = 60;

export default async function CategoriesPage() {
  const cats = await getCategories();
  return (
    <div className="container-x pt-10 md:pt-16">
      <header className="mb-12 max-w-3xl">
        <div className="label mb-4 text-pepe">{cats.length} categories</div>
        <h1 className="h-display text-[48px] md:text-[88px]">EXPLORE THE PEPEVERSE</h1>
        <p className="mt-4 text-lg text-mute">Every style, every era, every corner of the internet. Pick one and start scrolling.</p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {cats.map((c) => <CategoryCard key={c.id} c={c} large />)}
      </div>
    </div>
  );
}
