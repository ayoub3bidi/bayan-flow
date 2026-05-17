/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ALGORITHM_TYPES,
  DEFAULT_GRAPH_NODE_COUNT,
  GRAPH_NODE_STATES,
  VISUALIZATION_MODES,
} from '../constants/index.js';
import { soundManager } from '../utils/soundManager.js';
import { useVisualization } from './useVisualization.js';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';
import {
  createGraphInputForAlgorithm,
  getGraphAlgorithmProfile,
  getGraphAlgorithmScenarioOptions,
  GRAPH_REPRESENTATIONS,
  isGraphScenarioSupported,
} from '../registry/graphAlgorithmRegistry.js';

function initialGraphNodeStates(nodes) {
  /** @type {Record<string, string>} */
  const states = {};
  for (const node of nodes) {
    states[node.id] = GRAPH_NODE_STATES.DEFAULT;
  }
  return states;
}

function normalizeGraphAlgorithmSteps(steps, graphContext, profile) {
  return steps.map(step => ({
    ...step,
    nodes: step.nodes ?? graphContext?.nodes ?? [],
    edges: step.edges ?? graphContext?.edges ?? [],
    directed: step.directed ?? graphContext?.directed ?? profile?.directed,
    weighted: step.weighted ?? graphContext?.weighted ?? profile?.weighted,
    matrix: step.matrix ?? graphContext?.matrix ?? null,
    representation:
      step.representation ??
      profile?.representation ??
      GRAPH_REPRESENTATIONS.NODE_LINK,
    graphArtifacts: step.graphArtifacts ?? { badges: [] },
  }));
}

/**
 * Visualization controller for graph algorithms on generated node-link graphs.
 *
 * @param {string} algorithmKey
 * @param {number} speed
 * @param {string} mode
 * @param {number} [graphNodeCount]
 * @param {string} [scenarioId] - Optional preset scenario ID
 */
export function useGraphAlgorithmVisualization(
  algorithmKey,
  speed,
  mode = VISUALIZATION_MODES.MANUAL,
  graphNodeCount = DEFAULT_GRAPH_NODE_COUNT,
  scenarioId = null
) {
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);
  const [graphNodeStates, setGraphNodeStates] = useState({});
  const [graphEdgeStates, setGraphEdgeStates] = useState({});
  const [graphStackOrder, setGraphStackOrder] = useState([]);
  const [graphOutputOrder, setGraphOutputOrder] = useState([]);
  const [graphArtifacts, setGraphArtifacts] = useState({ badges: [] });
  const [graphMatrix, setGraphMatrix] = useState(null);
  const [representation, setRepresentation] = useState(
    GRAPH_REPRESENTATIONS.NODE_LINK
  );
  const [directed, setDirected] = useState(true);
  const [weighted, setWeighted] = useState(false);
  const [graphContext, setGraphContext] = useState(null);
  const graphContextRef = useRef(null);

  const profile = getGraphAlgorithmProfile(algorithmKey);
  const scenarioOptions = getGraphAlgorithmScenarioOptions(algorithmKey);
  const effectiveScenarioId = isGraphScenarioSupported(algorithmKey, scenarioId)
    ? scenarioId
    : null;

  const executeStep = useCallback(step => {
    const baseContext = graphContextRef.current;
    setGraphNodes(step.nodes ?? baseContext?.nodes ?? []);
    setGraphEdges(step.edges ?? baseContext?.edges ?? []);
    setGraphNodeStates(step.nodeStates ?? {});
    setGraphEdgeStates(step.edgeStates ?? {});
    setGraphStackOrder(step.stackOrder ?? []);
    setGraphOutputOrder(step.outputOrder ?? []);
    setGraphArtifacts(step.graphArtifacts ?? { badges: [] });
    setGraphMatrix(step.matrix ?? baseContext?.matrix ?? null);
    setRepresentation(
      step.representation ??
        baseContext?.representation ??
        GRAPH_REPRESENTATIONS.NODE_LINK
    );
    setDirected(step.directed ?? baseContext?.directed ?? true);
    setWeighted(step.weighted ?? baseContext?.weighted ?? false);

    const states = step.nodeStates ?? {};
    if (Object.values(states).includes(GRAPH_NODE_STATES.CURRENT)) {
      soundManager.playNodeVisit();
    }
  }, []);

  const engine = useVisualization({ executeStep, speed, mode });

  const regenerateGraphStructure = useCallback(() => {
    engine.loadSteps([]);

    const graph = createGraphInputForAlgorithm(algorithmKey, {
      nodeCount: graphNodeCount,
      scenarioId: effectiveScenarioId,
    });
    const representationValue =
      profile?.representation ?? GRAPH_REPRESENTATIONS.NODE_LINK;
    const nextContext = {
      ...graph,
      representation: representationValue,
      directed: graph.directed ?? profile?.directed ?? true,
      weighted: graph.weighted ?? profile?.weighted ?? false,
    };

    setGraphNodes(nextContext.nodes ?? []);
    setGraphEdges(nextContext.edges ?? []);
    setGraphNodeStates(initialGraphNodeStates(nextContext.nodes ?? []));
    setGraphEdgeStates({});
    setGraphStackOrder([]);
    setGraphOutputOrder([]);
    setGraphArtifacts({ badges: [] });
    setGraphMatrix(nextContext.matrix ?? null);
    setRepresentation(representationValue);
    setDirected(nextContext.directed);
    setWeighted(nextContext.weighted);
    graphContextRef.current = nextContext;
    setGraphContext(nextContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    algorithmKey,
    effectiveScenarioId,
    engine.loadSteps,
    graphNodeCount,
    profile?.directed,
    profile?.representation,
    profile?.weighted,
  ]);

  useEffect(() => {
    regenerateGraphStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, graphNodeCount, effectiveScenarioId]);

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
      engine.loadSteps(
        normalizeGraphAlgorithmSteps(fn(graphContext), graphContext, profile)
      );
      return;
    }
    engine.loadSteps([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, graphContext, profile]);

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
    graphArtifacts,
    graphMatrix,
    representation,
    directed,
    weighted,
    scenarioOptions,
    regenerateGraph: regenerateGraphStructure,
    reloadSteps: loadStepsForCurrentAlgorithm,
    ...engine,
  };
}
