import { describe, it, expect } from 'vitest';
import { bubbleSortPure } from './bubbleSort';
import { quickSortPure } from './quickSort';
import { mergeSortPure } from './mergeSort';
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

    it('should handle large random arrays', () => {
      const largeArray = generateRandomArray(100);
      const sorted = mergeSortPure(largeArray);
      expect(isSorted(sorted)).toBe(true);
    });
  });

  describe('Algorithm Consistency', () => {
    it('all algorithms should produce the same result', () => {
      const testArray = generateRandomArray(50);

      const bubbleResult = bubbleSortPure([...testArray]);
      const quickResult = quickSortPure([...testArray]);
      const mergeResult = mergeSortPure([...testArray]);

      expect(bubbleResult).toEqual(quickResult);
      expect(quickResult).toEqual(mergeResult);
    });
  });
});
