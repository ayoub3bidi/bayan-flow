/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  algorithms,
  pureAlgorithms,
  bubbleSort,
  bubbleSortPure,
  quickSort,
  quickSortPure,
  mergeSort,
  mergeSortPure,
  selectionSort,
  selectionSortPure,
  insertionSort,
  insertionSortPure,
  heapSort,
  heapSortPure,
  shellSort,
  shellSortPure,
  radixSort,
  radixSortPure,
  countingSort,
  countingSortPure,
  bucketSort,
  bucketSortPure,
  cycleSort,
  cycleSortPure,
  combSort,
  combSortPure,
  timSort,
  timSortPure,
  bogoSort,
  bogoSortPure,
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

describe('algorithms index', () => {
  describe('algorithms object', () => {
    it('should export algorithms object with all 14 sorting algorithms', () => {
      expect(Object.keys(algorithms)).toHaveLength(14);
      SORTING_ALGORITHM_KEYS.forEach(key => {
        expect(algorithms[key]).toBeDefined();
        expect(typeof algorithms[key]).toBe('function');
      });
    });

    it('algorithms.bubbleSort should be a function', () => {
      expect(typeof algorithms.bubbleSort).toBe('function');
    });
  });

  describe('pureAlgorithms object', () => {
    it('should export pureAlgorithms object with all 14 pure versions', () => {
      expect(Object.keys(pureAlgorithms)).toHaveLength(14);
      SORTING_ALGORITHM_KEYS.forEach(key => {
        expect(pureAlgorithms[key]).toBeDefined();
        expect(typeof pureAlgorithms[key]).toBe('function');
      });
    });

    it('pureAlgorithms.bubbleSort should be a function', () => {
      expect(typeof pureAlgorithms.bubbleSort).toBe('function');
    });
  });

  describe('named exports', () => {
    it('should export all sorting algorithm functions', () => {
      expect(typeof bubbleSort).toBe('function');
      expect(typeof bubbleSortPure).toBe('function');
      expect(typeof quickSort).toBe('function');
      expect(typeof quickSortPure).toBe('function');
      expect(typeof mergeSort).toBe('function');
      expect(typeof mergeSortPure).toBe('function');
      expect(typeof selectionSort).toBe('function');
      expect(typeof selectionSortPure).toBe('function');
      expect(typeof insertionSort).toBe('function');
      expect(typeof insertionSortPure).toBe('function');
      expect(typeof heapSort).toBe('function');
      expect(typeof heapSortPure).toBe('function');
      expect(typeof shellSort).toBe('function');
      expect(typeof shellSortPure).toBe('function');
      expect(typeof radixSort).toBe('function');
      expect(typeof radixSortPure).toBe('function');
      expect(typeof countingSort).toBe('function');
      expect(typeof countingSortPure).toBe('function');
      expect(typeof bucketSort).toBe('function');
      expect(typeof bucketSortPure).toBe('function');
      expect(typeof cycleSort).toBe('function');
      expect(typeof cycleSortPure).toBe('function');
      expect(typeof combSort).toBe('function');
      expect(typeof combSortPure).toBe('function');
      expect(typeof timSort).toBe('function');
      expect(typeof timSortPure).toBe('function');
      expect(typeof bogoSort).toBe('function');
      expect(typeof bogoSortPure).toBe('function');
    });

    it('algorithms and pureAlgorithms should reference same functions as named exports', () => {
      expect(algorithms.bubbleSort).toBe(bubbleSort);
      expect(pureAlgorithms.bubbleSort).toBe(bubbleSortPure);
    });
  });
});
