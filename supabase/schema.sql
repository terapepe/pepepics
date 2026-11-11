-- PEPE.PICS — simple schema (run once in Supabase → SQL Editor, then run seed.sql)
--
-- One table `pics` + one public Storage bucket `pics`.
-- Visitors can upload without an account; uploads are saved as `pending`
-- and only appear on the site after you set status = 'approved'
-- (Supabase → Table Editor → pics).

create table if not exists public.pics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null check (char_length(title) between 2 and 80),
  category text not null check (category in ('classic','rare','anime','cyber','space','pixel','art','crypto')),
  image_url text not null,
  width int,
  height int,
  tags text[] not null default '{}',
  creator text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  featured boolean not null default false,
  is_sample boolean not null default false,
  likes int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists pics_feed_idx on public.pics (status, created_at desc);
create index if not exists pics_likes_idx on public.pics (likes desc);

alter table public.pics enable row level security;

-- everyone sees approved pictures
drop policy if exists "approved pics are public" on public.pics;
create policy "approved pics are public" on public.pics for select using (status = 'approved');

-- anyone may submit, but only as a pending, non-featured upload pointing at our own bucket
drop policy if exists "anyone can submit" on public.pics;
create policy "anyone can submit" on public.pics for insert to anon, authenticated
  with check (
    status = 'pending' and featured = false and is_sample = false and likes = 0
    and image_url like '%/storage/v1/object/public/pics/uploads/%'
  );

-- likes: +1 on an approved picture (no direct UPDATE rights for visitors)
create or replace function public.like_pic(p_id uuid)
returns int language sql security definer set search_path = public as $$
  update public.pics set likes = likes + 1 where id = p_id and status = 'approved' returning likes;
$$;
revoke execute on function public.like_pic(uuid) from public;
grant execute on function public.like_pic(uuid) to anon, authenticated;

-- Storage: public bucket, images only, max 10 MB, uploads only into uploads/
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pics', 'pics', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "pics bucket upload" on storage.objects;
create policy "pics bucket upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'pics' and (storage.foldername(name))[1] = 'uploads');
