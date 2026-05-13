create extension if not exists "pgcrypto";

create or replace function public.is_moonchat_member()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'user1@example.com',
    'user2@example.com'
  );
$$;

create table if not exists public.users (
  id uuid primary key,
  name text not null,
  avatar text,
  email text unique not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  image_url text,
  media_type text check (media_type in ('image', 'video')),
  media_name text,
  media_size bigint,
  reply_to_message_id uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  read boolean not null default false,
  kind text not null default 'text' check (kind in ('text', 'heart', 'saudade'))
);

alter table public.messages add column if not exists media_type text;
alter table public.messages add column if not exists media_name text;
alter table public.messages add column if not exists media_size bigint;
alter table public.messages add column if not exists reply_to_message_id uuid references public.messages(id) on delete set null;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id, message_id)
);

alter table public.users enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.favorites enable row level security;

create or replace function public.is_allowed_partner()
returns boolean
language sql
stable
as $$
  select public.is_moonchat_member();
$$;

drop policy if exists "users_select_own_pair" on public.users;
create policy "users_select_own_pair"
on public.users for select
using (public.is_allowed_partner());

drop policy if exists "users_upsert_self" on public.users;
create policy "users_upsert_self"
on public.users for insert
with check (auth.uid() = id and public.is_moonchat_member());

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
on public.users for update
using (auth.uid() = id and public.is_moonchat_member());

drop policy if exists "messages_read_pair" on public.messages;
create policy "messages_read_pair"
on public.messages for select
using (public.is_allowed_partner());

drop policy if exists "messages_insert_self" on public.messages;
create policy "messages_insert_self"
on public.messages for insert
with check (auth.uid() = sender_id and public.is_moonchat_member());

drop policy if exists "messages_update_pair" on public.messages;
drop function if exists public.moonchat_mark_messages_as_read();

create or replace function public.moonchat_mark_messages_as_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_moonchat_member() then
    raise exception 'not allowed';
  end if;

  update public.messages
    set read = true
    where sender_id <> auth.uid() and read = false;
end;
$$;

revoke all on function public.moonchat_mark_messages_as_read() from public;
grant execute on function public.moonchat_mark_messages_as_read() to authenticated;

drop policy if exists "memories_access_pair" on public.memories;
create policy "memories_access_pair"
on public.memories for select
using (public.is_allowed_partner());

drop policy if exists "memories_insert_pair" on public.memories;
create policy "memories_insert_pair"
on public.memories for insert
with check (public.is_allowed_partner());

drop policy if exists "favorites_read_pair" on public.favorites;
create policy "favorites_read_pair"
on public.favorites for select
using (public.is_allowed_partner());

drop policy if exists "favorites_insert_self" on public.favorites;
create policy "favorites_insert_self"
on public.favorites for insert
with check (auth.uid() = user_id and public.is_moonchat_member());

drop policy if exists "favorites_delete_self" on public.favorites;
create policy "favorites_delete_self"
on public.favorites for delete
using (auth.uid() = user_id and public.is_moonchat_member());

insert into storage.buckets (id, name, public)
values ('moonchat-media', 'moonchat-media', false)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  execute 'drop policy if exists "public_upload_pair" on storage.objects';
  execute 'drop policy if exists "private_upload_pair" on storage.objects';
  execute 'drop policy if exists "public_read_media" on storage.objects';
  execute 'drop policy if exists "private_read_media" on storage.objects';
  execute 'drop policy if exists "public_delete_media" on storage.objects';
  execute 'drop policy if exists "private_delete_media" on storage.objects';
end;
$$;

create policy "private_upload_pair"
on storage.objects for insert
to authenticated
with check (bucket_id = 'moonchat-media' and public.is_moonchat_member());

create policy "private_read_media"
on storage.objects for select
using (bucket_id = 'moonchat-media' and public.is_moonchat_member());

create policy "private_delete_media"
on storage.objects for delete
using (bucket_id = 'moonchat-media' and public.is_moonchat_member());

alter publication supabase_realtime set table public.messages, public.favorites;
