/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/** @typedef {{ mediaSrc: string; connectSrc: string }} CspDirectives */

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
 * Extract the CSP value from netlify.toml security headers.
 * @param {string} content
 * @returns {string}
 */
export function extractCspFromNetlifyToml(content) {
  const match = content.match(/Content-Security-Policy = "([^"]+)"/);
  if (!match) {
    throw new Error('Content-Security-Policy not found in netlify.toml');
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
