/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import {
  ALGORITHM_COMPLEXITY,
  GRAPH_ALGORITHM_COMPLEXITY,
  PATHFINDING_COMPLEXITY,
  SEARCHING_COMPLEXITY,
  TREE_TRAVERSAL_COMPLEXITY,
} from '../constants';

/**
 * Maps CATEGORY_CONFIG.complexityDataset keys to the static complexity metadata
 * objects used by ComplexityScene (Remotion) and related UI.
 */
export const COMPLEXITY_DATASETS = {
  sorting: ALGORITHM_COMPLEXITY,
  pathfinding: PATHFINDING_COMPLEXITY,
  searching: SEARCHING_COMPLEXITY,
  treeTraversal: TREE_TRAVERSAL_COMPLEXITY,
  graphAlgorithm: GRAPH_ALGORITHM_COMPLEXITY,
};

export const DEFAULT_COMPLEXITY_DATASET = 'sorting';
