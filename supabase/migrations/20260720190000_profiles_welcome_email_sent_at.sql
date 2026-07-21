-- One-time Free-tier welcome email tracking (service role only).
alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

comment on column public.profiles.welcome_email_sent_at is
  'Claimed atomically by sync-contacts before the one-time account welcome email; cleared on send failure for retry.';
