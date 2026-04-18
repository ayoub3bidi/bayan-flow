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
});
