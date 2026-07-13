-- Remove unused A/B pitch column; single discount pitch only.

alter table public.waitlist drop column if exists pitch_variant;
