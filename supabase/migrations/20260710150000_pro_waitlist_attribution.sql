-- Add attribution columns and public count RPC to existing waitlist table.

alter table public.waitlist
  add column if not exists source text not null default 'direct'
    check (source in ('landing', 'app', 'direct'));

comment on column public.waitlist.source is
  'Signup touchpoint: landing banner, app banner, or direct /pro visit.';

create index if not exists waitlist_source_idx on public.waitlist (source);

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
