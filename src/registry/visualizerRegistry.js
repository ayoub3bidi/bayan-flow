/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import ArrayVisualizer from '../components/ArrayVisualizer';
import GridVisualizer from '../components/GridVisualizer';
import SearchingCategoryVisualizer from '../components/SearchingCategoryVisualizer';
import { ALGORITHM_TYPES } from '../constants';

/**
 * Maps every algorithm category to the React component that renders it.
 *
 * Adding a new category:
 *   1. Import the visualizer component.
 *   2. Add one line: `[ALGORITHM_TYPES.NEW_CATEGORY]: NewVisualizer`
 *   3. Also add CATEGORY_CONFIG, hook wiring in VisualizerApp, useCategoryVisualizations,
 *      getExtraVisualizerProps, and video registries — see categoryConfig.js checklist.
 */
export const VISUALIZER_REGISTRY = {
  [ALGORITHM_TYPES.SORTING]: ArrayVisualizer,
  [ALGORITHM_TYPES.PATHFINDING]: GridVisualizer,
  [ALGORITHM_TYPES.SEARCHING]: SearchingCategoryVisualizer,
};
