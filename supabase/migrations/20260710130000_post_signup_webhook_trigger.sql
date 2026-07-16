-- Post-signup webhook via pg_net (async HTTP to post-signup edge function).
-- Vault secret `post_signup_webhook_secret` must match POST_SIGNUP_WEBHOOK_SECRET
-- (set once via vault.create_secret after deploy; see DEVELOPMENT.md).

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_post_signup_webhook()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  webhook_secret text;
  headers jsonb;
  payload jsonb;
begin
  select ds.decrypted_secret into webhook_secret
  from vault.decrypted_secrets ds
  where ds.name = 'post_signup_webhook_secret'
  limit 1;

  if webhook_secret is null then
    raise warning 'post_signup_webhook_secret missing from vault';
    return NEW;
  end if;

  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW),
    'old_record', null
  );

  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-webhook-secret', webhook_secret
  );

  perform net.http_post(
    url := 'https://qketsapzqpzmccljfjcm.supabase.co/functions/v1/post-signup',
    headers := headers,
    body := payload
  );

  return NEW;
end;
$$;

drop trigger if exists post_signup_profiles_insert on public.profiles;

create trigger post_signup_profiles_insert
  after insert on public.profiles
  for each row
  execute function public.notify_post_signup_webhook();
