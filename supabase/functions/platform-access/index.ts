import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { sendTelegramAlert } from '../_shared/telegram.ts';

const PERMANENT_BAN_DURATION = '876000h';

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

export async function handleRequest(req) {
  const corsHeaders = {
    ...buildCorsHeaders(req),
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('platform-access: profile lookup failed', profileError);
      return new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (profile?.is_banned) {
      const { error: banError } = await supabase.auth.admin.updateUserById(
        user.id,
        { ban_duration: PERMANENT_BAN_DURATION }
      );

      if (banError) {
        console.error('platform-access: auth ban sync failed', banError);
      }

      await sendTelegramAlert(
        `🚫 BANNED USER BLOCKED\n\nUser: ${user.email ?? user.id}\nAction: platform access denied + auth ban synced`
      );

      return new Response(
        JSON.stringify({ allowed: false, reason: 'account_banned' }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    return new Response(JSON.stringify({ allowed: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('platform-access: unexpected error', error);
    return new Response(JSON.stringify({ allowed: true }), {
      status: 200,
      headers: corsHeaders,
    });
  }
}

Deno.serve(handleRequest);
