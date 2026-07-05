-- Enforce per-user favorite slot cap at the database level.

-- The Free tier limit is 20. This function can be extended later for tier-based limits.
create or replace function public.get_favorite_slot_limit()
returns integer
language sql
immutable
as $$
  select 20;
$$;

-- Prevent inserts that would exceed the per-user favorite slot limit.
create or replace function public.check_favorite_slot_limit()
returns trigger
language plpgsql
as $$
begin
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
