-- PEPE.PICS — initial schema
-- Tables: users, categories, artworks, collections, collection_artworks, favorites, submissions, site_settings
-- Row Level Security on every table. Admin checks via public.is_admin().

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- users (profiles)
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  email text,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user', 'admin')),
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,24}$')
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin' and not suspended);
$$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and not suspended);
$$;

-- create a profile row for every new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g'));
  candidate text;
begin
  if length(base) < 3 then base := 'pepe' || base; end if;
  base := left(base, 18);
  candidate := base;
  while exists (select 1 from public.users where username = candidate) loop
    candidate := base || floor(random() * 100000)::text;
  end loop;
  insert into public.users (id, username, email, avatar_url)
  values (new.id, candidate, new.email, new.raw_user_meta_data ->> 'avatar_url');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- users cannot promote themselves or unsuspend themselves
create or replace function public.protect_user_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- only restrict API requests (PostgREST connects as 'authenticator'); SQL editor / seeds are trusted
  if session_user = 'authenticator' and not public.is_admin() then
    new.role := old.role;
    new.suspended := old.suspended;
    new.email := old.email;
  end if;
  if new.id = auth.uid() and old.role = 'admin' and new.role <> 'admin' then
    raise exception 'Admins cannot remove their own admin role';
  end if;
  return new;
end $$;
create trigger users_protect before update on public.users
  for each row execute function public.protect_user_columns();

-- ---------------------------------------------------------------- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  cover_image text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- artworks
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  slug text unique not null,
  description text,
  image_url text not null,
  thumbnail_url text,
  width int,
  height int,
  category_id uuid references public.categories (id) on delete set null,
  creator_id uuid references public.users (id) on delete set null,
  creator_name text,
  creation_year int check (creation_year between 2000 and 2100),
  source_url text,
  license_type text,
  artwork_type text,
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  featured boolean not null default false,
  is_sample boolean not null default false,
  allow_download boolean not null default false,
  views int not null default 0,
  favorites_count int not null default 0,
  image_hash text,
  created_at timestamptz not null default now()
);
create index artworks_status_created_idx on public.artworks (status, created_at desc);
create index artworks_category_idx on public.artworks (category_id);
create index artworks_creator_idx on public.artworks (creator_id);
create index artworks_featured_idx on public.artworks (featured) where featured;
create index artworks_popular_idx on public.artworks (favorites_count desc, views desc);
create index artworks_tags_idx on public.artworks using gin (tags);
create index artworks_hash_idx on public.artworks (image_hash);
create index artworks_search_idx on public.artworks using gin ((title || ' ' || coalesce(creator_name, '') || ' ' || coalesce(description, '')) gin_trgm_ops);

-- non-admins can never change moderation / counter columns
create or replace function public.protect_artwork_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- only restrict API requests (PostgREST connects as 'authenticator'); SQL editor / seeds are trusted
  if session_user = 'authenticator' and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.featured := false;
      new.is_sample := false;
      new.views := 0;
      new.favorites_count := 0;
      new.creator_id := auth.uid();
    else
      new.status := old.status;
      new.featured := old.featured;
      new.is_sample := old.is_sample;
      new.views := old.views;
      new.favorites_count := old.favorites_count;
      new.creator_id := old.creator_id;
      new.image_url := old.image_url;
      new.thumbnail_url := old.thumbnail_url;
    end if;
  end if;
  return new;
end $$;
create trigger artworks_protect before insert or update on public.artworks
  for each row execute function public.protect_artwork_columns();

-- ---------------------------------------------------------------- collections
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_image text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.collection_artworks (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  unique (collection_id, artwork_id)
);
create index collection_artworks_artwork_idx on public.collection_artworks (artwork_id);

-- ---------------------------------------------------------------- favorites
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, artwork_id)
);
create index favorites_artwork_idx on public.favorites (artwork_id);

create or replace function public.sync_favorites_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.artworks set favorites_count = favorites_count + 1 where id = new.artwork_id;
  elsif tg_op = 'DELETE' then
    update public.artworks set favorites_count = greatest(favorites_count - 1, 0) where id = old.artwork_id;
  end if;
  return null;
