"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, LogIn, LogOut, Menu, Search, Shield, Upload, User, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { CAButton, CARow } from "@/components/token";
import { useAuth, useFavorites, useSearch } from "@/components/providers";
import { activeNetworks } from "@/config/site";
import { isLive } from "@/lib/env";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/categories", label: "Categories" },
  { href: "/collections", label: "Collections" },
  { href: "/community", label: "Community" },
];

export function Header({ siteName, logoUrl }: { siteName: string; logoUrl: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const { setOpen } = useSearch();
  const { entries } = useFavorites();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setMobile(false);
    setMenu(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${scrolled ? "border-b border-line/70 bg-bg/75 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}
    >
      <div className="container-x flex h-16 items-center gap-4 md:h-[72px]">
        <Logo name={siteName} logoUrl={logoUrl} />

        <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`relative rounded-full px-4 py-2 text-[14px] font-medium transition ${isActive(n.href) ? "text-pepe" : "text-ink/75 hover:text-ink"}`}
            >
              {n.label}
              {isActive(n.href) && <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-pepe" />}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <CAButton />
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Search (press /)">
            <Search className="size-[19px]" />
          </button>
          <Link href="/favorites" className="icon-btn relative" aria-label="Favorites">
            <Heart className="size-[19px]" />
            {entries.length > 0 && (
              <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-pepe px-1 text-[10px] font-bold leading-4 text-bg">{entries.length}</span>
            )}
          </Link>

          {isLive && (
            <div className="relative hidden sm:block">
              {user ? (
                <button className="icon-btn" onClick={() => setMenu((v) => !v)} aria-label="Account menu" aria-expanded={menu}>
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt="" className="size-7 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-7 place-items-center rounded-full bg-pepe/15 text-[12px] font-bold uppercase text-pepe">{(user.username ?? "?")[0]}</span>
                  )}
                </button>
              ) : (
                <Link href="/login" className="icon-btn" aria-label="Log in">
                  <LogIn className="size-[19px]" />
                </Link>
              )}
              {menu && user && (
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-card py-1.5 shadow-2xl">
                  <div className="px-4 py-2 text-sm text-mute">@{user.username}</div>
                  <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-white/5"><User className="size-4" /> Profile</Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-white/5"><Shield className="size-4" /> Admin</Link>
                  )}
                  <button onClick={signOut} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm hover:bg-white/5"><LogOut className="size-4" /> Log out</button>
                </div>
              )}
            </div>
          )}

          <Link href="/submit" className="btn-primary btn-sm ml-2 hidden sm:inline-flex">
            <Upload className="size-3.5" /> Submit Artwork
          </Link>
          <button className="icon-btn lg:hidden" onClick={() => setMobile(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobile(false)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col gap-6 overflow-y-auto border-l border-line bg-bg2 p-6"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between">
                <Logo name={siteName} logoUrl={logoUrl} />
                <button className="icon-btn" onClick={() => setMobile(false)} aria-label="Close menu"><X className="size-5" /></button>
              </div>
              <nav className="flex flex-col">
                {[...NAV, { href: "/favorites", label: "Favorites" }].map((n) => (
                  <Link key={n.href} href={n.href} className={`h-display border-b border-line py-4 text-3xl ${isActive(n.href) ? "text-pepe" : ""}`}>
                    {n.label}
                  </Link>
                ))}
              </nav>
              <Link href="/submit" className="btn-primary"><Upload className="size-4" /> Submit Artwork</Link>
              {isLive &&
                (user ? (
                  <div className="flex gap-2">
                    <Link href="/profile" className="btn-ghost flex-1">Profile</Link>
                    {user.role === "admin" && <Link href="/admin" className="btn-ghost flex-1">Admin</Link>}
                    <button onClick={signOut} className="btn-ghost flex-1">Log out</button>
                  </div>
                ) : (
                  <Link href="/login" className="btn-ghost">Log in</Link>
                ))}
              <div className="mt-auto space-y-2">
                {activeNetworks().map((n) => <CARow key={n.key} net={n} compact />)}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
