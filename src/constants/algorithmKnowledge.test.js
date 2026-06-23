/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { ALGORITHM_KNOWLEDGE } from './algorithmKnowledge.js';
import { GRAPH_ALGORITHM_KEYS } from '../registry/graphAlgorithmRegistry.js';

describe('ALGORITHM_KNOWLEDGE', () => {
  it('includes linearSearch metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.linearSearch).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.linearSearch;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

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

  it('includes ternarySearch metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.ternarySearch).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.ternarySearch;
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

  it('includes interpolationSearch metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.interpolationSearch).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.interpolationSearch;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes exponentialSearch metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.exponentialSearch).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.exponentialSearch;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes fibonacciSearch metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.fibonacciSearch).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.fibonacciSearch;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes inorderTraversal metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.inorderTraversal).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.inorderTraversal;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes levelOrderTraversal metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.levelOrderTraversal).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.levelOrderTraversal;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes zigzagLevelOrderTraversal metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.zigzagLevelOrderTraversal).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.zigzagLevelOrderTraversal;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes preorderTraversal metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.preorderTraversal).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.preorderTraversal;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes postorderTraversal metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.postorderTraversal).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.postorderTraversal;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes morrisTraversal metadata for the insight panel', () => {
    expect(ALGORITHM_KNOWLEDGE.morrisTraversal).toBeDefined();
    const meta = ALGORITHM_KNOWLEDGE.morrisTraversal;
    expect(typeof meta.inventor).toBe('string');
    expect(meta.inventor.length).toBeGreaterThan(0);
    expect(typeof meta.year).toBe('number');
    expect(meta.realWorldUsesCount).toBeGreaterThanOrEqual(0);
    expect(meta.factsCount).toBeGreaterThanOrEqual(0);
    expect(
      meta.youtubeVideoId === null || typeof meta.youtubeVideoId === 'string'
    ).toBe(true);
  });

  it('includes metadata for every graph algorithm insight entry', () => {
    GRAPH_ALGORITHM_KEYS.forEach(algorithmKey => {
      expect(ALGORITHM_KNOWLEDGE[algorithmKey]).toBeDefined();
      const meta = ALGORITHM_KNOWLEDGE[algorithmKey];
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
});
