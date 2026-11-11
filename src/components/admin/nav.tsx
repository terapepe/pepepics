"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, Inbox, Layers, LayoutGrid, Settings, Shield, Users } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: Shield },
  { href: "/admin/moderation", label: "Moderation", icon: Inbox },
  { href: "/admin/artworks", label: "Artworks", icon: Images },
  { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { href: "/admin/collections", label: "Collections", icon: Layers },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const p = usePathname();
  return (
    <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:self-start lg:px-0" aria-label="Admin">
      <div className="label mb-2 hidden px-3 text-pepe lg:block">Admin</div>
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const on = href === "/admin" ? p === href : p.startsWith(href);
        return (
          <Link key={href} href={href} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${on ? "bg-pepe text-bg" : "text-ink/80 hover:bg-white/5"}`}>
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
