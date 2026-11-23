/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { matchPositions, withElementIds } from './elementIds';
import { sortingAlgorithms } from '../algorithms/sorting';

const isPermutation = (arr, n) =>
  arr.length === n && [...arr].sort((a, b) => a - b).every((v, i) => v === i);

describe('matchPositions', () => {
  it('maps unchanged slots to themselves', () => {
    expect(matchPositions([1, 2, 3], [1, 2, 3])).toEqual([0, 1, 2]);
  });

  it('detects an adjacent swap', () => {
    expect(matchPositions([4, 9, 1], [9, 4, 1])).toEqual([1, 0, 2]);
  });

  it('detects a long-distance swap', () => {
    expect(matchPositions([7, 2, 3, 1], [1, 2, 3, 7])).toEqual([3, 1, 2, 0]);
  });

  it('matches duplicates deterministically to the nearest source', () => {
    // Slots 0 and 2 both receive a 5; each takes the nearest 5 that left.
    expect(matchPositions([5, 8, 9, 5], [9, 8, 5, 5])).toEqual([2, 1, 0, 3]);
  });

  it('stays a permutation when values are overwritten', () => {
    const from = matchPositions([5, 9, 7], [9, 7, 7]);
    expect(isPermutation(from, 3)).toBe(true);
    expect(from[0]).toBe(1); // the 9 moved left
    expect(from[2]).toBe(2); // unchanged slot keeps its element
  });

  it('falls back to identity when lengths differ', () => {
    expect(matchPositions([1, 2], [1, 2, 3])).toEqual([0, 1, 2]);
    expect(matchPositions(null, [3, 4])).toEqual([0, 1]);
  });
});

describe('withElementIds', () => {
  it('starts at identity and follows swapped elements', () => {
    const steps = withElementIds([
      { array: [3, 1, 2] },
      { array: [1, 3, 2] },
      { array: [1, 2, 3] },
    ]);
    expect(steps.map(s => s.ids)).toEqual([
      [0, 1, 2],
      [1, 0, 2],
      [1, 2, 0],
    ]);
  });

  it('does not mutate the input steps', () => {
    const input = [{ array: [2, 1] }, { array: [1, 2] }];
    withElementIds(input);
    expect(input[0]).not.toHaveProperty('ids');
  });

  const input = [42, 7, 300, 7, 150, 88, 499, 12, 260, 33, 150, 5];

  it.each(Object.entries(sortingAlgorithms))(
    '%s: every step has a permutation of ids, and reorder steps keep id→value',
    (name, fn) => {
      const steps = withElementIds(fn([...input]));
      const n = input.length;
      steps.forEach((step, k) => {
        expect(isPermutation(step.ids, n)).toBe(true);
        if (k === 0) return;
        const prev = steps[k - 1];
        const sameMultiset =
          [...prev.array].sort((a, b) => a - b).join() ===
          [...step.array].sort((a, b) => a - b).join();
        if (!sameMultiset) return;
        const valueById = new Map(prev.ids.map((id, i) => [id, prev.array[i]]));
        step.ids.forEach((id, i) => {
          expect(valueById.get(id)).toBe(step.array[i]);
        });
      });
    }
  );
});
