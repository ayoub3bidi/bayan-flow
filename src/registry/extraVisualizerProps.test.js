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
  const treeTraversalVisualization = {
    treeNodes: [{ id: '0', x: 0.5, y: 0.5, label: '1' }],
    treeEdges: [],
    treeNodeStates: {},
    visitOrder: [],
    queueOrder: [],
  };

  const ctxBase = {
    sortingVisualization,
    searchingVisualization,
    treeTraversalVisualization,
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

  it('returns tree props for tree traversal category', () => {
    expect(
      getExtraVisualizerProps(ALGORITHM_TYPES.TREE_TRAVERSAL, {
        ...ctxBase,
        activeAlgorithmKey: 'inorderTraversal',
      })
    ).toEqual({
      nodes: [{ id: '0', x: 0.5, y: 0.5, label: '1' }],
      edges: [],
      nodeStates: {},
      visitOrder: [],
      queueOrder: [],
      levelScanDirection: undefined,
      complexityDataset: 'treeTraversal',
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
