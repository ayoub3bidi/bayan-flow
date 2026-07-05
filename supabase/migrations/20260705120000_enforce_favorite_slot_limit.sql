-- Enforce per-user favorite slot cap at the database level.
-- An insert trigger uses a per-user advisory lock so concurrent
-- insertions cannot both pass the count check and exceed the limit.

create or replace function public.get_favorite_slot_limit()
returns integer
language sql
immutable
set search_path = ''
as $$
  select 20;
$$;

create or replace function public.check_favorite_slot_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('favorite_slot_' || new.user_id::text));
  if (select count(*) from public.favorite_algorithms where user_id = new.user_id) >= public.get_favorite_slot_limit() then
    raise exception 'Favorite slot limit reached'
      using hint = 'Remove an existing favorite before adding another.';
  end if;
  return new;
end;
$$;

create trigger enforce_favorite_slot_limit
  before insert on public.favorite_algorithms
  for each row
  execute function public.check_favorite_slot_limit();
