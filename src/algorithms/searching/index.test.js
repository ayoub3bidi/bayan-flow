/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  linearSearch,
  linearSearchPure,
  binarySearch,
  binarySearchPure,
  ternarySearch,
  ternarySearchPure,
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
import {
  breadthFirstSearchGraph,
  breadthFirstSearchGraphPure,
} from './bfsGraph';

describe('searchingAlgorithms registry', () => {
  it('exposes all searching algorithms', () => {
    expect(Object.keys(searchingAlgorithms)).toEqual([
      'linearSearch',
      'binarySearch',
      'ternarySearch',
      'jumpSearch',
      'interpolationSearch',
      'exponentialSearch',
      'fibonacciSearch',
      'depthFirstSearch',
      'breadthFirstSearchGraph',
    ]);
    expect(typeof searchingAlgorithms.linearSearch).toBe('function');
    expect(typeof searchingAlgorithms.binarySearch).toBe('function');
    expect(typeof searchingAlgorithms.ternarySearch).toBe('function');
    expect(typeof searchingAlgorithms.jumpSearch).toBe('function');
    expect(typeof searchingAlgorithms.interpolationSearch).toBe('function');
    expect(typeof searchingAlgorithms.exponentialSearch).toBe('function');
    expect(typeof searchingAlgorithms.fibonacciSearch).toBe('function');
    expect(typeof searchingAlgorithms.depthFirstSearch).toBe('function');
    expect(typeof searchingAlgorithms.breadthFirstSearchGraph).toBe('function');
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

describe('ternarySearch', () => {
  it('finds target in sorted array', () => {
    const sorted = [1, 3, 5, 7, 9];
    const steps = ternarySearch(sorted, 7);
    expect(steps.length).toBeGreaterThan(1);
    const last = steps[steps.length - 1];
    expect(last.states[3]).toBe('sorted');
    expect(ternarySearchPure(sorted, 7)).toBe(3);
  });

  it('returns not found when target absent', () => {
    const sorted = [1, 2, 4, 8];
    expect(ternarySearchPure(sorted, 5)).toBe(-1);
    const steps = ternarySearch(sorted, 5);
    expect(steps[steps.length - 1].array).toEqual(sorted);
  });

  it('returns -1 for empty array', () => {
    expect(ternarySearchPure([], 1)).toBe(-1);
    const steps = ternarySearch([], 1);
    expect(steps.length).toBeGreaterThanOrEqual(2);
  });

  it('handles single element found and not found', () => {
    expect(ternarySearchPure([42], 42)).toBe(0);
    expect(ternarySearchPure([42], 7)).toBe(-1);
    const foundSteps = ternarySearch([42], 42);
    expect(foundSteps[foundSteps.length - 1].states[0]).toBe('sorted');
  });

  it('each step keeps array length and targetValue consistent', () => {
    const sorted = [2, 4, 6, 8, 10, 12];
    const target = 6;
    const steps = ternarySearch(sorted, target);
    steps.forEach(step => {
      expect(step.array.length).toBe(sorted.length);
      expect(step.states.length).toBe(sorted.length);
      expect(step.targetValue).toBe(target);
    });
  });

  it('matches binarySearchPure on strictly increasing arrays', () => {
    const sorted = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    for (const t of [-100, 2, 10, 15, 20, 100]) {
      expect(ternarySearchPure(sorted, t)).toBe(binarySearchPure(sorted, t));
    }
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
describe('breadthFirstSearchGraph (graph) visualization', () => {
  const nodes = [
    { id: '0', x: 0.5, y: 0.1 },
    { id: '1', x: 0.25, y: 0.5 },
    { id: '2', x: 0.75, y: 0.5 },
    { id: '3', x: 0.25, y: 0.9 },
  ];
  const edges = [
    { from: '0', to: '1' },
    { from: '0', to: '2' },
    { from: '1', to: '3' },
  ];
  const adjacency = {
    0: ['1', '2'],
    1: ['0', '3'],
    2: ['0'],
    3: ['1'],
  };

  it('produces graph-shaped steps ending with path or no-path description', () => {
    const steps = breadthFirstSearchGraph({
      adjacency,
      rootId: '0',
      goalId: '3',
      nodes,
      edges,
    });
    expect(steps.length).toBeGreaterThan(1);
    const last = steps[steps.length - 1];
    expect(last.nodes).toHaveLength(4);
    expect(last.nodeStates).toBeDefined();
    expect(typeof last.stackOrder).toBe('object'); // queue stored here
  });

  it('breadthFirstSearchGraphPure returns a path on a line graph', () => {
    const lineAdj = { 0: ['1'], 1: ['0', '2'], 2: ['1', '3'], 3: ['2'] };
    const path = breadthFirstSearchGraphPure(lineAdj, '0', '3');
    expect(path).toEqual(['0', '1', '2', '3']);
  });

  it('returns null when goal is disconnected', () => {
    const adj = { 0: [], 1: [] };
    expect(breadthFirstSearchGraphPure(adj, '0', '1')).toBeNull();
  });

  it('returns single node when root equals goal', () => {
    const adj = { 0: ['1'], 1: ['0'] };
    const path = breadthFirstSearchGraphPure(adj, '0', '0');
    expect(path).toEqual(['0']);
  });

  it('guarantees shortest path (fewer hops than DFS on a wide tree)', () => {
    // Root 0 -> children 1,2; 1 -> child 3; 2 -> child 3
    // BFS should find 0->2->3 OR 0->1->3 (both length 3)
    const adj = { 0: ['1', '2'], 1: ['0', '3'], 2: ['0', '3'], 3: ['1', '2'] };
    const path = breadthFirstSearchGraphPure(adj, '0', '3');
    expect(path).not.toBeNull();
    expect(path.length).toBe(3); // shortest: 0 -> 1|2 -> 3
  });
});
