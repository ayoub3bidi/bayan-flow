/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  sortingAlgorithms,
  pureSortingAlgorithms,
  bubbleSort,
  bubbleSortPure,
  quickSort,
  quickSortPure,
} from './index.js';

const SORTING_ALGORITHM_KEYS = [
  'bubbleSort',
  'quickSort',
  'mergeSort',
  'selectionSort',
  'insertionSort',
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

describe('sorting index', () => {
  describe('sortingAlgorithms object', () => {
    it('should export sortingAlgorithms object with all 14 algorithms', () => {
      expect(Object.keys(sortingAlgorithms)).toHaveLength(14);
      SORTING_ALGORITHM_KEYS.forEach(key => {
        expect(sortingAlgorithms[key]).toBeDefined();
        expect(typeof sortingAlgorithms[key]).toBe('function');
      });
    });
  });

  describe('pureSortingAlgorithms object', () => {
    it('should export pureSortingAlgorithms object with all 14 pure versions', () => {
      expect(Object.keys(pureSortingAlgorithms)).toHaveLength(14);
      SORTING_ALGORITHM_KEYS.forEach(key => {
        expect(pureSortingAlgorithms[key]).toBeDefined();
        expect(typeof pureSortingAlgorithms[key]).toBe('function');
      });
    });
  });

  describe('named exports', () => {
    it('should export algorithm functions', () => {
      expect(typeof bubbleSort).toBe('function');
      expect(typeof bubbleSortPure).toBe('function');
      expect(typeof quickSort).toBe('function');
      expect(typeof quickSortPure).toBe('function');
    });

    it('objects should reference same functions as named exports', () => {
      expect(sortingAlgorithms.bubbleSort).toBe(bubbleSort);
      expect(pureSortingAlgorithms.bubbleSort).toBe(bubbleSortPure);
    });
  });
});
