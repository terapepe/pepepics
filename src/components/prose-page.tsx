export function ProsePage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="container-x max-w-3xl pt-10 md:pt-16">
      <div className="label mb-4 text-pepe">{eyebrow}</div>
      <h1 className="h-display text-[44px] md:text-[72px]">{title}</h1>
      {updated && <p className="mt-3 text-sm text-mute">Last updated: {updated}</p>}
      <div className="mt-10 space-y-5 text-[16px] leading-relaxed text-ink/85 [&_a]:text-pepe [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </div>
  );
}
