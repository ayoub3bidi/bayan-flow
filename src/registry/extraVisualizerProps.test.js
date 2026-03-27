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
  const ctx = { sortingVisualization, gridSize: 25 };

  it('returns array prop for sorting category', () => {
    expect(getExtraVisualizerProps(ALGORITHM_TYPES.SORTING, ctx)).toEqual({
      array: [3, 1, 2],
    });
  });

  it('returns gridSize for pathfinding category', () => {
    expect(getExtraVisualizerProps(ALGORITHM_TYPES.PATHFINDING, ctx)).toEqual({
      gridSize: 25,
    });
  });

  it('returns empty object for unknown algorithm type', () => {
    expect(getExtraVisualizerProps('unknown_category', ctx)).toEqual({});
  });
});
