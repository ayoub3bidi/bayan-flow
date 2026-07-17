/**
 * PostHog reverse proxy for Cloudflare Workers.
 * Proxies PostHog requests through your own domain to avoid ad-blockers.
 *
 * Usage:
 *   1. Add a route for e.bayanflow.com in wrangler.jsonc
 *   2. Set VITE_POSTHOG_HOST=https://e.bayanflow.com in .env
 *
 * @see https://posthog.com/docs/advanced/proxy
 */

const POSTHOG_API_HOST = 'us.i.posthog.com';
const POSTHOG_ASSETS_HOST = 'us-assets.i.posthog.com';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const pathWithParams = pathname + url.search;

    // Proxy PostHog static assets (session replay, surveys, etc.)
    if (pathname.startsWith('/static/') || pathname.startsWith('/array/')) {
      return proxyRequest(
        `https://${POSTHOG_ASSETS_HOST}${pathWithParams}`,
        request,
        ctx
      );
    }

    // Proxy all other PostHog requests (events, flags, etc.)
    return proxyRequest(
      `https://${POSTHOG_API_HOST}${pathWithParams}`,
      request,
      ctx
    );
  },
};

/**
 * Proxy a request to PostHog, stripping cookies and adding forwarded headers.
 * @param {string} targetUrl
 * @param {Request} request
 * @param { ExecutionContext } ctx
 * @returns {Promise<Response>}
 */
async function proxyRequest(targetUrl, request, ctx) {
  const originHeaders = new Headers(request.headers);

  // Strip cookies — PostHog doesn't need them for ingestion
  originHeaders.delete('cookie');

  // Forward the real client IP
  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) {
    originHeaders.set('X-Forwarded-For', clientIp);
  }

  const init = {
    method: request.method,
    headers: originHeaders,
    body:
      request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.arrayBuffer()
        : null,
  };

  const response = await fetch(new Request(targetUrl, init));

  // Cache static assets for performance
  if (targetUrl.includes('/static/') && response.status === 200) {
    const cache = caches.default;
    ctx.waitUntil(cache.put(request, response.clone()));
  }

  return response;
}