end $$;
create trigger favorites_count_trg after insert or delete on public.favorites
  for each row execute function public.sync_favorites_count();

-- ---------------------------------------------------------------- submissions
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_note text,
  created_at timestamptz not null default now()
);
create index submissions_status_idx on public.submissions (status, created_at desc);
create index submissions_user_idx on public.submissions (user_id);

create or replace function public.protect_submission_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- only restrict API requests (PostgREST connects as 'authenticator'); SQL editor / seeds are trusted
  if session_user = 'authenticator' and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.moderation_note := null;
      new.user_id := auth.uid();
    else
      new.status := old.status;
      new.moderation_note := old.moderation_note;
    end if;
  end if;
  return new;
end $$;
create trigger submissions_protect before insert or update on public.submissions
  for each row execute function public.protect_submission_columns();

-- ---------------------------------------------------------------- site settings (admin-editable)
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- views counter (callable by anyone, approved only)
create or replace function public.increment_artwork_view(p_slug text)
returns void language sql security definer set search_path = public as $$
  update public.artworks set views = views + 1 where slug = p_slug and status = 'approved';
$$;
grant execute on function public.increment_artwork_view(text) to anon, authenticated;

-- ---------------------------------------------------------------- creators leaderboard (public, computed from real data)
create or replace view public.creator_leaderboard with (security_invoker = true) as
  select u.id, u.username, u.avatar_url,
         count(a.id)::int as artworks,
         coalesce(sum(a.favorites_count), 0)::int as favorites
  from public.users u
  join public.artworks a on a.creator_id = u.id and a.status = 'approved'
  where not u.suspended
  group by u.id;

-- ================================================================ RLS
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.artworks enable row level security;
alter table public.collections enable row level security;
alter table public.collection_artworks enable row level security;
alter table public.favorites enable row level security;
alter table public.submissions enable row level security;
alter table public.site_settings enable row level security;

-- users: public profiles readable; email column hidden through column grants below
create policy "profiles are public" on public.users for select using (true);
create policy "update own profile" on public.users for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admins update users" on public.users for update using (public.is_admin());
revoke select on public.users from anon, authenticated;
grant select (id, username, avatar_url, bio, role, suspended, created_at) on public.users to anon, authenticated;

-- categories / collections: public read, admin write
create policy "categories readable" on public.categories for select using (true);
create policy "categories admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "collections readable" on public.collections for select using (true);
create policy "collections admin" on public.collections for all using (public.is_admin()) with check (public.is_admin());
create policy "collection items readable" on public.collection_artworks for select using (true);
create policy "collection items admin" on public.collection_artworks for all using (public.is_admin()) with check (public.is_admin());

-- artworks
create policy "approved artworks are public" on public.artworks for select
  using (status = 'approved' or creator_id = auth.uid() or public.is_admin());
create policy "active users submit artwork" on public.artworks for insert to authenticated
  with check (public.is_active_user() and creator_id = auth.uid() and status = 'pending');
create policy "owners edit pending artwork" on public.artworks for update to authenticated
  using (creator_id = auth.uid() and status = 'pending') with check (creator_id = auth.uid());
create policy "admins manage artworks" on public.artworks for all using (public.is_admin()) with check (public.is_admin());

-- favorites: own rows only
create policy "read own favorites" on public.favorites for select using (user_id = auth.uid() or public.is_admin());
create policy "add own favorites" on public.favorites for insert to authenticated with check (user_id = auth.uid());
create policy "remove own favorites" on public.favorites for delete to authenticated using (user_id = auth.uid());

-- submissions
create policy "read own submissions" on public.submissions for select using (user_id = auth.uid() or public.is_admin());
create policy "create own submissions" on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_user());
create policy "admins manage submissions" on public.submissions for all using (public.is_admin()) with check (public.is_admin());

-- settings
create policy "settings readable" on public.site_settings for select using (true);
create policy "settings admin" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ================================================================ Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artworks', 'artworks', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "artwork images are public" on storage.objects for select using (bucket_id = 'artworks');
create policy "users upload into own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'artworks' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active_user());
create policy "admins manage artwork images" on storage.objects for all
  using (bucket_id = 'artworks' and public.is_admin()) with check (bucket_id = 'artworks' and public.is_admin());
