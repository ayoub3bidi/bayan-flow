/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import SortingScene from './SortingScene.jsx';
import GraphSearchingScene from './GraphSearchingScene.jsx';

function isNodeLinkSearchingStepShape(step) {
  return (
    step &&
    Array.isArray(step.nodes) &&
    step.nodes.length > 0 &&
    Array.isArray(step.edges) &&
    step.nodeStates != null &&
    typeof step.nodeStates === 'object'
  );
}

/**
 * Searching category exports bar steps (array search) or graph steps (node–link DFS).
 * Routes to the correct Remotion scene without splitting the category in export props.
 *
 * @param {{ steps: Array, framesPerStep: number, gridSize?: number, exportTheme?: string }} props
 */
export default function SearchingVideoScene({
  steps,
  framesPerStep,
  gridSize: _gridSize = 15,
  exportTheme = 'dark',
}) {
  const first = steps[0];
  if (isNodeLinkSearchingStepShape(first)) {
    return (
      <GraphSearchingScene
        steps={steps}
        framesPerStep={framesPerStep}
        exportTheme={exportTheme}
      />
    );
  }
  return <SortingScene steps={steps} framesPerStep={framesPerStep} />;
}
