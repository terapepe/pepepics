-- Trigger-only functions must not be callable via /rest/v1/rpc
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_user_columns() from public, anon, authenticated;
revoke execute on function public.protect_artwork_columns() from public, anon, authenticated;
revoke execute on function public.protect_submission_columns() from public, anon, authenticated;
revoke execute on function public.sync_favorites_count() from public, anon, authenticated;
-- keep extensions out of the exposed schema
create schema if not exists extensions;
alter extension pg_trgm set schema extensions;
