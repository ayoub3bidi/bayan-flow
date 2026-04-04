/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  linearSearch,
  linearSearchPure,
  binarySearch,
  binarySearchPure,
  jumpSearch,
  jumpSearchPure,
  interpolationSearch,
  interpolationSearchPure,
  exponentialSearch,
  exponentialSearchPure,
  fibonacciSearch,
  fibonacciSearchPure,
  searchingAlgorithms,
} from './index';

describe('searchingAlgorithms registry', () => {
  it('exposes all searching algorithms', () => {
    expect(Object.keys(searchingAlgorithms)).toEqual([
      'linearSearch',
      'binarySearch',
      'jumpSearch',
      'interpolationSearch',
      'exponentialSearch',
      'fibonacciSearch',
      'depthFirstSearch',
    ]);
    expect(typeof searchingAlgorithms.linearSearch).toBe('function');
    expect(typeof searchingAlgorithms.binarySearch).toBe('function');
    expect(typeof searchingAlgorithms.jumpSearch).toBe('function');
    expect(typeof searchingAlgorithms.interpolationSearch).toBe('function');
    expect(typeof searchingAlgorithms.exponentialSearch).toBe('function');
    expect(typeof searchingAlgorithms.fibonacciSearch).toBe('function');
    expect(typeof searchingAlgorithms.depthFirstSearch).toBe('function');
  });
});

