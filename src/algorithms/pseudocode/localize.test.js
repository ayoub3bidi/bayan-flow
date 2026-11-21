/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { localizePseudocodeMap } from './localize.js';
import { pseudocodeStringsEn } from './strings.en.js';

describe('localizePseudocodeMap', () => {
  it('returns a shallow copy of the English map for non-fr/non-ar locale tags', () => {
    const en = { a: 'FUNCTION X():\n  RETURN 1' };
    const out = localizePseudocodeMap(en, 'de');
    expect(out).toEqual(en);
    expect(out).not.toBe(en);
  });

  it('applies French phrase and keyword replacements for every algorithm entry', () => {
    const fr = localizePseudocodeMap(pseudocodeStringsEn, 'fr');
    expect(fr.bubbleSort).toContain('FONCTION');
    expect(fr.bubbleSort).toContain('RETOURNER');
    expect(Object.keys(fr)).toEqual(Object.keys(pseudocodeStringsEn));
  });

  it('applies Arabic phrase and keyword replacements for every algorithm entry', () => {
    const ar = localizePseudocodeMap(pseudocodeStringsEn, 'ar');
    expect(ar.bubbleSort.length).toBeGreaterThan(20);
    expect(ar.quickSort || ar.mergeSort).toBeTruthy();
    expect(Object.keys(ar)).toEqual(Object.keys(pseudocodeStringsEn));
  });

  it('preserves algorithm keys and produces distinct FR vs AR strings', () => {
    const fr = localizePseudocodeMap(pseudocodeStringsEn, 'fr');
    const ar = localizePseudocodeMap(pseudocodeStringsEn, 'ar');
    expect(fr.dijkstra).not.toBe(ar.dijkstra);
    expect(fr.binarySearch).not.toBe(pseudocodeStringsEn.binarySearch);
  });

  it('leaves no English prose in Arabic pseudocode', () => {
    const ar = localizePseudocodeMap(pseudocodeStringsEn, 'ar');
    // Two plain lowercase words in a row (camelCase identifiers stripped) means
    // an untranslated phrase; an all-caps word means an untranslated keyword.
    const leftovers = Object.entries(ar).flatMap(([key, text]) =>
      text
        .split('\n')
        .filter(
          line =>
            /\b[a-z]{2,} [a-z]{2,}\b/.test(
              line.replace(/\b[a-z]+[A-Z]\w*/g, '')
            ) ||
            /\b[A-Z]{3,}\b/.test(line.replace(/\b(MIN|MAX)\b/g, '')) ||
            /[A-Za-z][\u0600-\u06FF]|[\u0600-\u06FF][A-Za-z]/.test(line)
        )
        .map(line => `${key}: ${line.trim()}`)
    );
    expect(leftovers).toEqual([]);
  });

  it('applies longer phrases before shorter ones they contain', () => {
    const out = localizePseudocodeMap(
      { x: 'buckets ← n empty lists\nREPORT negative cycle' },
      'ar'
    );
    expect(out.x).toBe('buckets ← n قوائم فارغة\nأبلغ عن دورة سالبة');
  });
});
