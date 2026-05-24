/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRAPH_EDGE_STATES, GRAPH_NODE_STATES } from '../../constants/index.js';
import i18n from '../../i18n/index.js';
import {
  ALGORITHM_STEPS,
  getAlgorithmDescription,
} from '../../utils/algorithmTranslations.js';
import {
  buildEdgeIdByEndpoints,
  ensureVisibleNodes,
  formatBadgeText,
  labelById,
  makeEdgeId,
  makeNodeLinkStep,
  normalizeAdjacency,
  sortNodeIds,
} from './shared.js';

function insertSorted(queue, value) {
  let index = 0;
  while (
    index < queue.length &&
    String(queue[index]).localeCompare(String(value), undefined, {
      numeric: true,
    }) <= 0
  ) {
    index += 1;
  }
  queue.splice(index, 0, value);
}

function buildInDegrees(graph) {
  const inDegree = Object.fromEntries(
    sortNodeIds(Object.keys(graph)).map(id => [id, 0])
  );

  for (const neighbors of Object.values(graph)) {
    for (const next of neighbors) {
      inDegree[next] = (inDegree[next] ?? 0) + 1;
    }
  }

  return inDegree;
}

function initialQueue(ids, inDegree) {
  return sortNodeIds(ids.filter(id => inDegree[id] === 0));
}

function formatInDegreeBadge(ids, labels, inDegree) {
  const pairs = ids
    .map(id => `${labels[id] ?? id}:${inDegree[id] ?? 0}`)
    .join(', ');
  return i18n.t('visualization.inDegreeBadge', {
    pairs,
    defaultValue: `In-degrees: ${pairs}`,
  });
}

function paintNodeStates(
  nodes,
  frontier,
  outputOrder,
  currentId,
  cycleIds = []
) {
  const frontierSet = new Set(frontier);
  const outputSet = new Set(outputOrder);
  const cycleSet = new Set(cycleIds);
  /** @type {Record<string, string>} */
  const states = {};

  for (const node of nodes) {
    if (cycleSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.CYCLE;
    } else if (node.id === currentId) {
      states[node.id] = GRAPH_NODE_STATES.CURRENT;
    } else if (outputSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.PATH;
    } else if (frontierSet.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.FRONTIER;
    } else {
      states[node.id] = GRAPH_NODE_STATES.DEFAULT;
    }
  }

  return states;
}

function buildGraphArtifacts(ids, labels, queue, outputOrder, inDegree) {
  const badges = [
    {
      id: 'queue',
      text: formatBadgeText(
        'visualization.queueBadge',
        queue.map(id => labels[id] ?? id)
      ),
    },
    {
      id: 'indegree',
      text: formatInDegreeBadge(ids, labels, inDegree),
    },
  ];

  if (outputOrder.length > 0) {
    badges.push({
      id: 'result',
      text: formatBadgeText(
        'visualization.topologicalOrderBadge',
        outputOrder.map(id => labels[id] ?? id)
      ),
    });
  }

  return { badges };
}

/**
 * @param {Record<string, string[]>} adjacency
 * @returns {{ order: string[], hasCycle: boolean }}
 */
export function kahnAlgorithmPure(adjacency) {
  const graph = normalizeAdjacency(adjacency);
  const ids = sortNodeIds(Object.keys(graph));
  const inDegree = buildInDegrees(graph);
  const queue = initialQueue(ids, inDegree);
  const order = [];

  while (queue.length > 0) {
    const current = queue.shift();
    order.push(current);

    for (const next of graph[current] ?? []) {
      inDegree[next] -= 1;
      if (inDegree[next] === 0) {
        insertSorted(queue, next);
      }
    }
  }

  return {
    order,
    hasCycle: order.length !== ids.length,
  };
}

/**
 * @param {Object} input
 * @param {Array<{ id: string, x: number, y: number, label?: string }>} input.nodes
 * @param {Array<{ id?: string, from: string, to: string, weight?: number }>} input.edges
 * @param {Record<string, string[]>} input.adjacency
 * @returns {Array}
 */
export function kahnAlgorithm({ nodes = [], edges = [], adjacency = {} }) {
  const graph = normalizeAdjacency(adjacency);
  const ids =
    nodes.length > 0
      ? nodes.map(node => node.id)
      : sortNodeIds(Object.keys(graph));
  const visibleNodes = ensureVisibleNodes(nodes, graph);
  const labels = labelById(visibleNodes);
  const edgeIdByEndpoints = buildEdgeIdByEndpoints(edges);
  const inDegree = buildInDegrees(graph);
  const queue = initialQueue(ids, inDegree);
  const edgeStates = {};
  const outputOrder = [];
  const steps = [];

  const push = (description, currentId = null, cycleIds = []) => {
    steps.push(
      makeNodeLinkStep({
        nodes: visibleNodes,
        edges,
        nodeStates: paintNodeStates(
          visibleNodes,
          queue,
          outputOrder,
          currentId,
          cycleIds
        ),
        edgeStates,
        stackOrder: queue,
        outputOrder,
        description,
        graphArtifacts: buildGraphArtifacts(
          ids,
          labels,
          queue,
          outputOrder,
          inDegree
        ),
        directed: true,
        weighted: false,
        hasCycle: cycleIds.length > 0,
      })
    );
  };

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.KAHN_START, {
      queue: queue.map(id => labels[id] ?? id).join(', ') || '∅',
    })
  );

  while (queue.length > 0) {
    const current = queue.shift();
    outputOrder.push(current);

    push(
      getAlgorithmDescription(ALGORITHM_STEPS.KAHN_DEQUEUE, {
        node: labels[current] ?? current,
        order: outputOrder.map(id => labels[id] ?? id).join(', '),
      }),
      current
    );

    for (const next of graph[current] ?? []) {
      const edgeId =
        edgeIdByEndpoints.get(makeEdgeId(current, next)) ??
        makeEdgeId(current, next);
      edgeStates[edgeId] = GRAPH_EDGE_STATES.ACTIVE;
      inDegree[next] -= 1;

      if (inDegree[next] === 0) {
        insertSorted(queue, next);
        push(
          getAlgorithmDescription(ALGORITHM_STEPS.KAHN_ENQUEUE, {
            from: labels[current] ?? current,
            node: labels[next] ?? next,
          }),
          current
        );
      } else {
        push(
          getAlgorithmDescription(ALGORITHM_STEPS.KAHN_RELAX_EDGE, {
            from: labels[current] ?? current,
            to: labels[next] ?? next,
            inDegree: inDegree[next],
          }),
          current
        );
      }

      edgeStates[edgeId] = GRAPH_EDGE_STATES.VISITED;
    }
  }

  if (outputOrder.length !== ids.length) {
    const cycleIds = ids.filter(id => !outputOrder.includes(id));
    for (const edge of edges) {
      if (cycleIds.includes(edge.from) && cycleIds.includes(edge.to)) {
        edgeStates[edge.id ?? makeEdgeId(edge.from, edge.to)] =
          GRAPH_EDGE_STATES.CYCLE;
      }
    }

    push(
      getAlgorithmDescription(ALGORITHM_STEPS.KAHN_CYCLE, {
        count: outputOrder.length,
        total: ids.length,
      }),
      null,
      cycleIds
    );
    return steps;
  }

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.KAHN_FINISH, {
      order: outputOrder.map(id => labels[id] ?? id).join(', '),
    })
  );

  return steps;
}
