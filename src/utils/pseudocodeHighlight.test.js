/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  highlightPseudocodeToHtml,
  highlightLine,
} from './pseudocodeHighlight';

describe('highlightPseudocodeToHtml', () => {
  it('escapes HTML in source', () => {
    const html = highlightPseudocodeToHtml('IF x < 0 THEN');
    expect(html).not.toContain('<0');
    expect(html).toContain('&lt;');
    expect(html).not.toContain('<script');
  });

  it('wraps keywords, arrows, ops, numbers, punctuation and line gutter', () => {
    const html = highlightPseudocodeToHtml(
      'FUNCTION Foo():\n  n ← 1\n  IF n < 2:'
    );
    expect(html).toContain('pc-line');
    expect(html).toContain('pc-lineno');
    expect(html).toContain('pc-line-body');
    expect(html).toContain('pc-kw');
    expect(html).toContain('pc-arrow');
    expect(html).toContain('pc-num');
    expect(html).toContain('pc-op');
    expect(html).toContain('pc-punc');
    expect(html).toMatch(/FUNCTION/);
    expect(html).toContain('←');
  });

  it('highlights unicode operators', () => {
    const html = highlightPseudocodeToHtml('IF a ≤ b AND x ≠ y');
    expect(html).toContain('pc-op');
    expect(html).toContain('≤');
    expect(html).toContain('≠');
  });

  it('numbers literals and constants', () => {
    const html = highlightPseudocodeToHtml(
      'distance ← infinity\nflag ← false\nx ← 3.14'
    );
    expect(html).toContain('pc-num');
    expect(html).toContain('infinity');
    expect(html).toContain('false');
    expect(html).toContain('3.14');
  });

  it('assigns line numbers per line', () => {
    const html = highlightPseudocodeToHtml('a\nb\nc');
    expect(html).toMatch(/pc-lineno[^>]*>1</);
    expect(html).toMatch(/pc-lineno[^>]*>2</);
    expect(html).toMatch(/pc-lineno[^>]*>3</);
  });

  it('highlightLine returns empty string for null or undefined input', () => {
    expect(highlightLine(null)).toBe('');
    expect(highlightLine(undefined)).toBe('');
  });

  it('highlightPseudocodeToHtml("") returns empty string', () => {
    expect(highlightPseudocodeToHtml('')).toBe('');
  });
});
