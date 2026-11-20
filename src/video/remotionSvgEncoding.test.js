/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Export scenes draw '∞' and Arabic labels inside <svg>. web-renderer < 4.0.458
// encoded SVGs with btoa(), which throws on any non-Latin-1 character.
describe('@remotion/web-renderer SVG encoding', () => {
  it('rasterises SVGs with a Unicode-safe data URL', () => {
    const source = readFileSync(
      resolve('node_modules/@remotion/web-renderer/dist/esm/index.mjs'),
      'utf8'
    );
    expect(source).not.toMatch(/btoa\(svg/);
    expect(source).toMatch(/svg\+xml;charset=utf-8,\$\{encodeURIComponent\(/);
  });
});
