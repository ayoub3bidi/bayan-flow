/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { heuristic, calculateKey, compareKeys } from './dStarLiteHelpers';

describe('D* Lite Helpers', () => {
  describe('heuristic', () => {
    it('should calculate Manhattan distance correctly', () => {
      const a = { row: 0, col: 0 };
      const b = { row: 3, col: 4 };
      expect(heuristic(a, b)).toBe(7);
    });

    it('should be 0 for same point', () => {
      const a = { row: 2, col: 2 };
      expect(heuristic(a, a)).toBe(0);
    });
  });

  describe('compareKeys', () => {
    it('should compare based on first component', () => {
      expect(compareKeys([1, 10], [2, 1])).toBe(true);
      expect(compareKeys([2, 1], [1, 10])).toBe(false);
    });

    it('should use second component if first is equal', () => {
      expect(compareKeys([1, 5], [1, 6])).toBe(true);
      expect(compareKeys([1, 6], [1, 5])).toBe(false);
    });

    it('should return false if equal', () => {
      expect(compareKeys([1, 5], [1, 5])).toBe(false);
    });
  });

  describe('calculateKey', () => {
    it('should calculate key correctly', () => {
      const node = { row: 1, col: 1 };
      const start = { row: 0, col: 0 };
      const km = 0;

      // min(inf, 10) = 10
      // h(0,0 -> 1,1) = 2
      // k1 = 10 + 2 + 0 = 12
      // k2 = 10

      // Mocking 2D arrays access
      const mockG = Array(2)
        .fill()
        .map(() => Array(2).fill(Infinity));
      const mockRhs = Array(2)
        .fill()
        .map(() => Array(2).fill(Infinity));

      mockG[1][1] = Infinity;
      mockRhs[1][1] = 10;

      const key = calculateKey(node, start, mockG, mockRhs, km);
      expect(key).toEqual([12, 10]);
    });
  });
});
