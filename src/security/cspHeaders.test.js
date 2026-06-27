/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  assertVideoExportCspDirectives,
  extractCspFromHeadersFile,
  extractCspFromNetlifyToml,
} from '../../scripts/cspHeaders.js';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

describe('CSP security headers', () => {
  it('public/_headers allows blob media for export preview and Remotion telemetry', () => {
    const headersPath = path.join(repoRoot, 'public', '_headers');
    const csp = extractCspFromHeadersFile(fs.readFileSync(headersPath, 'utf8'));
    assertVideoExportCspDirectives(csp, 'public/_headers');
  });

  it('netlify.toml CSP matches public/_headers video-export directives', () => {
    const headersPath = path.join(repoRoot, 'public', '_headers');
    const netlifyPath = path.join(repoRoot, 'netlify.toml');

    const headersCsp = extractCspFromHeadersFile(
      fs.readFileSync(headersPath, 'utf8')
    );
    const netlifyCsp = extractCspFromNetlifyToml(
      fs.readFileSync(netlifyPath, 'utf8')
    );

    assertVideoExportCspDirectives(netlifyCsp, 'netlify.toml');
    expect(netlifyCsp).toBe(headersCsp);
  });
});
