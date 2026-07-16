-- Add idempotency guard for waitlist welcome emails.

alter table public.waitlist add column if not exists welcomed_at timestamptz;
