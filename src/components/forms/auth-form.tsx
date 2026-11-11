"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function AuthForm({ initialMode, next, error }: { initialMode: "login" | "signup"; next: string; error?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(error ? { kind: "error", text: "Sign-in failed. Please try again." } : null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sb = supabaseBrowser();
    if (!sb) return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim();
    const password = String(fd.get("password"));
    if (password.length < 8) return setMsg({ kind: "error", text: "Password must be at least 8 characters." });
    setBusy(true);
    setMsg(null);
    if (mode === "login") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg({ kind: "error", text: error.message });
      router.replace(next);
      router.refresh();
    } else {
      const username = String(fd.get("username") ?? "").trim().toLowerCase();
      if (!/^[a-z0-9_]{3,24}$/.test(username)) {
        setBusy(false);
        return setMsg({ kind: "error", text: "Username: 3–24 characters, letters, numbers or _." });
      }
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { username }, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      setBusy(false);
      if (error) return setMsg({ kind: "error", text: error.message });
      if (data.session) {
        router.replace(next);
        router.refresh();
      } else setMsg({ kind: "ok", text: "Check your inbox to confirm your email, then log in." });
    }
  };

  const google = async () => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) setMsg({ kind: "error", text: error.message.includes("provider") ? "Google login is not enabled for this site yet." : error.message });
  };

  return (
    <div className="card p-6">
      <div className="mb-6 grid grid-cols-2 rounded-full border border-line p-1">
        {(["login", "signup"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setMsg(null); }} className={`h-9 rounded-full text-sm font-medium transition ${mode === m ? "bg-pepe text-bg" : "text-mute hover:text-ink"}`}>
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>
      <button onClick={google} className="btn-ghost w-full normal-case tracking-normal">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" /></svg>
        Continue with Google
      </button>
      <div className="my-5 flex items-center gap-3 text-[12px] text-mute"><span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" /></div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && <input name="username" required placeholder="Username" autoComplete="username" className="input" />}
        <input name="email" type="email" required placeholder="Email" autoComplete="email" className="input" />
        <input name="password" type="password" required minLength={8} placeholder="Password (min. 8 characters)" autoComplete={mode === "login" ? "current-password" : "new-password"} className="input" />
        {msg && <p className={`text-sm ${msg.kind === "error" ? "text-red-400" : "text-pepe"}`} role="alert">{msg.text}</p>}
        <button disabled={busy} className="btn-primary h-12 w-full">{busy && <Loader2 className="size-4 animate-spin" />}{mode === "login" ? "Log in" : "Create account"}</button>
      </form>
    </div>
  );
}
