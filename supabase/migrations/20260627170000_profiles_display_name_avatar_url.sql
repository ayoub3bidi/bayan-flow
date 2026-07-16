alter table public.profiles
  add column if not exists display_name text,
  add column if not exists avatar_url text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, provider, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', new.raw_user_meta_data->>'provider'),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

insert into public.profiles (id, email, provider, display_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_app_meta_data->>'provider', u.raw_user_meta_data->>'provider'),
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name'
  ),
  coalesce(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

update public.profiles p
set
  display_name = coalesce(
    p.display_name,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name'
  ),
  avatar_url = coalesce(
    p.avatar_url,
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )
from auth.users u
where p.id = u.id;
