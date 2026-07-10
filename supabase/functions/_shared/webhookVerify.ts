import { Webhook } from 'npm:standardwebhooks@1.0.0';

/**
 * @param {Request} req
 * @param {string} secretEnvKey
 * @returns {Promise<Record<string, unknown>>}
 */
export async function verifyStandardWebhook(req, secretEnvKey) {
  const secret = Deno.env.get(secretEnvKey);
  if (!secret) {
    throw new Error(`Missing webhook secret: ${secretEnvKey}`);
  }

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
