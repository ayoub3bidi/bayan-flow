export default {
  async fetch(request, env) {
    const accept = request.headers.get('Accept') || '';

    if (accept.includes('text/markdown')) {
      const url = new URL(request.url);
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
