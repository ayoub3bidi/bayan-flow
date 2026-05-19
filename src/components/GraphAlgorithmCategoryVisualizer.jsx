/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import GraphVisualizer from './GraphVisualizer';
import GraphAlgorithmMatrixVisualizer from './GraphAlgorithmMatrixVisualizer';
import { GRAPH_REPRESENTATIONS } from '../registry/graphAlgorithmRegistry.js';

function GraphAlgorithmCategoryVisualizer({
  representation = GRAPH_REPRESENTATIONS.NODE_LINK,
  matrix = null,
  nodes = [],
  edges = [],
  nodeStates = {},
  edgeStates = {},
  stackOrder = [],
  outputOrder = [],
  graphArtifacts = {},
  description,
  isComplete,
  algorithm,
  onStepForward,
  onStepBackward,
  mode,
  directed = false,
  weighted = false,
  complexityDataset = 'graphAlgorithm',
}) {
  if (representation === GRAPH_REPRESENTATIONS.MATRIX) {
    return (
      <GraphAlgorithmMatrixVisualizer
        matrix={matrix}
        graphArtifacts={graphArtifacts}
        description={description}
        isComplete={isComplete}
        algorithm={algorithm}
        complexityDataset={complexityDataset}
      />
    );
  }

  return (
    <GraphVisualizer
      nodes={nodes}
      edges={edges}
      nodeStates={nodeStates}
      edgeStates={edgeStates}
      stackOrder={stackOrder}
      outputOrder={outputOrder}
      graphArtifacts={graphArtifacts}
      description={description}
      isComplete={isComplete}
      algorithm={algorithm}
      onStepForward={onStepForward}
      onStepBackward={onStepBackward}
      mode={mode}
      directed={directed}
      weighted={weighted}
      graphVariant="graphAlgorithm"
      complexityDataset={complexityDataset}
    />
  );
}

export default GraphAlgorithmCategoryVisualizer;
