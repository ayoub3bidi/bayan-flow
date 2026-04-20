/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ALGORITHM_TYPES } from '../constants';
import SortingScene from '../video/SortingScene.jsx';
import PathfindingScene from '../video/PathfindingScene.jsx';
import SearchingVideoScene from '../video/SearchingVideoScene.jsx';
import TreeTraversalScene from '../video/TreeTraversalScene.jsx';

/**
 * Remotion main-scene renderers. Add an entry when a new category exports video.
 * Each renderer receives unified props from AlgorithmVideo.
 */
export const VIDEO_SCENE_RENDERERS = {
  [ALGORITHM_TYPES.SORTING]: ({ steps, framesPerStep }) => (
    <SortingScene steps={steps} framesPerStep={framesPerStep} />
  ),
  [ALGORITHM_TYPES.SEARCHING]: ({
    steps,
    framesPerStep,
    gridSize,
    exportTheme,
  }) => (
    <SearchingVideoScene
      steps={steps}
      framesPerStep={framesPerStep}
      gridSize={gridSize}
      exportTheme={exportTheme}
    />
  ),
  [ALGORITHM_TYPES.PATHFINDING]: ({ steps, framesPerStep, gridSize }) => (
    <PathfindingScene
      steps={steps}
      framesPerStep={framesPerStep}
      gridSize={gridSize}
    />
  ),
  [ALGORITHM_TYPES.TREE_TRAVERSAL]: ({
    steps,
    framesPerStep,
    exportTheme,
  }) => (
    <TreeTraversalScene
      steps={steps}
      framesPerStep={framesPerStep}
      exportTheme={exportTheme}
    />
  ),
};

/** Fallback title when algorithmName is empty (Remotion bundle has no i18n). */
export const VIDEO_TITLE_FALLBACK = {
  [ALGORITHM_TYPES.SORTING]: 'Sorting',
  [ALGORITHM_TYPES.PATHFINDING]: 'Pathfinding',
  [ALGORITHM_TYPES.SEARCHING]: 'Searching',
  [ALGORITHM_TYPES.TREE_TRAVERSAL]: 'Tree Traversals',
};
