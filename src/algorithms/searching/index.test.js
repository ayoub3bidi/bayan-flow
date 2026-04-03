/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  binarySearch,
  binarySearchPure,
  jumpSearch,
  jumpSearchPure,
  searchingAlgorithms,
} from './index';

describe('searchingAlgorithms registry', () => {
  it('exposes binarySearch and jumpSearch', () => {
    expect(Object.keys(searchingAlgorithms)).toEqual([
      'binarySearch',
      'jumpSearch',
    ]);
    expect(typeof searchingAlgorithms.binarySearch).toBe('function');
    expect(typeof searchingAlgorithms.jumpSearch).toBe('function');
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

describe('jumpSearch', () => {
  it('finds target in sorted array', () => {
    const sorted = [1, 3, 5, 7, 9];
    expect(jumpSearchPure(sorted, 7)).toBe(3);
    const steps = jumpSearch(sorted, 7);
    const last = steps[steps.length - 1];
    expect(last.states[3]).toBe('sorted');
  });

  it('returns not found when target absent', () => {
    const sorted = [1, 2, 4, 8];
    expect(jumpSearchPure(sorted, 5)).toBe(-1);
    const steps = jumpSearch(sorted, 5);
    expect(steps[steps.length - 1].array).toEqual(sorted);
  });

  it('matches pure result on random-ish sorted arrays', () => {
    const sorted = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    for (const t of [2, 10, 20, 7]) {
      expect(jumpSearchPure(sorted, t)).toBe(
        sorted.indexOf(t) >= 0 ? sorted.indexOf(t) : -1
      );
    }
  });

  it('each step keeps array length and targetValue consistent', () => {
    const sorted = [2, 4, 6, 8, 10, 12];
    const target = 6;
    const steps = jumpSearch(sorted, target);
    steps.forEach(step => {
      expect(step.array.length).toBe(sorted.length);
      expect(step.states.length).toBe(sorted.length);
      expect(step.targetValue).toBe(target);
    });
  });
});
