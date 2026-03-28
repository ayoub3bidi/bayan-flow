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
 * @param {{ sortingVisualization: { array: unknown }, gridSize: number }} ctx
 */
export function getExtraVisualizerProps(
  algorithmType,
  { sortingVisualization, gridSize }
) {
  if (algorithmType === ALGORITHM_TYPES.SORTING) {
    return { array: sortingVisualization.array };
  }
  if (algorithmType === ALGORITHM_TYPES.PATHFINDING) {
    return { gridSize };
  }
  return {};
}
