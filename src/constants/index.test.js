/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { vi, describe, it, expect } from 'vitest';

// Unmock constants so we test the real module (setup.js mocks it globally)
vi.unmock('../constants');
vi.unmock('../constants/index.js');

import {
  ALGORITHM_TYPES,
  SORTING_ALGORITHMS,
  PATHFINDING_ALGORITHMS,
  SEARCHING_ALGORITHMS,
  ANIMATION_SPEEDS,
  ELEMENT_STATES,
  STATE_COLORS,
  GRID_ELEMENT_STATES,
  GRID_STATE_COLORS,
  VISUALIZATION_MODES,
  ALGORITHM_COMPLEXITY,
  COMPLEXITY_FUNCTIONS,
  DEFAULT_ARRAY_SIZE,
  GRID_SIZES,
  DEFAULT_GRID_SIZE,
  PATHFINDING_COMPLEXITY,
  SEARCHING_COMPLEXITY,
} from './index.js';

describe('Constants', () => {
  describe('ALGORITHM_TYPES', () => {
    it('should have expected keys', () => {
      expect(ALGORITHM_TYPES).toEqual({
        SORTING: 'sorting',
        PATHFINDING: 'pathfinding',
        SEARCHING: 'searching',
        TREE_TRAVERSAL: 'treeTraversal',
      });
    });
  });

  describe('SORTING_ALGORITHMS', () => {
    it('should contain all 14 sorting algorithms', () => {
      const expected = [
        'bubbleSort',
        'mergeSort',
        'quickSort',
        'insertionSort',
        'selectionSort',
        'heapSort',
        'shellSort',
        'radixSort',
        'countingSort',
        'bucketSort',
        'cycleSort',
        'combSort',
        'timSort',
        'bogoSort',
      ];
      expect(Object.values(SORTING_ALGORITHMS)).toEqual(
        expect.arrayContaining(expected)
      );
      expect(Object.keys(SORTING_ALGORITHMS)).toHaveLength(14);
    });
  });

  describe('PATHFINDING_ALGORITHMS', () => {
    it('should contain all 9 pathfinding algorithms', () => {
      const expected = [
        'bfs',
        'dijkstra',
        'aStar',
        'bidirectionalSearch',
        'greedyBestFirstSearch',
        'jumpPointSearch',
        'bellmanFord',
        'idaStar',
        'dStarLite',
      ];
      expect(Object.values(PATHFINDING_ALGORITHMS)).toEqual(
        expect.arrayContaining(expected)
      );
      expect(Object.keys(PATHFINDING_ALGORITHMS)).toHaveLength(9);
    });
  });

  describe('SEARCHING_ALGORITHMS', () => {
    it('should contain searching algorithm keys', () => {
      expect(Object.values(SEARCHING_ALGORITHMS)).toEqual([
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
      expect(Object.keys(SEARCHING_ALGORITHMS)).toHaveLength(9);
    });
  });

  describe('ANIMATION_SPEEDS', () => {
    it('should have numeric values for each speed', () => {
      expect(ANIMATION_SPEEDS.SLOW).toBe(8000);
      expect(ANIMATION_SPEEDS.MEDIUM).toBe(4800);
      expect(ANIMATION_SPEEDS.FAST).toBe(2400);
      expect(ANIMATION_SPEEDS.VERY_FAST).toBe(1200);
    });
  });

  describe('ELEMENT_STATES', () => {
    it('should have expected sorting states', () => {
      expect(ELEMENT_STATES).toMatchObject({
        DEFAULT: 'default',
        COMPARING: 'comparing',
        SWAPPING: 'swapping',
        SORTED: 'sorted',
        PIVOT: 'pivot',
        AUXILIARY: 'auxiliary',
      });
    });
  });

  describe('STATE_COLORS', () => {
    it('should map each element state to a hex color', () => {
      const hexPattern = /^#[0-9a-fA-F]{6}$/;
      Object.values(STATE_COLORS).forEach(color => {
        expect(color).toMatch(hexPattern);
      });
      expect(Object.keys(STATE_COLORS)).toHaveLength(6);
    });
  });

  describe('GRID_ELEMENT_STATES', () => {
    it('should have expected grid states', () => {
      expect(GRID_ELEMENT_STATES).toMatchObject({
        DEFAULT: 'default',
        OPEN: 'open',
        CLOSED: 'closed',
        PATH: 'path',
        START: 'start',
        END: 'end',
        WALL: 'wall',
      });
    });
  });

  describe('GRID_STATE_COLORS', () => {
    it('should map each grid state to a hex color', () => {
      const hexPattern = /^#[0-9a-fA-F]{6}$/;
      Object.values(GRID_STATE_COLORS).forEach(color => {
        expect(color).toMatch(hexPattern);
      });
      expect(Object.keys(GRID_STATE_COLORS)).toHaveLength(7);
    });
  });

  describe('VISUALIZATION_MODES', () => {
    it('should have autoplay and manual modes', () => {
      expect(VISUALIZATION_MODES).toEqual({
        AUTOPLAY: 'autoplay',
        MANUAL: 'manual',
      });
    });
  });

  describe('DEFAULT_ARRAY_SIZE', () => {
    it('should be 20', () => {
      expect(DEFAULT_ARRAY_SIZE).toBe(20);
    });
  });

  describe('GRID_SIZES', () => {
    it('should have small, medium, and large presets', () => {
      expect(GRID_SIZES).toEqual({
        SMALL: 15,
        MEDIUM: 25,
        LARGE: 35,
      });
    });
  });

  describe('DEFAULT_GRID_SIZE', () => {
    it('should equal GRID_SIZES.SMALL', () => {
      expect(DEFAULT_GRID_SIZE).toBe(GRID_SIZES.SMALL);
      expect(DEFAULT_GRID_SIZE).toBe(15);
    });
  });

  describe('COMPLEXITY_FUNCTIONS', () => {
    const n = 100;

    it('should have functions that return numbers for valid n', () => {
      Object.entries(COMPLEXITY_FUNCTIONS).forEach(([_key, fn]) => {
        expect(typeof fn).toBe('function');
        const result = fn(n);
        expect(typeof result).toBe('number');
        expect(Number.isNaN(result)).toBe(false);
      });
    });

    it('O(1) should always return 1', () => {
      expect(COMPLEXITY_FUNCTIONS['O(1)'](n)).toBe(1);
      expect(COMPLEXITY_FUNCTIONS['O(1)'](1000)).toBe(1);
    });

    it('O(n) should return n', () => {
      expect(COMPLEXITY_FUNCTIONS['O(n)'](n)).toBe(n);
    });

    it('O(n²) should return n squared', () => {
      expect(COMPLEXITY_FUNCTIONS['O(n²)'](n)).toBe(n * n);
    });

    it('O(log n) should return log2(n)', () => {
      expect(COMPLEXITY_FUNCTIONS['O(log n)'](n)).toBeCloseTo(Math.log2(n), 5);
    });
  });

  describe('ALGORITHM_COMPLEXITY', () => {
    const sortingAlgorithms = Object.keys(ALGORITHM_COMPLEXITY);

    it('should have metadata for all sorting algorithms', () => {
      expect(sortingAlgorithms).toHaveLength(14);
    });

    it('each algorithm should have name, timeComplexity, spaceComplexity', () => {
      sortingAlgorithms.forEach(algoKey => {
        const meta = ALGORITHM_COMPLEXITY[algoKey];
        expect(meta).toHaveProperty('name');
        expect(typeof meta.name).toBe('string');
        expect(meta).toHaveProperty('timeComplexity');
        expect(meta.timeComplexity).toHaveProperty('best');
        expect(meta.timeComplexity).toHaveProperty('average');
        expect(meta.timeComplexity).toHaveProperty('worst');
        expect(meta).toHaveProperty('spaceComplexity');
        expect(typeof meta.spaceComplexity).toBe('string');
      });
    });

    it('selectionSort should have description and useCases', () => {
      const meta = ALGORITHM_COMPLEXITY.selectionSort;
      expect(meta).toHaveProperty('description');
      expect(meta).toHaveProperty('useCases');
      expect(Array.isArray(meta.useCases)).toBe(true);
    });
  });

  describe('PATHFINDING_COMPLEXITY', () => {
    const pathfindingAlgorithms = Object.keys(PATHFINDING_COMPLEXITY);

    it('should have metadata for all pathfinding algorithms', () => {
      expect(pathfindingAlgorithms).toHaveLength(9);
    });

    it('each algorithm should have name, timeComplexity, spaceComplexity, description, useCases', () => {
      pathfindingAlgorithms.forEach(algoKey => {
        const meta = PATHFINDING_COMPLEXITY[algoKey];
        expect(meta).toHaveProperty('name');
        expect(meta).toHaveProperty('timeComplexity');
        expect(meta).toHaveProperty('spaceComplexity');
        expect(meta).toHaveProperty('description');
        expect(meta).toHaveProperty('useCases');
        expect(Array.isArray(meta.useCases)).toBe(true);
      });
    });
  });

  describe('SEARCHING_COMPLEXITY', () => {
    const keys = Object.keys(SEARCHING_COMPLEXITY);

    it('should have metadata for all searching algorithms', () => {
      expect(keys).toEqual([
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
    });

    it('each algorithm should have name, timeComplexity, spaceComplexity, description, useCases', () => {
      keys.forEach(algoKey => {
        const meta = SEARCHING_COMPLEXITY[algoKey];
        expect(meta).toHaveProperty('name');
        expect(meta).toHaveProperty('timeComplexity');
        expect(meta).toHaveProperty('spaceComplexity');
        expect(meta).toHaveProperty('description');
        expect(meta).toHaveProperty('useCases');
        expect(Array.isArray(meta.useCases)).toBe(true);
      });
    });
  });
});
