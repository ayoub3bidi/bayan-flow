/**
 * Copyright (c) 2025 Ayoub Abidi
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
 * When adding a category: call its hook in the parent component, then add one entry here.
 */
export function useCategoryVisualizations({
  sortingVisualization,
  pathfindingVisualization,
}) {
  return useMemo(
    () => ({
      [ALGORITHM_TYPES.SORTING]: sortingVisualization,
      [ALGORITHM_TYPES.PATHFINDING]: pathfindingVisualization,
    }),
    [sortingVisualization, pathfindingVisualization]
  );
}
