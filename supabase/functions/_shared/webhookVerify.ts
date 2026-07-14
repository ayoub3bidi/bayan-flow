import { Webhook } from 'npm:standardwebhooks@1.0.0';

/**
 * Supabase Dashboard Auth hook secrets are often stored as `v1,whsec_...`.
 * Standard Webhooks expects `whsec_...` (or raw base64), so strip the `v1,` prefix.
 * @param {string} secret
 * @returns {string}
 */
export function normalizeStandardWebhookSecret(secret) {
  if (secret.startsWith('v1,')) {
    return secret.slice(3);
  }
  return secret;
}

/**
 * @param {Request} req
 * @param {string} secretEnvKey
 * @returns {Promise<Record<string, unknown>>}
 */
export async function verifyStandardWebhook(req, secretEnvKey) {
  const rawSecret = Deno.env.get(secretEnvKey);
  if (!rawSecret) {
    throw new Error(`Missing webhook secret: ${secretEnvKey}`);
  }

  const secret = normalizeStandardWebhookSecret(rawSecret);
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());
  const webhook = new Webhook(secret);
  return /** @type {Record<string, unknown>} */ (
    webhook.verify(payload, headers)
  );
}

/**
 * @param {Request} req
 * @param {string} secretEnvKey
 * @returns {boolean}
 */
export function verifySharedSecret(req, secretEnvKey) {
  const secret = Deno.env.get(secretEnvKey);
  if (!secret) {
    return false;
  }

  const header = req.headers.get('x-webhook-secret');
  return header === secret;
}