describe('linearSearch', () => {
  it('finds target in sorted array', () => {
    const sorted = [1, 3, 5, 7, 9];
    expect(linearSearchPure(sorted, 7)).toBe(3);
    const steps = linearSearch(sorted, 7);
    expect(steps.length).toBeGreaterThan(1);
    const last = steps[steps.length - 1];
    expect(last.states[3]).toBe('sorted');
  });

  it('returns not found when target absent', () => {
    const sorted = [1, 2, 4, 8];
    expect(linearSearchPure(sorted, 5)).toBe(-1);
    const steps = linearSearch(sorted, 5);
    expect(steps[steps.length - 1].array).toEqual(sorted);
  });

  it('handles empty array', () => {
    expect(linearSearchPure([], 1)).toBe(-1);
    const steps = linearSearch([], 1);
    expect(steps).toHaveLength(2);
    expect(steps[0].array).toEqual([]);
    expect(steps[1].array).toEqual([]);
    expect(steps[0].targetValue).toBe(1);
  });

  it('handles single element found and not found', () => {
    expect(linearSearchPure([42], 42)).toBe(0);
    expect(linearSearchPure([42], 7)).toBe(-1);
    const foundSteps = linearSearch([42], 42);
    expect(foundSteps[foundSteps.length - 1].states[0]).toBe('sorted');
  });

  it('each step keeps array length and targetValue consistent', () => {
    const sorted = [2, 4, 6, 8, 10, 12];
    const target = 6;
    const steps = linearSearch(sorted, target);
    steps.forEach(step => {
      expect(step.array.length).toBe(sorted.length);
      expect(step.states.length).toBe(sorted.length);
      expect(step.targetValue).toBe(target);
    });
  });

  it('matches indexOf on sorted arrays', () => {
    const sorted = [2, 4, 6, 8, 10, 12, 14];
    for (const t of [2, 10, 14, 7]) {
      const expected = sorted.indexOf(t);
      expect(linearSearchPure(sorted, t)).toBe(expected >= 0 ? expected : -1);
    }
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

describe('interpolationSearch', () => {
  it('finds target in sorted array', () => {
    const sorted = [1, 3, 5, 7, 9];
    expect(interpolationSearchPure(sorted, 7)).toBe(3);
    const steps = interpolationSearch(sorted, 7);
    const last = steps[steps.length - 1];
    expect(last.states[3]).toBe('sorted');
  });

  it('returns not found when target absent', () => {
    const sorted = [1, 2, 4, 8];
    expect(interpolationSearchPure(sorted, 5)).toBe(-1);
    const steps = interpolationSearch(sorted, 5);
    expect(steps[steps.length - 1].array).toEqual(sorted);
  });

  it('returns -1 for empty array', () => {
    expect(interpolationSearchPure([], 1)).toBe(-1);
    const steps = interpolationSearch([], 1);
    expect(steps.length).toBeGreaterThanOrEqual(1);
    expect(steps[steps.length - 1].description).toBeDefined();
  });

  it('handles all elements equal when target present', () => {
    const sorted = [5, 5, 5, 5];
    const idx = interpolationSearchPure(sorted, 5);
    expect(sorted[idx]).toBe(5);
  });

  it('handles all elements equal when target absent', () => {
    const sorted = [5, 5, 5, 5];
    expect(interpolationSearchPure(sorted, 3)).toBe(-1);
  });

  it('matches indexOf on arrays with unique elements', () => {
    const sorted = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    for (const t of [2, 10, 20, 7]) {
      const expected = sorted.indexOf(t);
      expect(interpolationSearchPure(sorted, t)).toBe(expected);
    }
  });

  it('each step keeps array length and targetValue consistent', () => {
    const sorted = [2, 4, 6, 8, 10, 12];
    const target = 6;
    const steps = interpolationSearch(sorted, target);
    steps.forEach(step => {
      expect(step.array.length).toBe(sorted.length);
      expect(step.states.length).toBe(sorted.length);
      expect(step.targetValue).toBe(target);
    });
  });
});

describe('exponentialSearch', () => {
  it('finds target in sorted array', () => {
    const sorted = [1, 3, 5, 7, 9];
    expect(exponentialSearchPure(sorted, 7)).toBe(3);
    const steps = exponentialSearch(sorted, 7);
    const last = steps[steps.length - 1];
    expect(last.states[3]).toBe('sorted');
  });

  it('returns not found when target absent', () => {
    const sorted = [1, 2, 4, 8];
    expect(exponentialSearchPure(sorted, 5)).toBe(-1);
    const steps = exponentialSearch(sorted, 5);
    expect(steps[steps.length - 1].array).toEqual(sorted);
  });

  it('returns -1 for empty array', () => {
    expect(exponentialSearchPure([], 1)).toBe(-1);
    const steps = exponentialSearch([], 1);
    expect(steps.length).toBeGreaterThanOrEqual(2);
  });

  it('finds target at index zero', () => {
    const sorted = [2, 4, 6, 8, 10];
    expect(exponentialSearchPure(sorted, 2)).toBe(0);
  });

  it('matches indexOf on arrays with unique elements', () => {
    const sorted = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    for (const t of [2, 10, 20, 7]) {
      const expected = sorted.indexOf(t);
      expect(exponentialSearchPure(sorted, t)).toBe(expected);
    }
  });

  it('each step keeps array length and targetValue consistent', () => {
    const sorted = [2, 4, 6, 8, 10, 12];
    const target = 6;
    const steps = exponentialSearch(sorted, target);
    steps.forEach(step => {
      expect(step.array.length).toBe(sorted.length);
      expect(step.states.length).toBe(sorted.length);
      expect(step.targetValue).toBe(target);
    });
  });
});

describe('fibonacciSearch', () => {
  it('finds target in sorted array', () => {
    const sorted = [1, 3, 5, 7, 9];
    expect(fibonacciSearchPure(sorted, 7)).toBe(3);
    const steps = fibonacciSearch(sorted, 7);
    const last = steps[steps.length - 1];
    expect(last.states[3]).toBe('sorted');
  });

  it('returns not found when target absent', () => {
    const sorted = [1, 2, 4, 8];
    expect(fibonacciSearchPure(sorted, 5)).toBe(-1);
    const steps = fibonacciSearch(sorted, 5);
    expect(steps[steps.length - 1].array).toEqual(sorted);
  });

  it('returns -1 for empty array', () => {
    expect(fibonacciSearchPure([], 1)).toBe(-1);
    const steps = fibonacciSearch([], 1);
    expect(steps.length).toBeGreaterThanOrEqual(2);
  });

  it('matches binarySearchPure on strictly increasing arrays', () => {
    const sorted = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    for (const t of [-100, 2, 10, 15, 20, 100]) {
      expect(fibonacciSearchPure(sorted, t)).toBe(binarySearchPure(sorted, t));
    }
  });

  it('each step keeps array length and targetValue consistent', () => {
    const sorted = [2, 4, 6, 8, 10, 12];
    const target = 6;
    const steps = fibonacciSearch(sorted, target);
    steps.forEach(step => {
      expect(step.array.length).toBe(sorted.length);
      expect(step.states.length).toBe(sorted.length);
      expect(step.targetValue).toBe(target);
    });
  });
});
