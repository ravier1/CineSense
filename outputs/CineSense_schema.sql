-- CineSense initial PostgreSQL schema for Supabase.
-- This is a design migration, not yet connected to a live project.

create extension if not exists pgcrypto;

create type public.visibility_level as enum ('private', 'friends', 'public');
create type public.media_kind as enum ('movie', 'show', 'season', 'episode');
create type public.playback_source as enum ('manual', 'trakt', 'jellyfin', 'stremio');
create type public.playback_state as enum ('playing', 'paused', 'stopped', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-zA-Z0-9_]{3,30}$'),
  display_name text not null,
  bio text,
  avatar_url text,
  default_visibility public.visibility_level not null default 'friends',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_username_lower_idx on public.profiles (lower(username));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_username text := lower(coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(replace(new.id::text, '-', ''), 12)));
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, new_username, coalesce(new.raw_user_meta_data ->> 'display_name', new_username))
  on conflict (id) do update
    set username = excluded.username,
        display_name = excluded.display_name,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind public.media_kind not null,
  title text not null,
  year integer,
  runtime_seconds integer check (runtime_seconds is null or runtime_seconds > 0),
  tmdb_id integer,
  imdb_id text,
  tvdb_id integer,
  poster_path text,
  backdrop_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, tmdb_id),
  unique (kind, imdb_id)
);

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  watched_at timestamptz not null,
  rating numeric(2,1) check (rating is null or rating between 0.5 and 5.0),
  review text,
  contains_spoilers boolean not null default false,
  venue text,
  viewing_format text,
  screen_name text,
  screen_aspect_ratio text,
  sound_format text,
  source public.playback_source not null default 'manual',
  visibility public.visibility_level not null default 'friends',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.diary_plays (
  id uuid primary key default gen_random_uuid(),
  diary_entry_id uuid not null references public.diary_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  watched_at timestamptz not null,
  source public.playback_source not null,
  external_play_id text,
  created_at timestamptz not null default now(),
  unique (user_id, source, external_play_id)
);

create table public.watch_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  planned_start timestamptz,
  venue text,
  viewing_format text,
  screen_name text,
  screen_aspect_ratio text,
  sound_format text,
  runtime_seconds integer check (runtime_seconds is null or runtime_seconds > 0),
  visibility public.visibility_level not null default 'private',
  notify_friends boolean not null default false,
  status text not null default 'planned' check (status in ('planned', 'started', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.playback_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  source public.playback_source not null,
  external_item_id text,
  state public.playback_state not null default 'playing',
  position_seconds integer not null default 0 check (position_seconds >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  device_name text,
  visibility public.visibility_level not null default 'private',
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz,
  unique (user_id, source, external_item_id)
);

create table public.playback_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.playback_sessions(id) on delete cascade,
  event_type text not null check (event_type in ('start', 'progress', 'pause', 'resume', 'stop', 'complete')),
  position_seconds integer not null default 0 check (position_seconds >= 0),
  duration_seconds integer,
  occurred_at timestamptz not null default now(),
  idempotency_key text not null unique
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index diary_entries_user_date_idx on public.diary_entries(user_id, watched_at desc);
create index playback_sessions_active_idx on public.playback_sessions(user_id, state, last_seen_at desc);
create index notifications_recipient_idx on public.notifications(recipient_id, created_at desc);
