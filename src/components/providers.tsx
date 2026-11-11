"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheck, CircleX, Info } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { isLive } from "@/lib/env";

/* ================================================================ Toasts */
type Toast = { id: number; kind: "success" | "error" | "info"; text: string };
const ToastCtx = createContext<(text: string, kind?: Toast["kind"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-line bg-card/95 px-4 py-2.5 text-sm shadow-2xl backdrop-blur"
            >
              {t.kind === "success" ? <CircleCheck className="size-4 text-pepe" /> : t.kind === "error" ? <CircleX className="size-4 text-red-400" /> : <Info className="size-4 text-mute" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ================================================================ Auth */
export type SessionUser = { id: string; email: string | null; username: string | null; avatar_url: string | null; role: string | null };
const AuthCtx = createContext<{ user: SessionUser | null; ready: boolean; signOut: () => Promise<void> }>({ user: null, ready: false, signOut: async () => {} });
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: SessionUser | null }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [ready, setReady] = useState(!isLive);

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const load = async (id: string | undefined, email: string | null) => {
      if (!id) return setUser(null);
      const { data } = await sb.from("users").select("username,avatar_url,role").eq("id", id).maybeSingle();
      setUser({ id, email, username: data?.username ?? null, avatar_url: data?.avatar_url ?? null, role: data?.role ?? null });
    };
    sb.auth.getUser().then(({ data }) => load(data.user?.id, data.user?.email ?? null).finally(() => setReady(true)));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => load(session?.user.id, session?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabaseBrowser()?.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }, []);

  return <AuthCtx.Provider value={{ user, ready, signOut }}>{children}</AuthCtx.Provider>;
}

/* ================================================================ Favorites
 * Guests → localStorage. Logged-in users → database (/api/favorites).
 * Guest favorites are synchronised to the account after login. */
type FavEntry = { id: string; at: string };
const LS_KEY = "pepepics:favorites";
const FavCtx = createContext<{
  entries: FavEntry[];
  has: (id: string) => boolean;
  toggle: (id: string, title?: string) => Promise<void>;
  ready: boolean;
}>({ entries: [], has: () => false, toggle: async () => {}, ready: false });
export const useFavorites = () => useContext(FavCtx);

function readLocal(): FavEntry[] {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((e) => typeof e?.id === "string") : [];
  } catch {
    return [];
  }
}
function writeLocal(v: FavEntry[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
}

function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const toast = useToast();
  const [entries, setEntries] = useState<FavEntry[]>([]);
  const [ready, setReady] = useState(false);
  const synced = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setEntries(readLocal());
      setReady(true);
      return;
    }
    if (synced.current === user.id) return;
    synced.current = user.id;
    (async () => {
      const local = readLocal();
      if (local.length) {
        const r = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: local.map((e) => e.id) }) });
        if (r.ok) {
          writeLocal([]);
          toast(`Synced ${local.length} favorite${local.length > 1 ? "s" : ""} to your account`);
        }
      }
      const res = await fetch("/api/favorites");
      const json = res.ok ? await res.json() : { items: [] };
      setEntries(json.items ?? []);
      setReady(true);
    })();
  }, [user, authReady, toast]);

  const has = useCallback((id: string) => entries.some((e) => e.id === id), [entries]);

  const toggle = useCallback(
    async (id: string, title?: string) => {
      const on = !entries.some((e) => e.id === id);
      const next = on ? [{ id, at: new Date().toISOString() }, ...entries] : entries.filter((e) => e.id !== id);
      setEntries(next);
      if (!user) {
        writeLocal(next);
      } else {
        const r = await fetch("/api/favorites", {
          method: on ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [id] }),
        });
        if (!r.ok) {
          setEntries(entries);
          toast("Could not update favorites", "error");
          return;
        }
      }
      toast(on ? `Added ${title ? `“${title}” ` : ""}to favorites` : "Removed from favorites", on ? "success" : "info");
    },
    [entries, user, toast],
  );

  return <FavCtx.Provider value={{ entries, has, toggle, ready }}>{children}</FavCtx.Provider>;
}

/* ================================================================ Search overlay state */
const SearchCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });
export const useSearch = () => useContext(SearchCtx);

function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <SearchCtx.Provider value={value}>{children}</SearchCtx.Provider>;
}

export function Providers({ children, initialUser }: { children: React.ReactNode; initialUser: SessionUser | null }) {
  return (
    <ToastProvider>
      <AuthProvider initialUser={initialUser}>
        <FavoritesProvider>
          <SearchProvider>{children}</SearchProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
