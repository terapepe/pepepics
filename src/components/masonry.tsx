"use client";

import { Children, isValidElement, useEffect, useState } from "react";

const BREAKS: [number, number][] = [[1500, 5], [1100, 4], [768, 3], [0, 2]];
const colsFor = (w: number) => BREAKS.find(([min]) => w >= min)![1];

/**
 * Left-to-right masonry: each item goes into the currently shortest column (by aspect ratio),
 * so reading order follows the sort. Before hydration it falls back to CSS columns.
 * Children may pass a `data-ratio` (height / width) prop.
 */
export function Masonry({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [cols, setCols] = useState<number | null>(null);
  useEffect(() => {
    const on = () => setCols(colsFor(window.innerWidth));
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const items = Children.toArray(children);
  if (!cols) return <div className={`masonry ${className}`}>{items}</div>;
  const heights = new Array(cols).fill(0);
  const buckets: React.ReactNode[][] = Array.from({ length: cols }, () => []);
  items.forEach((el) => {
    const r = isValidElement<{ "data-ratio"?: number }>(el) ? Number(el.props["data-ratio"]) || 1.25 : 1.25;
    const i = heights.indexOf(Math.min(...heights));
    buckets[i].push(el);
    heights[i] += r + 0.18; // + caption
  });
  return (
    <div className={`flex gap-4 lg:gap-5 ${className}`}>
      {buckets.map((b, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-5">{b}</div>
      ))}
    </div>
  );
}
