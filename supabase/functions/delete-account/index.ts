/**
 * Self-service account deletion.
 * Verifies the caller JWT and deletes auth.users (CASCADE removes profile, favorites, notes).
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildCorsHeaders } from '../_shared/cors.ts';

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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabaseAdmin = getServiceClient();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { error: clearIpError } = await supabaseAdmin
      .from('profiles')
      .update({ signup_ip: null })
      .eq('id', user.id);

    if (clearIpError) {
      console.error('delete-account: clear signup_ip failed', clearIpError);
    }

    const { error: eventsError } = await supabaseAdmin
      .from('signup_events')
      .delete()
      .eq('user_id', user.id);

    if (eventsError) {
      console.error('delete-account: clear signup_events failed', eventsError);
    }

    if (user.email) {
      const { error: pendingError } = await supabaseAdmin
        .from('signup_pending')
        .delete()
        .eq('email', user.email);

      if (pendingError) {
        console.error(
          'delete-account: clear signup_pending failed',
          pendingError
        );
      }
    }

    // Explicit hard delete (false) so Google email can be reused immediately.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id,
      false
    );

    if (deleteError) {
      console.error('delete-account: deleteUser failed', deleteError);
      return new Response(
        JSON.stringify({ error: 'Account deletion failed' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('delete-account: unexpected error', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

Deno.serve(handleRequest);
