"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions";
import { useToast } from "@/components/providers";

export function ProfileForm({ username, bio, avatar }: { username: string; bio: string; avatar: string | null }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  const toast = useToast();
  useEffect(() => {
    if (state?.ok) toast("Profile updated");
  }, [state, toast]);
  return (
    <form action={action} className="card space-y-4 p-6">
      <h2 className="font-display text-lg font-semibold">Edit profile</h2>
      <div className="flex items-center gap-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <div className="grid size-16 place-items-center rounded-full bg-pepe/15 font-display text-2xl font-bold uppercase text-pepe">{username[0]}</div>
        )}
        <label className="chip cursor-pointer">
          Change avatar
          <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" />
        </label>
      </div>
      <label className="block">
        <span className="label mb-2 block text-mute">Username</span>
        <input name="username" defaultValue={username} className="input" />
      </label>
      <label className="block">
        <span className="label mb-2 block text-mute">Bio</span>
        <textarea name="bio" defaultValue={bio} maxLength={280} className="textarea" />
      </label>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="size-4 animate-spin" />} Save</button>
    </form>
  );
}
