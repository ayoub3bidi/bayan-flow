/**
 * Syncs the authenticated Supabase user to Resend and sends a one-time
 * welcome email on first sign-in. Identity always comes from the JWT.
 * Fail-open: returns 200 even when Resend API fails.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { buildAccountWelcomeEmail } from '../_shared/transactionalEmails.ts';

function jsonResponse(body, status = 200, req) {
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

/**
 * Resend renamed Audiences to Segments; RESEND_SEGMENT_ID is preferred.
 * RESEND_AUDIENCE_ID is kept as a fallback for existing Supabase secrets.
 * @returns {string | undefined}
 */
function getResendSegmentId() {
  return (
    Deno.env.get('RESEND_SEGMENT_ID')?.trim() ||
    Deno.env.get('RESEND_AUDIENCE_ID')?.trim() ||
    undefined
  );
}

/**
 * @param {string} apiKey
 * @param {string} email
 * @param {Record<string, string>} properties
 * @param {string | undefined} segmentId
 * @returns {Promise<boolean>}
 */
async function upsertResendContact(email, properties = {}) {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  if (!apiKey) {
    console.warn('sync-contacts: RESEND_API_KEY not configured');
    return false;
  }

  const segmentId = getResendSegmentId();
  const firstName = firstNameFromDisplayName(properties.display_name ?? '');
  const contactProperties = {
    ...properties,
    signup_source: 'bayanflow',
  };

  const createBody = {
    email,
    ...(firstName ? { first_name: firstName } : {}),
    unsubscribed: false,
    properties: contactProperties,
    ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
  };

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const createResponse = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify(createBody),
  });

  if (createResponse.ok) {
    return true;
  }

  const createErrorText = await createResponse.text();

  // Contact already exists — update metadata and keep fail-open behavior.
  if (createResponse.status === 409 || createResponse.status === 422) {
    const updateBody = {
      ...(firstName ? { first_name: firstName } : {}),
      unsubscribed: false,
      properties: contactProperties,
    };

    const updateResponse = await fetch(
      `https://api.resend.com/contacts/${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateBody),
      }
    );

    if (!updateResponse.ok) {
      const updateErrorText = await updateResponse.text();
      console.error(
        'sync-contacts: Resend contact update error',
        updateResponse.status,
        updateErrorText
      );
      return false;
    }

    if (segmentId) {
      const segmentResponse = await fetch(
        `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!segmentResponse.ok && segmentResponse.status !== 409) {
        const segmentErrorText = await segmentResponse.text();
        console.error(
          'sync-contacts: Resend segment assign error',
          segmentResponse.status,
          segmentErrorText
        );
      }
    }

    return true;
  }

  console.error(
    'sync-contacts: Resend contact create error',
    createResponse.status,
    createErrorText
  );
  return false;
}

/**
 * @param {string} to
 * @param {string} firstName
 * @returns {Promise<boolean>}
 */
async function sendWelcomeEmail(to, firstName) {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  if (!apiKey) {
    console.warn('sync-contacts: RESEND_API_KEY not configured');
    return false;
  }

  const from =
    Deno.env.get('FROM_EMAIL')?.trim() ||
    'Bayan Flow <contact@bayanflow.com>';
  const { subject, html, text } = buildAccountWelcomeEmail(firstName);

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
    console.error('sync-contacts: welcome email error', response.status, errText);
    return false;
  }

  return true;
}

function firstNameFromDisplayName(displayName) {
  if (typeof displayName !== 'string' || !displayName.trim()) {
    return '';
  }
  return displayName.trim().split(/\s+/)[0] ?? '';
}

/**
 * Atomically claim the one-time welcome email slot for this profile.
 * Only the caller that wins the conditional update may send the email.
 * @param {ReturnType<typeof getServiceClient>} supabaseAdmin
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function claimWelcomeEmailSlot(supabaseAdmin, userId) {
  const claimedAt = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ welcome_email_sent_at: claimedAt })
    .eq('id', userId)
    .is('welcome_email_sent_at', null)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('sync-contacts: welcome claim error', error);
    return false;
  }

  return Boolean(data?.id);
}

/**
 * Roll back a failed welcome send so the next sign-in can retry.
 * @param {ReturnType<typeof getServiceClient>} supabaseAdmin
 * @param {string} userId
 */
async function rollbackWelcomeEmailClaim(supabaseAdmin, userId) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ welcome_email_sent_at: null })
    .eq('id', userId);

  if (error) {
    console.error('sync-contacts: welcome claim rollback failed', error);
  }
}

export async function handleRequest(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, req);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401, req);
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabaseAdmin = getServiceClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user?.email) {
      return jsonResponse({ error: 'Unauthorized' }, 401, req);
    }

    let plan = 'free';
    let displayName = '';
    let language = 'en';
    try {
      const body = await req.json();
      if (typeof body?.displayName === 'string') {
        displayName = body.displayName.trim().slice(0, 120);
      }
      if (typeof body?.language === 'string' && body.language.trim()) {
        language = body.language.trim().slice(0, 16);
      }
    } catch {
      // Empty body is fine — JWT identity is enough.
    }

    if (!displayName) {
      const meta = user.user_metadata ?? {};
      displayName =
        (typeof meta.full_name === 'string' && meta.full_name) ||
        (typeof meta.name === 'string' && meta.name) ||
        '';
    }

    // Read plan from verified profile (service-role), not client body
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle();

    if (userProfile?.plan) {
      plan = userProfile.plan;
    }

    const synced = await upsertResendContact(user.email, {
      plan,
      display_name: displayName,
      language,
      user_id: user.id,
    });

    let welcomeSent = false;
    const claimed = await claimWelcomeEmailSlot(supabaseAdmin, user.id);
    if (claimed) {
      welcomeSent = await sendWelcomeEmail(
        user.email,
        firstNameFromDisplayName(displayName)
      );
      if (!welcomeSent) {
        await rollbackWelcomeEmailClaim(supabaseAdmin, user.id);
      }
    }

    return jsonResponse({ ok: true, synced, welcomeSent }, 200, req);
  } catch (error) {
    console.error('sync-contacts: unexpected error', error);
    return jsonResponse({ ok: true, synced: false, welcomeSent: false }, 200, req);
  }
}

Deno.serve(handleRequest);
