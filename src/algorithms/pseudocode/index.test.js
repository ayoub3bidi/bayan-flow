/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizePseudocodeLocale,
  getPseudocodeForLocale,
  getPseudocode,
} from './index.js';

describe('normalizePseudocodeLocale', () => {
  it('defaults missing or unknown languages to English', () => {
    expect(normalizePseudocodeLocale(undefined)).toBe('en');
    expect(normalizePseudocodeLocale('')).toBe('en');
    expect(normalizePseudocodeLocale('de')).toBe('en');
    expect(normalizePseudocodeLocale('zh-CN')).toBe('en');
  });

  it('normalizes regional tags to base locale', () => {
    expect(normalizePseudocodeLocale('fr-FR')).toBe('fr');
    expect(normalizePseudocodeLocale('ar_SA')).toBe('ar');
    expect(normalizePseudocodeLocale('en-US')).toBe('en');
  });
});

describe('getPseudocodeForLocale', () => {
  it('returns French pseudocode for bubbleSort when locale is fr', () => {
    const text = getPseudocodeForLocale('bubbleSort', 'fr');
    expect(text).toBeTruthy();
    expect(text).toContain('FONCTION');
  });

  it('falls back to English when locale has no entry but EN does', () => {
    const en = getPseudocodeForLocale('bubbleSort', 'en');
    expect(en).toBeTruthy();
  });

  it('returns null for unknown algorithm keys', () => {
    expect(getPseudocodeForLocale('notARealAlgorithmKey123', 'en')).toBeNull();
  });

  it('returns pseudocode for inorderTraversal', () => {
    const text = getPseudocodeForLocale('inorderTraversal', 'en');
    expect(text).toBeTruthy();
    expect(text).toContain('InorderTraversal');
  });

  it('returns pseudocode for preorderTraversal', () => {
    const text = getPseudocodeForLocale('preorderTraversal', 'en');
    expect(text).toBeTruthy();
    expect(text).toContain('PreorderTraversal');
  });

  it('returns pseudocode for postorderTraversal', () => {
    const text = getPseudocodeForLocale('postorderTraversal', 'en');
    expect(text).toBeTruthy();
    expect(text).toContain('PostorderTraversal');
  });
});

describe('getPseudocode', () => {
  it('matches English getPseudocodeForLocale', () => {
    expect(getPseudocode('bubbleSort')).toBe(
      getPseudocodeForLocale('bubbleSort', 'en')
    );
  });
});
