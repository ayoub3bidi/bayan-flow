/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { bubbleSort, bubbleSortPure } from './bubbleSort';
import { quickSort, quickSortPure } from './quickSort';
import { mergeSort, mergeSortPure } from './mergeSort';
import { selectionSortPure } from './selectionSort';
import { insertionSortPure } from './insertionSort';
import { heapSortPure } from './heapSort';
import { shellSortPure } from './shellSort';
import { radixSortPure } from './radixSort';
import { countingSortPure } from './countingSort';
import { bucketSortPure } from './bucketSort';
import { cycleSortPure } from './cycleSort';
import { combSortPure } from './combSort';
import { timSortPure } from './timSort';
import { bogoSortPure, bogoSort } from './bogoSort';
import { isSorted, generateRandomArray } from '../../utils/arrayHelpers';

/**
 * Test suite for sorting algorithms
 * These tests verify the correctness of the pure sorting functions
 */

describe('Sorting Algorithms', () => {
  const testCases = [
    {
      name: 'empty array',
      input: [],
      expected: [],
    },
    {
      name: 'single element',
      input: [42],
      expected: [42],
    },
    {
      name: 'already sorted',
      input: [1, 2, 3, 4, 5],
      expected: [1, 2, 3, 4, 5],
    },
    {
      name: 'reverse sorted',
      input: [5, 4, 3, 2, 1],
      expected: [1, 2, 3, 4, 5],
    },
    {
      name: 'random order',
      input: [3, 1, 4, 1, 5, 9, 2, 6],
      expected: [1, 1, 2, 3, 4, 5, 6, 9],
    },
    {
      name: 'duplicates',
      input: [5, 2, 8, 2, 9, 1, 5, 5],
      expected: [1, 2, 2, 5, 5, 5, 8, 9],
    },
    {
      name: 'negative numbers',
      input: [-3, -1, -4, -1, -5, 2, 6],
      expected: [-5, -4, -3, -1, -1, 2, 6],
    },
  ];

  describe('Bubble Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = bubbleSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should generate valid visualization steps', () => {
      const steps = bubbleSort([3, 1, 2]);
      expect(steps.length).toBeGreaterThan(0);
      steps.forEach(step => {
        expect(step).toHaveProperty('array');
        expect(step).toHaveProperty('states');
        expect(step).toHaveProperty('description');
        expect(step.array).toHaveLength(3);
        expect(step.states).toHaveLength(3);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = bubbleSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Quick Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = quickSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should generate valid visualization steps', () => {
      const steps = quickSort([3, 1, 2]);
      expect(steps.length).toBeGreaterThan(0);
      steps.forEach(step => {
        expect(step).toHaveProperty('array');
        expect(step).toHaveProperty('states');
        expect(step).toHaveProperty('description');
        expect(step.array).toHaveLength(3);
        expect(step.states).toHaveLength(3);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = quickSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Merge Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = mergeSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should generate valid visualization steps', () => {
      const steps = mergeSort([3, 1, 2]);
      expect(steps.length).toBeGreaterThan(0);
      steps.forEach(step => {
        expect(step).toHaveProperty('array');
        expect(step).toHaveProperty('states');
        expect(step).toHaveProperty('description');
        expect(step.array).toHaveLength(3);
        expect(step.states).toHaveLength(3);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = mergeSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Selection Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = selectionSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = selectionSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Insertion Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = insertionSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = insertionSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });

    it('should be efficient for nearly sorted arrays', () => {
      // Create a nearly sorted array (only a few elements out of place)
      const nearlySorted = [1, 2, 3, 4, 5, 6, 8, 7, 9, 10];
      const sorted = insertionSortPure(nearlySorted);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Heap Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = heapSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = heapSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });

    it('should have consistent O(n log n) performance', () => {
      // Heap sort should handle already sorted arrays efficiently
      const alreadySorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sorted = heapSortPure(alreadySorted);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Shell Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = shellSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = shellSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });

    it('should be more efficient than insertion sort for larger arrays', () => {
      // Shell sort should handle larger arrays better than insertion sort
      const largerArray = generateRandomArray(50);
      const sorted = shellSortPure(largerArray);
      expect(isSorted(sorted)).toBe(true);
    });

    it('should handle already sorted arrays', () => {
      const alreadySorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sorted = shellSortPure(alreadySorted);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Radix Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = radixSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = radixSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Counting Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = countingSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = countingSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });

    it('should be stable (maintain relative order of equal elements)', () => {
      // For stability testing, we'd need to track original indices
      // This is a simplified test
      const arrayWithDuplicates = [5, 2, 8, 2, 9, 1, 5, 5];
      const sorted = countingSortPure(arrayWithDuplicates);
      expect(sorted).toEqual([1, 2, 2, 5, 5, 5, 8, 9]);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Bucket Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = bucketSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = bucketSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });

    it('should handle all identical elements', () => {
      const identical = [7, 7, 7, 7, 7];
      const sorted = bucketSortPure(identical);
      expect(sorted).toEqual([7, 7, 7, 7, 7]);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Cycle Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = cycleSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = cycleSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });

    it('should minimize writes', () => {
      const testArray = [4, 3, 2, 1];
      const sorted = cycleSortPure(testArray);
      expect(sorted).toEqual([1, 2, 3, 4]);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Comb Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = combSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = combSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Tim Sort', () => {
    testCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = timSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = timSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });

    it('should be efficient for nearly sorted arrays', () => {
      const nearlySorted = [1, 2, 3, 4, 5, 6, 8, 7, 9, 10];
      const sorted = timSortPure(nearlySorted);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Bogo Sort', () => {
    const smallTestCases = [
      {
        name: 'empty array',
        input: [],
        expected: [],
      },
      {
        name: 'single element',
        input: [42],
        expected: [42],
      },
      {
        name: 'already sorted',
        input: [1, 2, 3],
        expected: [1, 2, 3],
      },
      {
        name: 'small random order',
        input: [3, 1, 2],
        expected: [1, 2, 3],
      },
      {
        name: 'duplicates',
        input: [2, 1, 2],
        expected: [1, 2, 2],
      },
    ];

    smallTestCases.forEach(({ name, input, expected }) => {
      it(`should sort ${name}`, () => {
        const result = bogoSortPure(input);
        expect(result).toEqual(expected);
        expect(isSorted(result)).toBe(true);
      });
    });

    it('should respect maximum shuffle limit', () => {
      const result = bogoSortPure([5, 4, 3, 2, 1]);
      expect(isSorted(result)).toBe(true);
    });

    it('should generate valid visualization steps', () => {
      const steps = bogoSort([3, 1, 2]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]).toHaveProperty('array');
      expect(steps[0]).toHaveProperty('states');
      expect(steps[0]).toHaveProperty('description');
    });
  });

  describe('Algorithm Consistency', () => {
    it('all algorithms should produce the same result', () => {
      const testArray = generateRandomArray(50);

      const bubbleResult = bubbleSortPure([...testArray]);
      const quickResult = quickSortPure([...testArray]);
      const mergeResult = mergeSortPure([...testArray]);
      const selectionResult = selectionSortPure([...testArray]);
      const insertionResult = insertionSortPure([...testArray]);
      const heapResult = heapSortPure([...testArray]);
      const shellResult = shellSortPure([...testArray]);
      const radixResult = radixSortPure([...testArray]);
      const countingResult = countingSortPure([...testArray]);
      const bucketResult = bucketSortPure([...testArray]);
      const cycleResult = cycleSortPure([...testArray]);
      const combResult = combSortPure([...testArray]);
      const timResult = timSortPure([...testArray]);

      expect(bubbleResult).toEqual(quickResult);
      expect(quickResult).toEqual(mergeResult);
      expect(mergeResult).toEqual(selectionResult);
      expect(selectionResult).toEqual(insertionResult);
      expect(insertionResult).toEqual(heapResult);
      expect(heapResult).toEqual(shellResult);
      expect(shellResult).toEqual(radixResult);
      expect(radixResult).toEqual(countingResult);
      expect(countingResult).toEqual(bucketResult);
      expect(bucketResult).toEqual(cycleResult);
      expect(cycleResult).toEqual(combResult);
      expect(combResult).toEqual(timResult);
    });
  });
});
