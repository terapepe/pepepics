"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { activeNetworks, explorerUrl, networkCA, siteConfig, type Network } from "@/config/site";
import { useToast } from "@/components/providers";

const short = (s: string) => (s.length > 16 ? `${s.slice(0, 6)}…${s.slice(-6)}` : s);

export function NetworkIcon({ net, size = 20 }: { net: Network; size?: number }) {
  return <Image src={net.icon} alt={net.name} width={size} height={size} className="shrink-0 rounded-full" unoptimized />;
}

/** One CA row: network SVG + address + copy. */
export function CARow({ net, compact = false }: { net: Network; compact?: boolean }) {
  const ca = networkCA(net);
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const exp = explorerUrl(net);
  const copy = async () => {
    if (!ca) return;
    try {
      await navigator.clipboard.writeText(ca);
      setCopied(true);
      toast(`${net.short} contract address copied`);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Copy failed", "error");
    }
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-bg2 px-3 py-2.5">
      <NetworkIcon net={net} size={compact ? 22 : 28} />
      <div className="min-w-0 flex-1">
        <div className="label text-mute">{net.name}</div>
        <div className="truncate font-mono text-[13px] text-ink" title={ca || undefined}>
          {ca ? (compact ? short(ca) : ca) : <span className="text-mute">CA coming soon</span>}
        </div>
      </div>
      {exp && (
        <a href={exp} target="_blank" rel="noopener noreferrer" className="icon-btn size-8" aria-label={`View on ${net.name} explorer`}>
          <ExternalLink className="size-4" />
        </a>
      )}
      <button onClick={copy} disabled={!ca} className="icon-btn size-8 disabled:opacity-30" aria-label={`Copy ${net.short} contract address`}>
        {copied ? <Check className="size-4 text-pepe" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

/** Token section. Single mode → themed for that one network. Multi mode → all 4 networks. */
export function TokenPanel() {
  const nets = activeNetworks();
  const single = siteConfig.mode === "single";
  const n0 = nets[0];
  const { symbol, name } = siteConfig.token;
  const evmShared = !single && nets.filter((n) => n.type === "evm").map((n) => n.short).join(", ");

  return (
    <section className="container-x py-16 md:py-24" id="token">
      <div
        className="relative overflow-hidden rounded-[28px] border border-line bg-bg2 p-6 md:p-10"
        style={single ? { borderColor: `${n0.color}55`, boxShadow: `inset 0 1px 0 ${n0.color}33` } : undefined}
      >
        {single && <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-20 blur-3xl" style={{ background: n0.color }} />}
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <div className="label flex items-center gap-2 text-pepe">
              {single ? (
                <>
                  <NetworkIcon net={n0} size={18} /> <span style={{ color: n0.color }}>Live on {n0.name}</span>
                </>
              ) : (
                <>
                  <span className="flex -space-x-1.5">{nets.map((n) => <NetworkIcon key={n.key} net={n} size={18} />)}</span> Multichain
                </>
              )}
            </div>
            <h2 className="h-display mt-4 text-4xl md:text-6xl">
              ${symbol}
              <span className="block text-mute text-2xl md:text-3xl mt-2 tracking-[-0.02em]">The gallery&apos;s community token</span>
            </h2>
            <p className="mt-5 max-w-md text-mute leading-relaxed">
              {single
                ? `${name} on ${n0.name}. ${n0.tagline}`
                : `${name} lives on ${nets.map((n) => n.short).join(", ")}. ${evmShared} share the same contract address.`}{" "}
              Always verify the address before interacting.
            </p>
          </div>
          <div className={single ? "" : "grid gap-3 sm:grid-cols-2"}>
            {nets.map((n) => (
              <CARow key={n.key} net={n} compact={!single} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact CA popover trigger for the header. */
export function CAButton() {
  const [open, setOpen] = useState(false);
  const nets = activeNetworks();
  return (
    <div className="relative hidden md:block" onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen((v) => !v)} className="chip h-9 gap-2" aria-expanded={open} aria-label="Token contract addresses">
        <span className="flex -space-x-1.5">{nets.map((n) => <NetworkIcon key={n.key} net={n} size={16} />)}</span>
        <span className="font-display text-[12px] font-semibold tracking-wider text-ink">${siteConfig.token.symbol}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 pt-2">
          <div className="w-[340px] space-y-2 rounded-2xl border border-line bg-card p-3 shadow-2xl">
            <div className="label px-1 pb-1 text-mute">${siteConfig.token.symbol} contract address</div>
            {nets.map((n) => (
              <CARow key={n.key} net={n} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
