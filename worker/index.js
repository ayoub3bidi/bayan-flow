const POSTHOG_API_HOST = 'us.i.posthog.com';
const POSTHOG_ASSETS_HOST = 'us-assets.i.posthog.com';

async function handlePostHogProxy(request, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const pathWithParams = pathname + url.search;

  // Proxy PostHog static assets (session replay, surveys, etc.)
  const targetHost =
    pathname.startsWith('/static/') || pathname.startsWith('/array/')
      ? POSTHOG_ASSETS_HOST
      : POSTHOG_API_HOST;

  const originHeaders = new Headers(request.headers);
  originHeaders.delete('cookie');

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

  const response = await fetch(
    new Request(`https://${targetHost}${pathWithParams}`, init)
  );

  // Cache static assets
  if (targetHost === POSTHOG_ASSETS_HOST && response.status === 200) {
    const cache = caches.default;
    ctx.waitUntil(cache.put(request, response.clone()));
  }

  return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route PostHog proxy requests (e.bayanflow.com)
    if (url.hostname === 'e.bayanflow.com') {
      return handlePostHogProxy(request, ctx);
    }

    const accept = request.headers.get('Accept') || '';

    if (accept.includes('text/markdown')) {
      const path = url.pathname === '/' ? '/index' : url.pathname;
      const mdPath = `/markdown${path}.md`;

      const init = {
        method: request.method,
        headers: request.headers,
      };
      const mdResponse = await env.ASSETS.fetch(
        new Request(new URL(mdPath, request.url).toString(), init)
      );

      if (mdResponse.ok) {
        return new Response(mdResponse.body, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const fallbackResponse = await env.ASSETS.fetch(
        new Request(
          new URL('/markdown/_fallback.md', request.url).toString(),
          init
        )
      );
      return new Response(fallbackResponse.body, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
