import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  SIGNUP_RATE_LIMIT,
  isIpBanned,
  isValidIp,
  shouldRejectSignupRateLimit,
  countRecentSignups,
} from '../_shared/banLogic.ts';
import { verifyStandardWebhook } from '../_shared/webhookVerify.ts';

const GENERIC_REJECT = {
  error: {
    message:
      'Sign-in is temporarily unavailable. Please try again later.',
    http_code: 400,
  },
};

/**
 * GoTrue only parses hook response bodies on HTTP 200/202.
 * Returning HTTP 400 is remapped to "Invalid payload sent to hook".
 * Reject by sending 200 with an `error` object (http_code inside the body).
 */
function reject(reason: string, extra: Record<string, unknown> = {}) {
  console.warn('before-signup: reject', { reason, ...extra });
  return jsonResponse(GENERIC_REJECT, 200);
}

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

export async function handleRequest(req) {
  if (req.method !== 'POST') {
    return reject('method_not_allowed', { method: req.method });
  }

  try {
    const payload = await verifyStandardWebhook(
      req,
      'BEFORE_USER_CREATED_HOOK_SECRET'
    );

    const metadata = /** @type {{ ip_address?: string }} */ (
      payload.metadata ?? {}
    );
    const user = /** @type {{ email?: string }} */ (payload.user ?? {});
    const email = typeof user.email === 'string' ? user.email.trim() : '';
    const ip = metadata.ip_address ?? null;

    if (!email) {
      return reject('missing_email');
    }

    if (!isValidIp(ip)) {
      console.warn('before-signup: missing metadata.ip_address', { email });
      const supabase = getServiceClient();
      await supabase.from('signup_pending').upsert({
        email,
        ip: null,
        created_at: new Date().toISOString(),
      });
      return jsonResponse({});
    }

    const supabase = getServiceClient();

    const { data: trusted } = await supabase
      .from('trusted_ips')
      .select('ip')
      .eq('ip', ip)
      .maybeSingle();

    if (!trusted) {
      const { data: bannedRows } = await supabase
        .from('banned_ips')
        .select('ip, expires_at')
        .eq('ip', ip);

      if (isIpBanned(bannedRows ?? [], ip)) {
        return reject('banned_ip', { ip });
      }

      const { data: recentEvents } = await supabase
        .from('signup_events')
        .select('created_at')
        .eq('ip', ip)
        .gte(
          'created_at',
          new Date(
            Date.now() - SIGNUP_RATE_LIMIT.windowMinutes * 60 * 1000
          ).toISOString()
        );

      const recentCount = countRecentSignups(
        recentEvents ?? [],
        SIGNUP_RATE_LIMIT.windowMinutes
      );

      if (shouldRejectSignupRateLimit(recentCount)) {
        return reject('rate_limited', { ip, recentCount });
      }
    }

    const { error: pendingError } = await supabase
      .from('signup_pending')
      .upsert({
        email,
        ip,
        created_at: new Date().toISOString(),
      });

    if (pendingError) {
      console.error('before-signup: signup_pending insert failed', pendingError);
      return reject('pending_insert', {
        code: pendingError.code,
        message: pendingError.message,
      });
    }

    return jsonResponse({});
  } catch (error) {
    console.error('before-signup: verification or handler error', error);
    return reject('verify_or_handler', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

Deno.serve(handleRequest);
