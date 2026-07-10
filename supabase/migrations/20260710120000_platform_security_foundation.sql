-- Platform security foundation: account bans, signup defenses, activity tracking.

-- ---------------------------------------------------------------------------
-- profiles extensions
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists is_banned boolean not null default false,
  add column if not exists signup_ip inet,
  add column if not exists last_active_at timestamptz,
  add column if not exists banned_at timestamptz;

comment on column public.profiles.is_banned is
  'Admin manual account suspension only; never auto-set from IP rules.';
comment on column public.profiles.signup_ip is
  'IP observed at first signup; anonymized after 90 days by pg_cron.';
comment on column public.profiles.last_active_at is
  'Updated when signed-in user starts a visualization.';
comment on column public.profiles.banned_at is
  'Timestamp when is_banned was set by an administrator.';

-- ---------------------------------------------------------------------------
-- security tables (service-role / edge functions only)
-- ---------------------------------------------------------------------------

create table public.banned_ips (
  ip inet primary key,
  reason text not null default 'automated',
  banned_by text not null default 'system',
  banned_at timestamptz not null default now(),
  expires_at timestamptz
);

comment on table public.banned_ips is
  'Temporary IP blocks for new signups only (enforced in before-signup hook).';

create table public.trusted_ips (
  ip inet primary key,
  reason text,
  added_by text not null default 'admin',
  created_at timestamptz not null default now()
);

comment on table public.trusted_ips is
  'Allowlist for shared NAT / bootcamp IPs; bypasses signup IP defenses.';

create table public.signup_events (
  id bigint generated always as identity primary key,
  ip inet,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index signup_events_ip_created_at_idx
  on public.signup_events (ip, created_at desc);

create index signup_events_created_at_idx
  on public.signup_events (created_at);

comment on table public.signup_events is
  'Signup audit trail for rate limits and progressive IP auto-ban; 7-day retention.';

create table public.signup_pending (
  email text primary key,
  ip inet,
  created_at timestamptz not null default now()
);

comment on table public.signup_pending is
  'Bridge before-signup hook to post-signup webhook; stale rows cleaned after 1 hour.';

alter table public.banned_ips enable row level security;
alter table public.trusted_ips enable row level security;
alter table public.signup_events enable row level security;
alter table public.signup_pending enable row level security;

revoke all on public.banned_ips from anon, authenticated;
revoke all on public.trusted_ips from anon, authenticated;
revoke all on public.signup_events from anon, authenticated;
revoke all on public.signup_pending from anon, authenticated;

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_active_profile()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not coalesce(
    (select p.is_banned from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

comment on function public.is_active_profile() is
  'True when the signed-in user is not manually banned; used in RLS write policies.';

create or replace function public.touch_last_active()
returns void
language sql
security invoker
set search_path = public
as $$
  update public.profiles
  set last_active_at = now()
  where id = auth.uid();
$$;

comment on function public.touch_last_active() is
  'Client-callable activity heartbeat for signed-in users.';

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_preference, last_active_at) on public.profiles to authenticated;
grant execute on function public.touch_last_active() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS updates (banned users must still SELECT their profile for is_banned)
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id and public.is_active_profile())
  with check (auth.uid() = id and public.is_active_profile());

drop policy if exists "favorite_algorithms_select_own" on public.favorite_algorithms;
drop policy if exists "favorite_algorithms_insert_own" on public.favorite_algorithms;
drop policy if exists "favorite_algorithms_delete_own" on public.favorite_algorithms;

create policy "favorite_algorithms_select_own"
  on public.favorite_algorithms
  for select
  to authenticated
  using (auth.uid() = user_id and public.is_active_profile());

create policy "favorite_algorithms_insert_own"
  on public.favorite_algorithms
  for insert
  to authenticated
  with check (auth.uid() = user_id and public.is_active_profile());

create policy "favorite_algorithms_delete_own"
  on public.favorite_algorithms
  for delete
  to authenticated
  using (auth.uid() = user_id and public.is_active_profile());

drop policy if exists "algorithm_notes_select_own" on public.algorithm_notes;
drop policy if exists "algorithm_notes_insert_own" on public.algorithm_notes;
drop policy if exists "algorithm_notes_update_own" on public.algorithm_notes;

create policy "algorithm_notes_select_own"
  on public.algorithm_notes
  for select
  to authenticated
  using (auth.uid() = user_id and public.is_active_profile());

create policy "algorithm_notes_insert_own"
  on public.algorithm_notes
  for insert
  to authenticated
  with check (auth.uid() = user_id and public.is_active_profile());

create policy "algorithm_notes_update_own"
  on public.algorithm_notes
  for update
  to authenticated
  using (auth.uid() = user_id and public.is_active_profile())
  with check (auth.uid() = user_id and public.is_active_profile());

-- ---------------------------------------------------------------------------
-- pg_cron retention jobs
-- ---------------------------------------------------------------------------

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'cleanup_signup_events',
  '15 * * * *',
  $$delete from public.signup_events where created_at < now() - interval '7 days'$$
);

select cron.schedule(
  'cleanup_signup_pending',
  '*/15 * * * *',
  $$delete from public.signup_pending where created_at < now() - interval '1 hour'$$
);

select cron.schedule(
  'anonymize_signup_ip',
  '0 3 * * *',
  $$update public.profiles
    set signup_ip = null
    where signup_ip is not null
      and created_at < now() - interval '90 days'$$
);
