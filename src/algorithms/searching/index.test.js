/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { binarySearch, binarySearchPure, searchingAlgorithms } from './index';

describe('searchingAlgorithms registry', () => {
  it('exposes only binarySearch', () => {
    expect(Object.keys(searchingAlgorithms)).toEqual(['binarySearch']);
    expect(typeof searchingAlgorithms.binarySearch).toBe('function');
  });
});

describe('binarySearch', () => {
  it('finds target in sorted array', () => {
    const sorted = [1, 3, 5, 7, 9];
    const steps = binarySearch(sorted, 7);
    expect(steps.length).toBeGreaterThan(1);
    const last = steps[steps.length - 1];
    expect(last.states[3]).toBe('sorted');
    expect(binarySearchPure(sorted, 7)).toBe(3);
  });

  it('returns not found when target absent', () => {
    const sorted = [1, 2, 4, 8];
    expect(binarySearchPure(sorted, 5)).toBe(-1);
    const steps = binarySearch(sorted, 5);
    expect(steps[steps.length - 1].array).toEqual(sorted);
  });

  it('each step keeps array length consistent', () => {
    const sorted = [2, 4, 6, 8, 10, 12];
    const steps = binarySearch(sorted, 6);
    steps.forEach(step => {
      expect(step.array.length).toBe(sorted.length);
      expect(step.states.length).toBe(sorted.length);
      expect(step.targetValue).toBe(6);
    });
  });
});
