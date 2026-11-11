import type { Metadata } from "next";
import { CollectionCard } from "@/components/cards";
import { EmptyState } from "@/components/section";
import { getCollections } from "@/lib/data";

export const metadata: Metadata = { title: "Curated Collections", description: "Hand-picked sets of Pepe artwork, curated by the PEPE.PICS team." };
export const revalidate = 60;

export default async function CollectionsPage() {
  const cols = await getCollections();
  return (
    <div className="container-x pt-10 md:pt-16">
      <header className="mb-12 max-w-3xl">
        <div className="label mb-4 text-pepe">Hand-picked</div>
        <h1 className="h-display text-[48px] md:text-[88px]">CURATED COLLECTIONS</h1>
        <p className="mt-4 text-lg text-mute">Themed rooms of the gallery — each one a different story told through Pepe.</p>
      </header>
      {cols.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cols.map((c) => <CollectionCard key={c.id} c={c} />)}</div>
      ) : (
        <EmptyState title="No collections yet" text="Curators are putting the first rooms together." />
      )}
    </div>
  );
}
