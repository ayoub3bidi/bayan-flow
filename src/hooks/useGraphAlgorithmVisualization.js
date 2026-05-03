/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ALGORITHM_TYPES,
  DEFAULT_GRAPH_NODE_COUNT,
  GRAPH_NODE_STATES,
  VISUALIZATION_MODES,
} from '../constants/index.js';
import { soundManager } from '../utils/soundManager.js';
import { useVisualization } from './useVisualization.js';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';
import { generateRandomDag } from '../utils/graphAlgorithmGenerators.js';

function initialGraphNodeStates(nodes) {
  /** @type {Record<string, string>} */
  const states = {};
  for (const node of nodes) {
    states[node.id] = GRAPH_NODE_STATES.DEFAULT;
  }
  return states;
}

/**
 * Visualization controller for graph algorithms on generated node-link graphs.
 *
 * @param {string} algorithmKey
 * @param {number} speed
 * @param {string} mode
 * @param {number} [graphNodeCount]
 */
export function useGraphAlgorithmVisualization(
  algorithmKey,
  speed,
  mode = VISUALIZATION_MODES.MANUAL,
  graphNodeCount = DEFAULT_GRAPH_NODE_COUNT
) {
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);
  const [graphNodeStates, setGraphNodeStates] = useState({});
  const [graphEdgeStates, setGraphEdgeStates] = useState({});
  const [graphStackOrder, setGraphStackOrder] = useState([]);
  const [graphOutputOrder, setGraphOutputOrder] = useState([]);
  const [directed, setDirected] = useState(true);
  const [weighted, setWeighted] = useState(false);
  const [graphContext, setGraphContext] = useState(null);

  const executeStep = useCallback(step => {
    setGraphNodes(step.nodes ?? []);
    setGraphEdges(step.edges ?? []);
    setGraphNodeStates(step.nodeStates ?? {});
    setGraphEdgeStates(step.edgeStates ?? {});
    setGraphStackOrder(step.stackOrder ?? []);
    setGraphOutputOrder(step.outputOrder ?? []);

    const states = step.nodeStates ?? {};
    if (Object.values(states).includes(GRAPH_NODE_STATES.CURRENT)) {
      soundManager.playNodeVisit();
    }
  }, []);

  const engine = useVisualization({ executeStep, speed, mode });

  const regenerateGraphStructure = useCallback(() => {
    engine.loadSteps([]);

    const graph = generateRandomDag({ nodeCount: graphNodeCount });
    setGraphNodes(graph.nodes);
    setGraphEdges(graph.edges);
    setGraphNodeStates(initialGraphNodeStates(graph.nodes));
    setGraphEdgeStates({});
    setGraphStackOrder([]);
    setGraphOutputOrder([]);
    setDirected(graph.directed);
    setWeighted(graph.weighted);
    setGraphContext(graph);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphNodeCount, engine.loadSteps]);

  useEffect(() => {
    regenerateGraphStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, graphNodeCount]);

  const loadStepsForCurrentAlgorithm = useCallback(() => {
    if (!algorithmKey || !graphContext) {
      engine.loadSteps([]);
      return;
    }
    const fn =
      CATEGORY_CONFIG[ALGORITHM_TYPES.GRAPH_ALGORITHM].getAlgorithmFn(
        algorithmKey
      );
    if (fn) {
      engine.loadSteps(fn(graphContext));
      return;
    }
    engine.loadSteps([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, graphContext]);

  useEffect(() => {
    loadStepsForCurrentAlgorithm();
  }, [loadStepsForCurrentAlgorithm]);

  return {
    states: [],
    graphNodes,
    graphEdges,
    graphNodeStates,
    graphEdgeStates,
    graphStackOrder,
    graphOutputOrder,
    directed,
    weighted,
    regenerateGraph: regenerateGraphStructure,
    reloadSteps: loadStepsForCurrentAlgorithm,
    ...engine,
  };
}
