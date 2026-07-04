-- Personal learning: favorite algorithms + per-algorithm study notes.

create table public.favorite_algorithms (
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  algorithm_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, category, algorithm_key)
);

comment on table public.favorite_algorithms is
  'User-starred algorithms for quick access; composite key matches runtime category + algorithm_key.';

create index favorite_algorithms_user_id_idx on public.favorite_algorithms (user_id);

create table public.algorithm_notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  algorithm_key text not null,
  body_html text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, category, algorithm_key),
  constraint algorithm_notes_body_html_length check (char_length(body_html) <= 50000)
);

comment on table public.algorithm_notes is
  'Per-algorithm study notes (sanitized HTML) keyed by category + algorithm_key.';

create index algorithm_notes_user_id_idx on public.algorithm_notes (user_id);

alter table public.favorite_algorithms enable row level security;
alter table public.algorithm_notes enable row level security;

create policy "favorite_algorithms_select_own"
  on public.favorite_algorithms
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "favorite_algorithms_insert_own"
  on public.favorite_algorithms
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "favorite_algorithms_delete_own"
  on public.favorite_algorithms
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "algorithm_notes_select_own"
  on public.algorithm_notes
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "algorithm_notes_insert_own"
  on public.algorithm_notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "algorithm_notes_update_own"
  on public.algorithm_notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, delete on public.favorite_algorithms to authenticated;
grant select, insert, update on public.algorithm_notes to authenticated;
