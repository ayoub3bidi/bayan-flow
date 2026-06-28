/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  assertAuthCspDirectives,
  assertVideoExportCspDirectives,
  extractCspFromHeadersFile,
  extractCspFromNetlifyToml,
  parseCspDirectives,
} from '../../scripts/cspHeaders.js';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

describe('CSP security headers', () => {
  const headersPath = path.join(repoRoot, 'public', '_headers');
  const netlifyPath = path.join(repoRoot, 'netlify.toml');
  let headersCsp;

  beforeEach(() => {
    headersCsp = extractCspFromHeadersFile(
      fs.readFileSync(headersPath, 'utf8')
    );
    const directives = parseCspDirectives(headersCsp);
    const connectSrc = directives.get('connect-src') ?? '';
    const match = connectSrc.match(/https:\/\/[a-zA-Z0-9.-]+\.supabase\.co/);
    if (match) {
      vi.stubEnv('VITE_SUPABASE_URL', match[0]);
    }
  });

  it('public/_headers allows blob media for export preview and Remotion telemetry', () => {
    assertVideoExportCspDirectives(headersCsp, 'public/_headers');
    assertAuthCspDirectives(headersCsp, 'public/_headers');
  });

  it('netlify.toml CSP matches public/_headers video-export directives', () => {
    const netlifyCsp = extractCspFromNetlifyToml(
      fs.readFileSync(netlifyPath, 'utf8')
    );

    assertVideoExportCspDirectives(netlifyCsp, 'netlify.toml');
    assertAuthCspDirectives(netlifyCsp, 'netlify.toml');
    expect(netlifyCsp).toBe(headersCsp);
  });
});
