/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { ALGORITHM_TYPES } from '../constants';
import { isNodeLinkSearchingAlgorithm } from './searchingSubstrate';

/**
 * Props passed to the active visualizer beyond the shared playback contract.
 * Keep category-specific wiring in one place when adding new visualizer types.
 *
 * @param {string} algorithmType
 * @param {{
 *   sortingVisualization: { array: unknown },
 *   searchingVisualization: Record<string, unknown>,
 *   treeTraversalVisualization: Record<string, unknown>,
 *   graphAlgorithmVisualization: Record<string, unknown>,
 *   gridSize: number,
 *   activeAlgorithmKey: string,
 * }} ctx
 */
export function getExtraVisualizerProps(
  algorithmType,
  {
    sortingVisualization,
    searchingVisualization,
    treeTraversalVisualization,
    graphAlgorithmVisualization,
    gridSize,
    activeAlgorithmKey,
  }
) {
  if (algorithmType === ALGORITHM_TYPES.SORTING) {
    return { array: sortingVisualization.array, complexityDataset: 'sorting' };
  }
  if (algorithmType === ALGORITHM_TYPES.SEARCHING) {
    if (isNodeLinkSearchingAlgorithm(activeAlgorithmKey)) {
      return {
        graphNodes: searchingVisualization.graphNodes,
        graphEdges: searchingVisualization.graphEdges,
        graphNodeStates: searchingVisualization.graphNodeStates,
        graphStackOrder: searchingVisualization.graphStackOrder,
        complexityDataset: 'searching',
      };
    }
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
  if (algorithmType === ALGORITHM_TYPES.TREE_TRAVERSAL) {
    return {
      nodes: treeTraversalVisualization.treeNodes,
      edges: treeTraversalVisualization.treeEdges,
      nodeStates: treeTraversalVisualization.treeNodeStates,
      visitOrder: treeTraversalVisualization.visitOrder,
      queueOrder: treeTraversalVisualization.queueOrder,
      levelScanDirection: treeTraversalVisualization.treeLevelScanDirection,
      complexityDataset: 'treeTraversal',
    };
  }
  if (algorithmType === ALGORITHM_TYPES.GRAPH_ALGORITHM) {
    return {
      nodes: graphAlgorithmVisualization.graphNodes,
      edges: graphAlgorithmVisualization.graphEdges,
      nodeStates: graphAlgorithmVisualization.graphNodeStates,
      edgeStates: graphAlgorithmVisualization.graphEdgeStates,
      stackOrder: graphAlgorithmVisualization.graphStackOrder,
      outputOrder: graphAlgorithmVisualization.graphOutputOrder,
      graphArtifacts: graphAlgorithmVisualization.graphArtifacts,
      matrix: graphAlgorithmVisualization.graphMatrix,
      representation: graphAlgorithmVisualization.representation,
      directed: graphAlgorithmVisualization.directed,
      weighted: graphAlgorithmVisualization.weighted,
      complexityDataset: 'graphAlgorithm',
    };
  }
  return {};
}
