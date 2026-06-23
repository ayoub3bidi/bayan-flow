/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import ArrayVisualizer from './ArrayVisualizer';
import GraphVisualizer from './GraphVisualizer';
import {
  getSearchingSubstrate,
  SEARCHING_SUBSTRATES,
} from '../registry/searchingSubstrate';

/**
 * Routes the Searching category to ArrayVisualizer (sorted-array search) or
 * GraphVisualizer (explicit node–link graph), based on algorithm key.
 */
function SearchingCategoryVisualizer({
  algorithm,
  array,
  states,
  targetValue = null,
  visualizerVariant = 'searching',
  complexityDataset = 'searching',
  graphNodes,
  graphEdges,
  graphNodeStates,
  graphStackOrder,
  activeEdge,
  description,
  isComplete,
  onStepForward,
  onStepBackward,
  mode,
}) {
  if (getSearchingSubstrate(algorithm) === SEARCHING_SUBSTRATES.NODE_LINK) {
    return (
      <GraphVisualizer
        nodes={graphNodes}
        edges={graphEdges}
        nodeStates={graphNodeStates}
        stackOrder={graphStackOrder}
        activeEdge={activeEdge}
        description={description}
        isComplete={isComplete}
        algorithm={algorithm}
        onStepForward={onStepForward}
        onStepBackward={onStepBackward}
        mode={mode}
        complexityDataset={complexityDataset}
      />
    );
  }

  return (
    <ArrayVisualizer
      array={array}
      states={states}
      description={description}
      isComplete={isComplete}
      algorithm={algorithm}
      onStepForward={onStepForward}
      onStepBackward={onStepBackward}
      mode={mode}
      targetValue={targetValue}
      visualizerVariant={visualizerVariant}
      complexityDataset={complexityDataset}
    />
  );
}

export default SearchingCategoryVisualizer;
