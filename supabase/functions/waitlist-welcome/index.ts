/**
 * Sends a one-time Pro waitlist confirmation email via Resend.
 * Fail-open: returns 200 even when email delivery fails (signup already stored).
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { buildWaitlistWelcomeEmail } from '../_shared/transactionalEmails.ts';
import { sendTelegramAlert } from '../_shared/telegram.ts';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: Record<string, unknown>, status = 200, req: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      'Content-Type': 'application/json',
    },
  });
}

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized || !EMAIL_PATTERN.test(normalized)) {
    return null;
  }
  return normalized;
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  if (!apiKey) {
    console.warn('waitlist-welcome: RESEND_API_KEY not configured');
    return false;
  }

  const from =
    Deno.env.get('FROM_EMAIL')?.trim() ||
    'Bayan Flow <contact@bayanflow.com>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('waitlist-welcome: Resend error', response.status, errText);
    return false;
  }

  return true;
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, req);
  }

  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);

    if (!email) {
      return jsonResponse({ error: 'Invalid email' }, 400, req);
    }

    const supabase = getServiceClient();
    const { data: row, error: lookupError } = await supabase
      .from('waitlist')
      .select('id, welcomed_at')
      .eq('email', email)
      .maybeSingle();

    if (lookupError || !row) {
      return jsonResponse({ ok: true, sent: false }, 200, req);
    }

    if (row.welcomed_at) {
      return jsonResponse({ ok: true, sent: false }, 200, req);
    }

    const { subject, html, text } = buildWaitlistWelcomeEmail();
    const sent = await sendViaResend(email, subject, html, text);

    if (sent) {
      await supabase
        .from('waitlist')
        .update({ welcomed_at: new Date().toISOString() })
        .eq('id', row.id);
    }

    // Notify on new waitlist join
    await sendTelegramAlert(
      [
        'New Pro waitlist member!',
        '',
        `Email: ${email}`,
        `Time: ${new Date().toISOString()}`,
      ].join('\n')
    );

    return jsonResponse({ ok: true, sent }, 200, req);
  } catch (error) {
    console.error('waitlist-welcome: unexpected error', error);
    return jsonResponse({ ok: true, sent: false }, 200, req);
  }
}

Deno.serve(handleRequest);
