/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { dStarLite, dStarLitePure } from './dStarLite';
import { createEmptyGrid } from '../../utils/gridHelpers';
import { GRID_ELEMENT_STATES, GRID_SIZES } from '../../constants';

function startEndPairs(n) {
  const pairs = [];
  for (let sr = 0; sr < n; sr += 4) {
    for (let sc = 0; sc < n; sc += 4) {
      for (const end of [
        { row: n - 1, col: n - 2 },
        { row: Math.floor(n / 2), col: 2 },
      ]) {
        if (sr !== end.row || sc !== end.col) {
          pairs.push([{ row: sr, col: sc }, end]);
        }
      }
    }
  }
  return pairs;
}

describe('D* Lite termination on empty grids', () => {
  Object.values(GRID_SIZES).forEach(n => {
    it(`finds an optimal path for every start/end pair on ${n}x${n}`, () => {
      for (const [start, end] of startEndPairs(n)) {
        const optimal =
          Math.abs(start.row - end.row) + Math.abs(start.col - end.col) + 1;

        expect(dStarLitePure(start, end, n, n)?.length).toBe(optimal);

        const steps = dStarLite(createEmptyGrid(n, n), start, end, n, n);
        const pathCells = steps
          .at(-1)
          .states.flat()
          .filter(s => s === GRID_ELEMENT_STATES.PATH).length;
        // PATH cells exclude start and end.
        expect(pathCells + 2).toBe(optimal);
      }
    });
  });
});
