/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, vi, beforeEach } from 'vitest';
import {
  assertAnalyticsCspDirectives,
  assertAuthCspDirectives,
  assertVideoExportCspDirectives,
  extractCspFromHeadersFile,
  parseCspDirectives,
} from '../../scripts/cspHeaders.js';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

describe('CSP security headers', () => {
  const headersPath = path.join(repoRoot, 'public', '_headers');
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

  it('public/_headers allows PostHog analytics', () => {
    assertAnalyticsCspDirectives(headersCsp, 'public/_headers');
  });
});
