export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** true when Supabase credentials are configured. Otherwise the site runs in DEMO MODE. */
export const isLive = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
