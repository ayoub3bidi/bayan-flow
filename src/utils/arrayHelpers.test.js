import { describe, it, expect } from 'vitest';
import {
  generateRandomArray,
  generateNearlySortedArray,
  generateReversedArray,
  isSorted,
  cloneArray,
} from './arrayHelpers';

describe('Array Helper Functions', () => {
  describe('generateRandomArray', () => {
    it('should generate array of correct size', () => {
      const size = 10;
      const arr = generateRandomArray(size);
      expect(arr).toHaveLength(size);
    });

    it('should generate values within specified range', () => {
      const arr = generateRandomArray(100, 10, 50);
      arr.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(50);
      });
    });

    it('should generate different arrays on subsequent calls', () => {
      const arr1 = generateRandomArray(20);
      const arr2 = generateRandomArray(20);
      expect(arr1).not.toEqual(arr2);
    });
  });

  describe('generateNearlySortedArray', () => {
    it('should generate array of correct size', () => {
      const size = 15;
      const arr = generateNearlySortedArray(size);
      expect(arr).toHaveLength(size);
    });

    it('should be nearly sorted (not completely unsorted)', () => {
      const arr = generateNearlySortedArray(20, 2);
      let sortedPairs = 0;
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] <= arr[i + 1]) sortedPairs++;
      }
      // At least 75% of pairs should be in order (more lenient)
      expect(sortedPairs).toBeGreaterThanOrEqual(Math.floor(arr.length * 0.75));
    });
  });

  describe('generateReversedArray', () => {
    it('should generate reversed array of correct size', () => {
      const size = 10;
      const arr = generateReversedArray(size);
      expect(arr).toHaveLength(size);
    });

    it('should be in descending order', () => {
      const arr = generateReversedArray(10);
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]).toBeGreaterThan(arr[i + 1]);
      }
    });
  });

  describe('isSorted', () => {
    it('should return true for sorted array', () => {
      expect(isSorted([1, 2, 3, 4, 5])).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isSorted([])).toBe(true);
    });

    it('should return true for single element', () => {
      expect(isSorted([42])).toBe(true);
    });

    it('should return false for unsorted array', () => {
      expect(isSorted([3, 1, 4, 1, 5])).toBe(false);
    });

    it('should return true for array with duplicates in order', () => {
      expect(isSorted([1, 2, 2, 3, 3, 4])).toBe(true);
    });

    it('should handle negative numbers', () => {
      expect(isSorted([-5, -3, -1, 0, 2, 4])).toBe(true);
      expect(isSorted([-1, -5, 0, 2])).toBe(false);
    });
  });

  describe('cloneArray', () => {
    it('should create a deep copy of array', () => {
      const original = [1, 2, 3, 4, 5];
      const clone = cloneArray(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });

    it('should create independent copy', () => {
      const original = [1, 2, 3];
      const clone = cloneArray(original);

      clone[0] = 99;
      expect(original[0]).toBe(1);
      expect(clone[0]).toBe(99);
    });

    it('should handle nested arrays', () => {
      const original = [
        [1, 2],
        [3, 4],
      ];
      const clone = cloneArray(original);

      clone[0][0] = 99;
      expect(original[0][0]).toBe(1);
      expect(clone[0][0]).toBe(99);
    });
  });
});
