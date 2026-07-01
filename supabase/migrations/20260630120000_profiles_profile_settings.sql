-- Profile settings: avatar preference + locked-down client UPDATE grants.

alter table public.profiles
  add column if not exists avatar_preference text not null default 'google'
  check (avatar_preference in ('google', 'generated'));

comment on column public.profiles.avatar_preference is
  'User choice: google photo or client-generated DiceBear avatar. avatar_url is not client-writable.';

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_preference) on public.profiles to authenticated;

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
