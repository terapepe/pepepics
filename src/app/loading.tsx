export default function Loading() {
  return (
    <div className="container-x pt-16">
      <div className="h-24 w-2/3 animate-pulse rounded-2xl bg-card" />
      <div className="mt-6 h-5 w-1/3 animate-pulse rounded bg-card" />
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-card" />)}</div>
    </div>
  );
}
