/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCategoryVisualizations } from './useCategoryVisualizations';
import { ALGORITHM_TYPES } from '../constants';

describe('useCategoryVisualizations', () => {
  it('maps every ALGORITHM_TYPES value to a visualization controller', () => {
    const sorting = { id: 'sort' };
    const pathfinding = { id: 'path' };
    const searching = { id: 'search' };
    const treeTraversal = { id: 'tree' };
    const graphAlgorithm = { id: 'graph' };

    const { result } = renderHook(() =>
      useCategoryVisualizations({
        sortingVisualization: sorting,
        pathfindingVisualization: pathfinding,
        searchingVisualization: searching,
        treeTraversalVisualization: treeTraversal,
        graphAlgorithmVisualization: graphAlgorithm,
      })
    );

    const keys = Object.keys(result.current).sort();
    const expected = Object.values(ALGORITHM_TYPES).sort();
    expect(keys).toEqual(expected);
    expect(result.current[ALGORITHM_TYPES.SORTING]).toBe(sorting);
    expect(result.current[ALGORITHM_TYPES.PATHFINDING]).toBe(pathfinding);
    expect(result.current[ALGORITHM_TYPES.SEARCHING]).toBe(searching);
    expect(result.current[ALGORITHM_TYPES.TREE_TRAVERSAL]).toBe(treeTraversal);
    expect(result.current[ALGORITHM_TYPES.GRAPH_ALGORITHM]).toBe(
      graphAlgorithm
    );
  });
});
