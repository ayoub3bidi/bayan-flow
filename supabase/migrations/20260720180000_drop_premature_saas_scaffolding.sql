-- Drop premature SaaS billing/referral/session scaffolding applied ahead of Pro checkout.
-- Live schema (applied 202607181746*) — empty tables only; waitlist/profiles untouched.

drop function if exists public.upsert_user_session(uuid, text, integer, integer, text[], text[]);
drop function if exists public.generate_referral_code(uuid);
drop function if exists public.get_referral_stats(uuid);
drop function if exists public.track_referral_signup(uuid, text, text);
drop function if exists public.is_pro_user(uuid);

drop table if exists public.subscriptions cascade;
drop table if exists public.usage_events cascade;
drop table if exists public.referrals cascade;
drop table if exists public.user_sessions cascade;
