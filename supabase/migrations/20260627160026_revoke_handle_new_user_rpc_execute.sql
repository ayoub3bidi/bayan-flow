-- Trigger-only: block direct RPC calls to handle_new_user
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
