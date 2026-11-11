import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <clipPath id="pp-mark-c">
          <circle cx="32" cy="32" r="31" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="31" fill="#A6E56D" />
      <g clipPath="url(#pp-mark-c)">
        <rect x="0" y="38" width="64" height="30" fill="#0B0D0B" />
        <rect x="0" y="38" width="64" height="3" fill="#75B94A" />
      </g>
      <circle cx="21.5" cy="30" r="9" fill="#F3F4EC" stroke="#0B0D0B" strokeWidth="2.5" />
      <circle cx="42.5" cy="30" r="9" fill="#F3F4EC" stroke="#0B0D0B" strokeWidth="2.5" />
      <circle cx="24" cy="31" r="3.6" fill="#0B0D0B" />
      <circle cx="45" cy="31" r="3.6" fill="#0B0D0B" />
      <rect x="17" y="48" width="30" height="3" rx="1.5" fill="#A6E56D" opacity=".9" />
    </svg>
  );
}

export function Wordmark({ name = "PEPE.PICS" }: { name?: string }) {
  const [a, ...rest] = name.split(".");
  return (
    <span className="font-display text-[19px] font-bold tracking-[-0.02em]">
      {rest.length ? (
        <>
          {a}
          <span className="text-pepe">.</span>
          {rest.join(".")}
        </>
      ) : (
        name
      )}
    </span>
  );
}

export function Logo({ name, logoUrl }: { name?: string; logoUrl?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${name ?? "PEPE.PICS"} home`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="size-9 rounded-full object-cover" />
      ) : (
        <LogoMark />
      )}
      <Wordmark name={name} />
    </Link>
  );
}

export function XIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.8 2h6.4l4.4 5.8L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
    </svg>
  );
}
