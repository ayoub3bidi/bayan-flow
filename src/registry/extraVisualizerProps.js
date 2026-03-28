/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ALGORITHM_TYPES } from '../constants';

/**
 * Props passed to the active visualizer beyond the shared playback contract.
 * Keep category-specific wiring in one place when adding new visualizer types.
 *
 * @param {string} algorithmType
 * @param {{
 *   sortingVisualization: { array: unknown },
 *   searchingVisualization: { array: unknown, targetValue: unknown },
 *   gridSize: number,
 * }} ctx
 */
export function getExtraVisualizerProps(
  algorithmType,
  { sortingVisualization, searchingVisualization, gridSize }
) {
  if (algorithmType === ALGORITHM_TYPES.SORTING) {
    return { array: sortingVisualization.array, complexityDataset: 'sorting' };
  }
  if (algorithmType === ALGORITHM_TYPES.SEARCHING) {
    return {
      array: searchingVisualization.array,
      targetValue: searchingVisualization.targetValue,
      visualizerVariant: 'searching',
      complexityDataset: 'searching',
    };
  }
  if (algorithmType === ALGORITHM_TYPES.PATHFINDING) {
    return { gridSize, complexityDataset: 'pathfinding' };
  }
  return {};
}
