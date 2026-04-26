/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ALGORITHM_TYPES,
  TREE_NODE_STATES,
  VISUALIZATION_MODES,
  DEFAULT_TREE_NODE_COUNT,
} from '../constants/index.js';
import { soundManager } from '../utils/soundManager.js';
import { useVisualization } from './useVisualization.js';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';
import { generateTreeForTraversal } from '../utils/treeGenerators.js';

/**
 * Initial node states before playback (all pending / default).
 *
 * @param {Array<{ id: string }>} nodes
 */
function initialTreeNodeStates(nodes) {
  /** @type {Record<string, string>} */
  const st = {};
  for (const n of nodes) {
    st[n.id] = TREE_NODE_STATES.DEFAULT;
  }
  return st;
}

/**
 * Visualization controller for tree traversal algorithms on generated binary trees.
 *
 * @param {string} algorithmKey
 * @param {number} speed
 * @param {string} mode
 * @param {number} [treeNodeCount]
 */
export function useTreeTraversalVisualization(
  algorithmKey,
  speed,
  mode = VISUALIZATION_MODES.MANUAL,
  treeNodeCount = DEFAULT_TREE_NODE_COUNT
) {
  const [treeNodes, setTreeNodes] = useState([]);
  const [treeEdges, setTreeEdges] = useState([]);
  const [treeNodeStates, setTreeNodeStates] = useState({});
  const [visitOrder, setVisitOrder] = useState([]);
  const [queueOrder, setQueueOrder] = useState([]);
  const [treeContext, setTreeContext] = useState(null);

  const executeStep = useCallback(step => {
    setTreeNodes(step.nodes ?? []);
    setTreeEdges(step.edges ?? []);
    setTreeNodeStates(step.nodeStates ?? {});
    setVisitOrder(step.visitOrder ?? []);
    setQueueOrder(step.queueOrder ?? []);

    const states = step.nodeStates ?? {};
    const hasVisiting = Object.values(states).includes(
      TREE_NODE_STATES.VISITING
    );
    if (hasVisiting) {
      soundManager.playNodeVisit();
    }
  }, []);

  const engine = useVisualization({ executeStep, speed, mode });

  const regenerateTreeStructure = useCallback(() => {
    engine.loadSteps([]);

    const tree = generateTreeForTraversal({
      nodeCount: treeNodeCount,
    });

    setTreeNodes(tree.nodes);
    setTreeEdges(tree.edges);
    setTreeNodeStates(initialTreeNodeStates(tree.nodes));
    setVisitOrder([]);
    setQueueOrder([]);
    setTreeContext(tree);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeNodeCount, engine.loadSteps]);

  useEffect(() => {
    regenerateTreeStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, treeNodeCount]);

  const loadStepsForCurrentAlgorithm = useCallback(() => {
    if (!algorithmKey || !treeContext) {
      engine.loadSteps([]);
      return;
    }
    const fn =
      CATEGORY_CONFIG[ALGORITHM_TYPES.TREE_TRAVERSAL].getAlgorithmFn(
        algorithmKey
      );
    if (fn) {
      engine.loadSteps(fn(treeContext));
      return;
    }
    engine.loadSteps([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, treeContext]);

  useEffect(() => {
    loadStepsForCurrentAlgorithm();
  }, [loadStepsForCurrentAlgorithm]);

  const regenerateTreeOuter = useCallback(() => {
    regenerateTreeStructure();
  }, [regenerateTreeStructure]);

  const reloadSteps = useCallback(() => {
    loadStepsForCurrentAlgorithm();
  }, [loadStepsForCurrentAlgorithm]);

  return {
    states: [],
    treeNodes,
    treeEdges,
    treeNodeStates,
    visitOrder,
    queueOrder,
    regenerateTree: regenerateTreeOuter,
    reloadSteps,
    ...engine,
  };
}
