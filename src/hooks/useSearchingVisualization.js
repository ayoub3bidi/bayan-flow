/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ELEMENT_STATES,
  GRAPH_NODE_STATES,
  ALGORITHM_TYPES,
  VISUALIZATION_MODES,
  DEFAULT_SEARCH_GRAPH_NODE_COUNT,
} from '../constants/index.js';
import { soundManager } from '../utils/soundManager.js';
import { useVisualization } from './useVisualization.js';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';
import { isNodeLinkSearchingAlgorithm } from '../registry/searchingSubstrate.js';
import { generateRandomSearchTree } from '../utils/graphSearchGenerators.js';

function pickTargetFromArray(arr) {
  if (!arr?.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function initialGraphNodeStates(nodes, rootId, goalId) {
  /** @type {Record<string, string>} */
  const st = {};
  for (const n of nodes) {
    st[n.id] = GRAPH_NODE_STATES.DEFAULT;
  }
  st[rootId] = GRAPH_NODE_STATES.ROOT;
  st[goalId] = GRAPH_NODE_STATES.GOAL;
  return st;
}

/**
 * Visualization controller for searching: sorted-array searches and node–link graph traversal.
 *
 * @param {string} algorithmKey
 * @param {number[]} initialArray — sorted ascending for array-based searches
 * @param {number} speed
 * @param {string} mode
 * @param {number} [searchGraphNodeCount] — node count for graph-based searching (not pathfinding grid size)
 */
export function useSearchingVisualization(
  algorithmKey,
  initialArray,
  speed,
  mode = VISUALIZATION_MODES.MANUAL,
  searchGraphNodeCount = DEFAULT_SEARCH_GRAPH_NODE_COUNT
) {
  const [array, setArray] = useState(initialArray);
  const [arrayStates, setArrayStates] = useState(() =>
    Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT)
  );
  const [targetValue, setTargetValue] = useState(null);

  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);
  const [graphNodeStates, setGraphNodeStates] = useState({});
  const [graphStackOrder, setGraphStackOrder] = useState([]);
  const [graphContext, setGraphContext] = useState(null);

  const executeStep = useCallback(
    step => {
      if (isNodeLinkSearchingAlgorithm(algorithmKey)) {
        setGraphNodes(step.nodes ?? []);
        setGraphEdges(step.edges ?? []);
        setGraphNodeStates(step.nodeStates ?? {});
        setGraphStackOrder(step.stackOrder ?? []);

        const states = step.nodeStates ?? {};
        const hasFrontier = Object.values(states).includes(
          GRAPH_NODE_STATES.FRONTIER
        );
        const hasPath = Object.values(states).includes(GRAPH_NODE_STATES.PATH);
        const desc = (step.description ?? '').toLowerCase();

        if (hasPath && desc.includes('path')) {
          soundManager.playPathFound();
        } else if (hasFrontier) {
          soundManager.playNodeVisit();
        }
        return;
      }

      setArray(step.array);
      setArrayStates(step.states);
      if (step.targetValue !== undefined && step.targetValue !== null) {
        setTargetValue(step.targetValue);
      }

      const hasComparing = step.states.includes(ELEMENT_STATES.COMPARING);
      if (hasComparing) {
        const idx = step.states.indexOf(ELEMENT_STATES.COMPARING);
        soundManager.playCompare(step.array[idx]);
      }
    },
    [algorithmKey]
  );

  const engine = useVisualization({ executeStep, speed, mode });

  const regenerateGraphStructure = useCallback(() => {
    engine.loadSteps([]);

    const { nodes, edges, adjacency, rootId, goalId } =
      generateRandomSearchTree({
        nodeCount: searchGraphNodeCount,
        maxChildren: 3,
      });

    setGraphNodes(nodes);
    setGraphEdges(edges);
    setGraphNodeStates(initialGraphNodeStates(nodes, rootId, goalId));
    setGraphStackOrder([]);
    setGraphContext({ adjacency, rootId, goalId, nodes, edges });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchGraphNodeCount, engine.loadSteps]);

  useEffect(() => {
    if (!isNodeLinkSearchingAlgorithm(algorithmKey)) {
      return;
    }
    regenerateGraphStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, searchGraphNodeCount]);

  const loadStepsForArrayAlgorithm = useCallback(() => {
    setArray(initialArray);
    setArrayStates(Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT));

    if (!algorithmKey || !initialArray?.length) {
      setTargetValue(null);
      engine.loadSteps([]);
      return;
    }

    const target = pickTargetFromArray(initialArray);
    setTargetValue(target);

    const fn =
      CATEGORY_CONFIG[ALGORITHM_TYPES.SEARCHING].getAlgorithmFn(algorithmKey);
    if (fn && target !== null) {
      engine.loadSteps(fn(initialArray, target));
      return;
    }

    engine.loadSteps([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, initialArray]);

  const loadStepsForGraphAlgorithm = useCallback(() => {
    if (!isNodeLinkSearchingAlgorithm(algorithmKey)) {
      return;
    }
    if (!algorithmKey || !graphContext) {
      engine.loadSteps([]);
      return;
    }
    const fn =
      CATEGORY_CONFIG[ALGORITHM_TYPES.SEARCHING].getAlgorithmFn(algorithmKey);
    if (fn) {
      const { adjacency, rootId, goalId, nodes, edges } = graphContext;
      engine.loadSteps(
        fn({
          adjacency,
          rootId,
          goalId,
          nodes,
          edges,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, graphContext]);

  useEffect(() => {
    if (isNodeLinkSearchingAlgorithm(algorithmKey)) {
      return;
    }
    loadStepsForArrayAlgorithm();
  }, [algorithmKey, loadStepsForArrayAlgorithm]);

  useEffect(() => {
    if (!isNodeLinkSearchingAlgorithm(algorithmKey)) {
      return;
    }
    loadStepsForGraphAlgorithm();
  }, [algorithmKey, loadStepsForGraphAlgorithm]);

  const regenerateGraphStructureOuter = useCallback(() => {
    if (isNodeLinkSearchingAlgorithm(algorithmKey)) {
      regenerateGraphStructure();
    }
  }, [algorithmKey, regenerateGraphStructure]);

  const reloadSteps = useCallback(() => {
    if (isNodeLinkSearchingAlgorithm(algorithmKey)) {
      loadStepsForGraphAlgorithm();
      return;
    }
    loadStepsForArrayAlgorithm();
  }, [algorithmKey, loadStepsForGraphAlgorithm, loadStepsForArrayAlgorithm]);

  const isGraph = isNodeLinkSearchingAlgorithm(algorithmKey);

  return {
    array: isGraph ? [] : array,
    states: isGraph ? [] : arrayStates,
    targetValue: isGraph ? null : targetValue,
    graphNodes,
    graphEdges,
    graphNodeStates,
    graphStackOrder,
    regenerateGraphStructure: regenerateGraphStructureOuter,
    reloadSteps,
    ...engine,
  };
}
