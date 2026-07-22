import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  banExpiresAtIso,
  evaluateSignupRisk,
  isIpBanned,
  isValidIp,
} from '../_shared/banLogic.ts';
import { sendTelegramAlert } from '../_shared/telegram.ts';
import { verifySharedSecret } from '../_shared/webhookVerify.ts';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

/**
 * @param {import('jsr:@supabase/supabase-js@2').SupabaseClient} supabase
 * @param {string} ip
 * @param {import('../_shared/banLogic.ts').SignupRiskResult} risk
 */
async function applyIpBan(supabase, ip, risk) {
  if (!risk.banHours) {
    return;
  }

  const now = new Date();
  await supabase.from('banned_ips').upsert({
    ip,
    reason: risk.reason,
    banned_by: 'system',
    banned_at: now.toISOString(),
    expires_at: banExpiresAtIso(now, risk.banHours),
  });
}

export async function handleRequest(req) {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!verifySharedSecret(req, 'POST_SIGNUP_WEBHOOK_SECRET')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const record = /** @type {{ id?: string, email?: string }} */ (
      body.record ?? {}
    );
    const userId = record.id;
    const email =
      typeof record.email === 'string' ? record.email.trim() : '';

    if (!userId || !email) {
      return jsonResponse({ error: 'Invalid payload' }, 400);
    }

    const supabase = getServiceClient();

    const { data: pending, error: pendingError } = await supabase
      .from('signup_pending')
      .select('ip')
      .eq('email', email)
      .maybeSingle();

    if (pendingError) {
      console.error('post-signup: signup_pending lookup failed', pendingError);
    }

    const ip = pending?.ip ?? null;

    if (isValidIp(ip)) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ signup_ip: ip })
        .eq('id', userId);

      if (profileError) {
        console.error('post-signup: profile update failed', profileError);
      }

      const { error: eventError } = await supabase
        .from('signup_events')
        .insert({
          ip,
          user_id: userId,
        });

      if (eventError) {
        console.error('post-signup: signup_events insert failed', eventError);
      }

      const { data: bannedRows, error: bannedError } = await supabase
        .from('banned_ips')
        .select('ip, expires_at')
        .eq('ip', ip);

      if (bannedError) {
        console.error('post-signup: banned_ips lookup failed', bannedError);
      }

      if (!isIpBanned(bannedRows ?? [], ip)) {
        const { data: ipEvents, error: ipEventsError } = await supabase
          .from('signup_events')
          .select('created_at')
          .eq('ip', ip)
          .order('created_at', { ascending: false })
          .limit(100);

        if (ipEventsError) {
          console.error(
            'post-signup: signup_events lookup failed',
            ipEventsError
          );
        }

        const risk = evaluateSignupRisk(ipEvents ?? []);
        if (risk) {
          if (risk.level === 'watch') {
            await sendTelegramAlert(
              `Bayan Flow signup watch: ${ip} — ${risk.reason}`
            );
          } else {
            await applyIpBan(supabase, ip, risk);
            await sendTelegramAlert(
              `Bayan Flow IP auto-ban (${risk.level}): ${ip} — ${risk.reason}`
            );
          }
        }
      }
    }

    // Notify on every new user registration
    const userRecord = body.record ?? {};
    const signupDisplayName =
      typeof userRecord.raw_user_meta_data?.full_name === 'string'
        ? userRecord.raw_user_meta_data.full_name
        : typeof userRecord.raw_user_meta_data?.name === 'string'
          ? userRecord.raw_user_meta_data.name
          : null;

    const signupAlert = [
      'New Bayan Flow user registered!',
      '',
      `Email: ${email}`,
      signupDisplayName ? `Name: ${signupDisplayName}` : null,
      ip ? `IP: ${ip}` : null,
      `Time: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join('\n');

    await sendTelegramAlert(signupAlert);

    const { error: cleanupError } = await supabase
      .from('signup_pending')
      .delete()
      .eq('email', email);

    if (cleanupError) {
      console.error('post-signup: signup_pending cleanup failed', cleanupError);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('post-signup: unexpected error', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

Deno.serve(handleRequest);
