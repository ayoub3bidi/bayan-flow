/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { ALGORITHM_KNOWLEDGE } from './algorithmKnowledge.js';

describe('ALGORITHM_KNOWLEDGE', () => {
  it('includes binarySearch metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.binarySearch).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.binarySearch;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes jumpSearch metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.jumpSearch).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.jumpSearch;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });
});
