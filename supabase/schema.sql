create extension if not exists pgcrypto;

create type public.document_permission as enum ('viewer', 'editor');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null unique
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_shares (
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission public.document_permission not null,
  created_at timestamptz not null default now(),
  primary key (document_id, user_id)
);

create index documents_owner_updated_idx on public.documents(owner_id, updated_at desc);
create index document_shares_user_idx on public.document_shares(user_id);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger documents_set_updated_at before update on public.documents for each row execute procedure public.set_updated_at();

insert into public.profiles (id, name, email) values
  ('11111111-1111-1111-1111-111111111111', 'Alex Morgan', 'alex@docshare.demo'),
  ('22222222-2222-2222-2222-222222222222', 'Sam Lee', 'sam@docshare.demo')
on conflict (id) do update set name = excluded.name, email = excluded.email;
