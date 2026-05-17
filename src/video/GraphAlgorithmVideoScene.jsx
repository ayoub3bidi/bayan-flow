/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import GraphAlgorithmScene from './GraphAlgorithmScene.jsx';
import GraphAlgorithmMatrixScene from './GraphAlgorithmMatrixScene.jsx';
import {
  getGraphAlgorithmRepresentation,
  GRAPH_REPRESENTATIONS,
} from '../registry/graphAlgorithmRegistry.js';

function GraphAlgorithmVideoScene({
  steps,
  framesPerStep,
  exportTheme,
  algorithmKey,
}) {
  const representation =
    steps?.[0]?.representation ?? getGraphAlgorithmRepresentation(algorithmKey);

  if (representation === GRAPH_REPRESENTATIONS.MATRIX) {
    return (
      <GraphAlgorithmMatrixScene
        steps={steps}
        framesPerStep={framesPerStep}
      />
    );
  }

  return (
    <GraphAlgorithmScene
      steps={steps}
      framesPerStep={framesPerStep}
      exportTheme={exportTheme}
    />
  );
}

export default GraphAlgorithmVideoScene;
