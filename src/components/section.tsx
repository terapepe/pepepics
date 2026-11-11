import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({ eyebrow, title, subtitle, href, cta = "View all" }: { eyebrow?: string; title: string; subtitle?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
      <div>
        {eyebrow && <div className="label mb-3 text-pepe">{eyebrow}</div>}
        <h2 className="h-display text-[34px] md:text-[56px]">{title}</h2>
        {subtitle && <p className="mt-3 max-w-xl text-mute">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="group label flex items-center gap-2 text-ink/80 hover:text-pepe">
          {cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="card grid place-items-center gap-3 px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-full border border-line text-2xl" aria-hidden>🐸</div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="max-w-md text-mute">{text}</p>
      {action}
    </div>
  );
}
