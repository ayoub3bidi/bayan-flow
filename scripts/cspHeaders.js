/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/** @typedef {{ mediaSrc: string; connectSrc: string; imgSrc: string }} CspDirectives */

/**
 * Parse semicolon-delimited CSP directives into a map.
 * @param {string} csp
 * @returns {Map<string, string>}
 */
export function parseCspDirectives(csp) {
  const directives = new Map();
  for (const part of csp.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const space = trimmed.indexOf(' ');
    if (space === -1) {
      directives.set(trimmed, '');
      continue;
    }
    directives.set(trimmed.slice(0, space), trimmed.slice(space + 1).trim());
  }
  return directives;
}

/**
 * Extract the global CSP value from a Cloudflare `_headers` file.
 * @param {string} content
 * @returns {string}
 */
export function extractCspFromHeadersFile(content) {
  const match = content.match(/^ {2}Content-Security-Policy: (.+)$/m);
  if (!match) {
    throw new Error('Content-Security-Policy not found in _headers');
  }
  return match[1].trim();
}

/**
 * Assert CSP directives required for in-browser video export preview and Remotion telemetry.
 * @param {string} csp
 * @param {string} source - Label for error messages (e.g. "public/_headers")
 * @returns {CspDirectives}
 */
export function assertVideoExportCspDirectives(csp, source) {
  const directives = parseCspDirectives(csp);

  const mediaSrc = directives.get('media-src');
  if (!mediaSrc?.includes("'self'") || !mediaSrc.includes('blob:')) {
    throw new Error(
      `${source}: media-src must include 'self' and blob: (required for export preview)`
    );
  }

  const connectSrc = directives.get('connect-src');
  if (!connectSrc?.includes('https://www.remotion.pro')) {
    throw new Error(
      `${source}: connect-src must include https://www.remotion.pro (Remotion telemetry)`
    );
  }

  return { mediaSrc, connectSrc: connectSrc ?? '' };
}

/**
 * Read the configured Supabase project URL from the environment.
 * Returns null when the env var is not set (CI builds skip Supabase CSP validation).
 * @returns {string|null}
 */
function getSupabaseOrigin() {
  const url = process.env.VITE_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Assert CSP directives required for PostHog analytics.
 * @param {string} csp
 * @param {string} source - Label for error messages (e.g. "public/_headers")
 * @returns {{ scriptSrc: string; connectSrc: string }}
 */
export function assertAnalyticsCspDirectives(csp, source) {
  const directives = parseCspDirectives(csp);

  const scriptSrc = directives.get('script-src');
  if (!scriptSrc?.includes('https://*.posthog.com')) {
    throw new Error(
      `${source}: script-src must include https://*.posthog.com (PostHog SDK)`
    );
  }

  const connectSrc = directives.get('connect-src');
  if (!connectSrc?.includes('https://*.posthog.com')) {
    throw new Error(
      `${source}: connect-src must include https://*.posthog.com (PostHog analytics)`
    );
  }

  return { scriptSrc: scriptSrc ?? '', connectSrc: connectSrc ?? '' };
}

/**
 * Assert CSP directives required for Supabase auth and Google profile avatars.
 * @param {string} csp
 * @param {string} source - Label for error messages (e.g. "public/_headers")
 * @returns {{ connectSrc: string; imgSrc: string }}
 */
export function assertAuthCspDirectives(csp, source) {
  const directives = parseCspDirectives(csp);

  const supabaseOrigin = getSupabaseOrigin();
  const connectSrc = directives.get('connect-src');
  if (supabaseOrigin && !connectSrc?.includes(supabaseOrigin)) {
    throw new Error(
      `${source}: connect-src must include ${supabaseOrigin} (Supabase auth)`
    );
  }

  const imgSrc = directives.get('img-src');
  if (!imgSrc?.includes('https://lh3.googleusercontent.com')) {
    throw new Error(
      `${source}: img-src must include https://lh3.googleusercontent.com (Google profile photos)`
    );
  }

  const scriptSrc = directives.get('script-src');
  if (!scriptSrc?.includes('https://accounts.google.com')) {
    throw new Error(
      `${source}: script-src must include https://accounts.google.com (Google Identity Services)`
    );
  }

  if (!connectSrc?.includes('https://accounts.google.com')) {
    throw new Error(
      `${source}: connect-src must include https://accounts.google.com (Google Identity Services)`
    );
  }

  if (!connectSrc?.includes('https://oauth2.googleapis.com')) {
    throw new Error(
      `${source}: connect-src must include https://oauth2.googleapis.com (Google OAuth token exchange)`
    );
  }

  const frameSrc = directives.get('frame-src');
  if (!frameSrc?.includes('https://accounts.google.com')) {
    throw new Error(
      `${source}: frame-src must include https://accounts.google.com (Google One Tap)`
    );
  }

  return { connectSrc: connectSrc ?? '', imgSrc: imgSrc ?? '' };
}
