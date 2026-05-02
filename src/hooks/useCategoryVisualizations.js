/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useMemo } from 'react';
import { ALGORITHM_TYPES } from '../constants';

/**
 * Maps each algorithm category to its visualization controller result.
 * Every category hook must be invoked unconditionally at the call site (Rules of Hooks);
 * this helper only merges their return values into a lookup table.
 *
 * When adding a category: (1) call its hook in VisualizerApp (or parent), (2) pass the result
 * into this hook’s parameters, (3) add `[ALGORITHM_TYPES.NEWTYPE]: thatHookResult` below
 * (see SEARCHING for a full example).
 */
export function useCategoryVisualizations({
  sortingVisualization,
  pathfindingVisualization,
  searchingVisualization,
  treeTraversalVisualization,
}) {
  return useMemo(
    () => ({
      [ALGORITHM_TYPES.SORTING]: sortingVisualization,
      [ALGORITHM_TYPES.PATHFINDING]: pathfindingVisualization,
      [ALGORITHM_TYPES.SEARCHING]: searchingVisualization,
      [ALGORITHM_TYPES.TREE_TRAVERSAL]: treeTraversalVisualization,
    }),
    [
      sortingVisualization,
      pathfindingVisualization,
      searchingVisualization,
      treeTraversalVisualization,
    ]
  );
}
