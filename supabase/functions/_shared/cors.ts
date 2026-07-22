const PRODUCTION_ORIGINS = [
  'https://bayanflow.com',
  'https://dev.bayanflow.com',
];

const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const DEFAULT_ALLOWED_ORIGINS = Deno.env.get('DENO_DEPLOYMENT_ID')
  ? PRODUCTION_ORIGINS
  : [...PRODUCTION_ORIGINS, ...DEV_ORIGINS];

/**
 * @param {Request} req
 * @param {string[]} [extraOrigins]
 * @returns {string}
 */
export function resolveAllowedOrigin(req, extraOrigins = []) {
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  const allowlist = new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...configured,
    ...extraOrigins,
  ]);

  const origin = req.headers.get('Origin');
  if (origin && allowlist.has(origin)) {
    return origin;
  }

  return Deno.env.get('ALLOWED_ORIGIN') ?? 'https://bayanflow.com';
}

/**
 * @param {Request} req
 * @param {string[]} [extraOrigins]
 */
export function buildCorsHeaders(req, extraOrigins = []) {
  return {
    'Access-Control-Allow-Origin': resolveAllowedOrigin(req, extraOrigins),
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  };
}
