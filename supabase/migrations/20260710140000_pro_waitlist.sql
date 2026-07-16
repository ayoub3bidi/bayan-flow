-- Pro demand validation: email waitlist (pre-launch signal, not billing).

create table public.waitlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  source text not null default 'direct'
    check (source in ('landing', 'app', 'direct')),
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique unique (email),
  constraint waitlist_email_format check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

comment on table public.waitlist is
  'Pro plan pre-launch waitlist; insert-only from client. Attribution via source.';

comment on column public.waitlist.source is
  'Signup touchpoint: landing banner, app banner, or direct /pro visit.';

create index waitlist_created_at_idx on public.waitlist (created_at desc);
create index waitlist_source_idx on public.waitlist (source);

alter table public.waitlist enable row level security;

create policy "waitlist_insert_anon"
  on public.waitlist
  for insert
  to anon
  with check (user_id is null);

create policy "waitlist_insert_authenticated"
  on public.waitlist
  for insert
  to authenticated
  with check (user_id is null or user_id = auth.uid());

grant insert on public.waitlist to anon, authenticated;

-- Public signup count only (no PII) for success-state position display.
create or replace function public.waitlist_public_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::bigint from public.waitlist;
$$;

revoke all on function public.waitlist_public_count() from public;
grant execute on function public.waitlist_public_count() to anon, authenticated;
