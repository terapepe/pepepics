"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/providers";
import type { AdminState } from "@/lib/admin-actions";

export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className = "space-y-4",
  resetOnSuccess = false,
}: {
  action: (s: AdminState, fd: FormData) => Promise<AdminState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, run, pending] = useActionState(action, null);
  const toast = useToast();
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      toast(state.message ?? "Saved");
      if (resetOnSuccess) ref.current?.reset();
    } else if (state?.error) toast(state.error, "error");
  }, [state, toast, resetOnSuccess]);
  return (
    <form ref={ref} action={run} className={className}>
      {children}
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button disabled={pending} className="btn-primary btn-sm">{pending && <Loader2 className="size-3.5 animate-spin" />} {submitLabel}</button>
    </form>
  );
}

/** Small form button for one-shot server actions, with optional confirm(). */
export function ActionButton({ action, fields, label, className = "chip h-8 text-[12px]", confirm }: { action: (fd: FormData) => Promise<void>; fields: Record<string, string>; label: React.ReactNode; className?: string; confirm?: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className={className}>{label}</button>
    </form>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block text-mute">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-mute">{hint}</span>}
    </label>
  );
}
