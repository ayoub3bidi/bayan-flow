/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { highlightPseudocodeToHtml } from './pseudocodeHighlight';

describe('highlightPseudocodeToHtml', () => {
  it('escapes HTML in source', () => {
    const html = highlightPseudocodeToHtml('IF x < 0 THEN');
    expect(html).not.toContain('<0');
    expect(html).toContain('&lt;');
  });

  it('wraps keywords and arrows', () => {
    const html = highlightPseudocodeToHtml('FUNCTION Foo():\n  n ← 1');
    expect(html).toContain('pc-kw');
    expect(html).toMatch(/FUNCTION/);
    expect(html).toContain('pc-arrow');
    expect(html).toContain('←');
  });
});
