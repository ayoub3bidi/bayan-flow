/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRAPH_EDGE_STATES, GRAPH_NODE_STATES } from '../../constants/index.js';
import i18n from '../../i18n/index.js';
import { GRAPH_REPRESENTATIONS } from '../../registry/graphAlgorithmRegistry.js';
import {
  ALGORITHM_STEPS,
  getAlgorithmDescription,
} from '../../utils/algorithmTranslations.js';
import {
  buildEdgeIdByEndpoints,
  cloneEdges,
  cloneNodes,
  ensureVisibleNodes,
  labelById,
  makeEdgeId,
  normalizeAdjacency,
  sortNodeIds,
} from './shared.js';

function formatBadgeText(labelKey, labels) {
  return i18n.t(labelKey, {
    order: labels.join(' → '),
    defaultValue: labels.join(' → '),
  });
}

function paintNodeStates(
  nodes,
  temporary,
  permanent,
  currentId,
  finalOrder,
  cycleIds
) {
  const finalSet = new Set(finalOrder);
  const cycleSet = new Set(cycleIds);
  /** @type {Record<string, string>} */
  const states = {};

  for (const node of nodes) {
    if (cycleSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.CYCLE;
    } else if (finalSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.PATH;
    } else if (node.id === currentId) {
      states[node.id] = GRAPH_NODE_STATES.CURRENT;
    } else if (temporary.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.FRONTIER;
    } else if (permanent.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.VISITED;
    } else {
      states[node.id] = GRAPH_NODE_STATES.DEFAULT;
    }
  }

  return states;
}

/**
 * @param {Object} args
 * @param {Array} args.nodes
 * @param {Array} args.edges
 * @param {Record<string, string>} args.nodeStates
 * @param {Record<string, string>} args.edgeStates
 * @param {string[]} args.stackOrder
 * @param {string[]} args.outputOrder
 * @param {string} args.description
 * @param {Object} [args.graphArtifacts]
 * @param {boolean} [args.hasCycle]
 */
function makeStep({
  nodes,
  edges,
  nodeStates,
  edgeStates,
  stackOrder,
  outputOrder,
  description,
  graphArtifacts = {},
  hasCycle = false,
}) {
  return {
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    stackOrder: [...stackOrder],
    outputOrder: [...outputOrder],
    description,
    representation: GRAPH_REPRESENTATIONS.NODE_LINK,
    graphArtifacts: { ...graphArtifacts },
    hasCycle,
  };
}

/**
 * DFS-based topological sort for validation and tests.
 *
 * @param {Record<string, string[]>} adjacency
 * @returns {{ order: string[], hasCycle: boolean }}
 */
export function topologicalSortPure(adjacency) {
  const graph = normalizeAdjacency(adjacency);
  const ids = sortNodeIds(Object.keys(graph));
  const temporary = new Set();
  const permanent = new Set();
  const finishStack = [];
  let hasCycle = false;

  function dfs(id) {
    if (temporary.has(id)) {
      hasCycle = true;
      return;
    }
    if (permanent.has(id) || hasCycle) return;

    temporary.add(id);
    for (const next of graph[id] ?? []) {
      dfs(next);
      if (hasCycle) return;
    }
    temporary.delete(id);
    permanent.add(id);
    finishStack.push(id);
  }

  for (const id of ids) {
    if (!permanent.has(id)) dfs(id);
    if (hasCycle) return { order: [], hasCycle: true };
  }

  return { order: finishStack.reverse(), hasCycle: false };
}

/**
 * @param {string[]} order
 * @param {Record<string, string[]>} adjacency
 * @returns {boolean}
 */
export function isValidTopologicalOrder(order, adjacency) {
  const graph = normalizeAdjacency(adjacency);
  const ids = Object.keys(graph);
  if (order.length !== ids.length) return false;

  const position = new Map(order.map((id, index) => [id, index]));
  if (position.size !== ids.length) return false;
  for (const id of ids) {
    if (!position.has(id)) return false;
  }

  for (const [from, neighbors] of Object.entries(graph)) {
    for (const to of neighbors) {
      if (position.get(from) >= position.get(to)) return false;
    }
  }
  return true;
}

/**
 * @param {Object} input
 * @param {Array<{ id: string, x: number, y: number, label?: string }>} input.nodes
 * @param {Array<{ id?: string, from: string, to: string, weight?: number }>} input.edges
 * @param {Record<string, string[]>} input.adjacency
 * @returns {Array}
 */
