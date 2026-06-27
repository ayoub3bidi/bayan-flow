-- Bayan Flow v0.5.0 accounts: profiles + auto-create on signup + RLS
-- Favorites table deferred to a later release.

create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  provider text,
  created_at timestamptz not null default now(),
  primary key (id)
);

comment on table public.profiles is 'Public profile row per auth.users; plan is service-role only.';
comment on column public.profiles.plan is 'Entitlement tier; updated only via service role (webhooks).';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', new.raw_user_meta_data->>'provider')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
