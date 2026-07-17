import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../worker/index.js';

function createFetchHandler(assetsMap = {}) {
  const assetsFetch = vi.fn(async req => {
    const url = new URL(req.url);
    const content = assetsMap[url.pathname];
    if (content) {
      return new Response(content, { status: 200 });
    }
    return new Response('Not Found', { status: 404 });
  });

  return { ASSETS: { fetch: assetsFetch } };
}

function makeRequest(url, accept = '*/*') {
  return new Request(url, {
    headers: { Accept: accept },
  });
}

describe('Worker markdown negotiation', () => {
  let env;

  beforeEach(() => {
    env = createFetchHandler({
      '/markdown/index.md': '# Bayan Flow\n\nTest content',
      '/markdown/app.md': '# Algorithm Visualizer\n\nTest',
      '/markdown/_fallback.md': '# Bayan Flow\n\nFallback',
    });
  });

  it('serves markdown when Accept includes text/markdown', async () => {
    const req = makeRequest('https://bayanflow.com/', 'text/markdown');
    const res = await worker.fetch(req, env);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8'
    );
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(await res.text()).toBe('# Bayan Flow\n\nTest content');
  });

  it('serves markdown for /app path', async () => {
    const req = makeRequest('https://bayanflow.com/app', 'text/markdown');
    const res = await worker.fetch(req, env);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8'
    );
    expect(await res.text()).toBe('# Algorithm Visualizer\n\nTest');
  });

  it('serves fallback markdown when path has no matching .md file', async () => {
    const req = makeRequest('https://bayanflow.com/unknown', 'text/markdown');
    const res = await worker.fetch(req, env);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8'
    );
    expect(await res.text()).toBe('# Bayan Flow\n\nFallback');
  });

  it('passes through to ASSETS for non-markdown requests', async () => {
    const req = makeRequest('https://bayanflow.com/', 'text/html');
    await worker.fetch(req, env);

    expect(env.ASSETS.fetch).toHaveBeenCalledWith(expect.any(Request));
  });

  it('passes through to ASSETS when Accept header is missing', async () => {
    const req = new Request('https://bayanflow.com/');
    await worker.fetch(req, env);

    expect(env.ASSETS.fetch).toHaveBeenCalled();
  });

  it('passes through to ASSETS when Accept is */*', async () => {
    const req = makeRequest('https://bayanflow.com/', '*/*');
    await worker.fetch(req, env);

    expect(env.ASSETS.fetch).toHaveBeenCalled();
  });

  it('handles Accept header with multiple types including text/markdown', async () => {
    const req = makeRequest(
      'https://bayanflow.com/',
      'text/html, text/markdown;q=0.9'
    );
    const res = await worker.fetch(req, env);

    expect(res.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8'
    );
  });
});
