/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { getExtraVisualizerProps } from './extraVisualizerProps';
import { ALGORITHM_TYPES } from '../constants';

describe('getExtraVisualizerProps', () => {
  const sortingVisualization = { array: [3, 1, 2] };
  const searchingVisualization = { array: [1, 2, 3], targetValue: 2 };
  const ctx = { sortingVisualization, searchingVisualization, gridSize: 25 };

  it('returns array prop for sorting category', () => {
    expect(getExtraVisualizerProps(ALGORITHM_TYPES.SORTING, ctx)).toEqual({
      array: [3, 1, 2],
      complexityDataset: 'sorting',
    });
  });

  it('returns array, target, variant, and dataset for searching category', () => {
    expect(getExtraVisualizerProps(ALGORITHM_TYPES.SEARCHING, ctx)).toEqual({
      array: [1, 2, 3],
      targetValue: 2,
      visualizerVariant: 'searching',
      complexityDataset: 'searching',
    });
  });

  it('returns gridSize for pathfinding category', () => {
    expect(getExtraVisualizerProps(ALGORITHM_TYPES.PATHFINDING, ctx)).toEqual({
      gridSize: 25,
      complexityDataset: 'pathfinding',
    });
  });

  it('returns empty object for unknown algorithm type', () => {
    expect(getExtraVisualizerProps('unknown_category', ctx)).toEqual({});
  });
});