export function topologicalSort({ nodes = [], edges = [], adjacency = {} }) {
  const graph = normalizeAdjacency(adjacency);
  const ids =
    nodes.length > 0
      ? nodes.map(node => node.id)
      : sortNodeIds(Object.keys(graph));
  const visibleNodes = ensureVisibleNodes(nodes, graph);
  const labels = labelById(visibleNodes);
  const edgeIdByEndpoints = buildEdgeIdByEndpoints(edges);
  const steps = [];
  const temporary = new Set();
  const permanent = new Set();
  const finishStack = [];
  const edgeStates = {};
  let hasCycle = false;

  const buildGraphArtifacts = (frontierIds, resultIds) => {
    const badges = [];
    if (frontierIds.length > 0) {
      badges.push({
        id: 'frontier',
        text: formatBadgeText(
          'visualization.recursionStackBadge',
          frontierIds.map(nodeId => labels[nodeId] ?? nodeId)
        ),
      });
    }
    if (resultIds.length > 0) {
      badges.push({
        id: 'result',
        text: formatBadgeText(
          'visualization.topologicalOrderBadge',
          resultIds.map(nodeId => labels[nodeId] ?? nodeId)
        ),
      });
    }
    return { badges };
  };

  const push = (
    description,
    currentId = null,
    finalOrder = [],
    cycleIds = []
  ) => {
    steps.push(
      makeStep({
        nodes: visibleNodes,
        edges,
        nodeStates: paintNodeStates(
          visibleNodes,
          temporary,
          permanent,
          currentId,
          finalOrder,
          cycleIds
        ),
        edgeStates,
        stackOrder: [...temporary],
        outputOrder: hasCycle
          ? []
          : finalOrder.length > 0
            ? finalOrder
            : [...finishStack],
        description,
        graphArtifacts: buildGraphArtifacts(
          [...temporary],
          hasCycle || finalOrder.length === 0 ? [] : finalOrder
        ),
        hasCycle,
      })
    );
  };

  push(getAlgorithmDescription(ALGORITHM_STEPS.TOPOLOGICAL_START));

  function dfs(id) {
    if (hasCycle) return;
    temporary.add(id);
    push(
      getAlgorithmDescription(ALGORITHM_STEPS.TOPOLOGICAL_ENTER, {
        node: labels[id] ?? id,
      }),
      id
    );

    for (const next of graph[id] ?? []) {
      const edgeId =
        edgeIdByEndpoints.get(makeEdgeId(id, next)) ?? makeEdgeId(id, next);
      edgeStates[edgeId] = GRAPH_EDGE_STATES.ACTIVE;
      push(
        getAlgorithmDescription(ALGORITHM_STEPS.TOPOLOGICAL_EXPLORE_EDGE, {
          from: labels[id] ?? id,
          to: labels[next] ?? next,
        }),
        id
      );

      if (temporary.has(next)) {
        hasCycle = true;
        edgeStates[edgeId] = GRAPH_EDGE_STATES.CYCLE;
        push(
          getAlgorithmDescription(ALGORITHM_STEPS.TOPOLOGICAL_CYCLE, {
            from: labels[id] ?? id,
            to: labels[next] ?? next,
          }),
          next,
          [],
          [id, next]
        );
        return;
      }

      if (!permanent.has(next)) {
        dfs(next);
        if (hasCycle) return;
      }

      edgeStates[edgeId] = GRAPH_EDGE_STATES.VISITED;
    }

    temporary.delete(id);
    permanent.add(id);
    finishStack.push(id);
    push(
      getAlgorithmDescription(ALGORITHM_STEPS.TOPOLOGICAL_COMPLETE_NODE, {
        node: labels[id] ?? id,
        stack: finishStack.map(nodeId => labels[nodeId] ?? nodeId).join(', '),
      }),
      null
    );
  }

  for (const id of ids) {
    if (!permanent.has(id)) {
      dfs(id);
      if (hasCycle) return steps;
    }
  }

  const order = [...finishStack].reverse();
  push(
    getAlgorithmDescription(ALGORITHM_STEPS.TOPOLOGICAL_FINISH, {
      order: order.map(id => labels[id] ?? id).join(', '),
    }),
    null,
    order
  );

  return steps;
}
