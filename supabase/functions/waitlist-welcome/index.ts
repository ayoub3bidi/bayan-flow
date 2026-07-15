/**
 * Sends a one-time Pro waitlist confirmation email via Resend.
 * Fail-open: returns 200 even when email delivery fails (signup already stored).
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildCorsHeaders } from '../_shared/cors.ts';

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

function buildEmailHtml(
  position: number,
): { subject: string; html: string } {
  const perkLine =
    'As a waitlist member, you will be eligible for 50% off your first year of Pro plan (annual plan) when we launch.';

  const subject = 'You are on the Pro Plan Waitlist!';

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: #364153; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #2b7fff; font-size: 1.5rem;">Thank you for joining the Pro plan Waitlist!</h1>
  <p>Thanks for joining the Pro Plan waitlist.</p>
  <p>${perkLine}</p>
  <p><strong>What the Pro Plan will unlock:</strong></p>
  <ul>
    <li>Custom algorithm inputs</li>
    <li>Side-by-side comparison mode</li>
    <li>Unlimited video export</li>
    <li>Presentation mode for teaching</li>
  </ul>
  <p>We will email you at this address when the Pro Plan launches. No spam, just one launch note when it is ready.</p>
  <p style="color: #6b7280; font-size: 0.875rem;">Bayan Flow: Clarity in Algorithms · <a href="https://bayanflow.com">bayanflow.com</a></p>
</body>
</html>`;

  return { subject, html };
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  if (!apiKey) {
    console.warn('waitlist-welcome: RESEND_API_KEY not configured');
    return false;
  }

  const from = Deno.env.get('FROM_EMAIL')?.trim() || 'Bayan Flow <contact@bayanflow.com>';

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
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('waitlist-welcome: Resend error', response.status, text);
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
    const position =
      typeof body?.position === 'number' && body.position > 0
        ? Math.floor(body.position)
        : 0;

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

    const { subject, html } = buildEmailHtml(position);
    const sent = await sendViaResend(email, subject, html);

    if (sent) {
      await supabase
        .from('waitlist')
        .update({ welcomed_at: new Date().toISOString() })
        .eq('id', row.id);
    }

    return jsonResponse({ ok: true, sent }, 200, req);
  } catch (error) {
    console.error('waitlist-welcome: unexpected error', error);
    return jsonResponse({ ok: true, sent: false }, 200, req);
  }
}

Deno.serve(handleRequest);
