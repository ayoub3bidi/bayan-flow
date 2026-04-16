/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { getExtraVisualizerProps } from './extraVisualizerProps';
import { ALGORITHM_TYPES } from '../constants';

describe('getExtraVisualizerProps', () => {
  const sortingVisualization = { array: [3, 1, 2] };
  const searchingVisualization = { array: [1, 2, 3], targetValue: 2 };
  const ctxBase = {
    sortingVisualization,
    searchingVisualization,
    gridSize: 25,
  };

  it('returns array prop for sorting category', () => {
    expect(
      getExtraVisualizerProps(ALGORITHM_TYPES.SORTING, {
        ...ctxBase,
        activeAlgorithmKey: 'bubbleSort',
      })
    ).toEqual({
      array: [3, 1, 2],
      complexityDataset: 'sorting',
    });
  });

  it('returns array, target, variant, and dataset for array searching category', () => {
    expect(
      getExtraVisualizerProps(ALGORITHM_TYPES.SEARCHING, {
        ...ctxBase,
        activeAlgorithmKey: 'binarySearch',
      })
    ).toEqual({
      array: [1, 2, 3],
      targetValue: 2,
      visualizerVariant: 'searching',
      complexityDataset: 'searching',
    });
  });

  it('returns graph props for node–link searching (DFS)', () => {
    const graphCtx = {
      ...ctxBase,
      searchingVisualization: {
        graphNodes: [{ id: '0', x: 0, y: 0 }],
        graphEdges: [],
        graphNodeStates: { 0: 'root' },
        graphStackOrder: [],
      },
      activeAlgorithmKey: 'depthFirstSearch',
    };
    expect(
      getExtraVisualizerProps(ALGORITHM_TYPES.SEARCHING, graphCtx)
    ).toEqual({
      graphNodes: [{ id: '0', x: 0, y: 0 }],
      graphEdges: [],
      graphNodeStates: { 0: 'root' },
      graphStackOrder: [],
      complexityDataset: 'searching',
    });
  });

  it('returns gridSize for pathfinding category', () => {
    expect(
      getExtraVisualizerProps(ALGORITHM_TYPES.PATHFINDING, {
        ...ctxBase,
        activeAlgorithmKey: 'bfs',
      })
    ).toEqual({
      gridSize: 25,
      complexityDataset: 'pathfinding',
    });
  });

  it('returns empty object for unknown algorithm type', () => {
    expect(
      getExtraVisualizerProps('unknown_category', {
        ...ctxBase,
        activeAlgorithmKey: 'unknown',
      })
    ).toEqual({});
  });
});
