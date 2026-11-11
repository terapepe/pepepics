import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isLive } from "@/lib/env";

/** Supabase client bound to the current request's auth cookies (RLS applies). Null in demo mode. */
export async function supabaseServer() {
  if (!isLive) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — session refresh is handled in proxy.ts */
        }
      },
    },
  });
}

/** Cookie-less client for public, cacheable reads (anon role). */
export function supabasePublic() {
  if (!isLive) return null;
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
