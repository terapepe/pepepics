import { ArtworkCardSkeleton } from "@/components/artwork-card";

export default function Loading() {
  return (
    <div className="container-x pb-10 pt-10 md:pt-16">
      <div className="mb-10 h-24 w-2/3 animate-pulse rounded-2xl bg-card" />
      <div className="mb-8 h-14 animate-pulse rounded-2xl bg-card" />
      <div className="masonry">{Array.from({ length: 12 }, (_, i) => <ArtworkCardSkeleton key={i} i={i} />)}</div>
    </div>
  );
}
