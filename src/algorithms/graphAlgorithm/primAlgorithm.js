/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { GRAPH_EDGE_STATES, GRAPH_NODE_STATES } from '../../constants/index.js';
import i18n from '../../i18n/index.js';
import { PriorityQueue } from '../../utils/PriorityQueue.js';
import {
  ALGORITHM_STEPS,
  getAlgorithmDescription,
} from '../../utils/algorithmTranslations.js';
import {
  buildEdgeIdByEndpoints,
  ensureVisibleNodes,
  labelById,
  makeNodeLinkStep,
  makeUndirectedEdgeId,
  sortNodeIds,
} from './shared.js';

function collectNodeIds(nodes, edges) {
  const ids = new Set(nodes.map(node => node.id));
  edges.forEach(edge => {
    ids.add(edge.from);
    ids.add(edge.to);
  });
  return sortNodeIds([...ids]);
}

function sortEdgesByWeight(edges) {
  return [...edges].sort((left, right) => {
    if ((left.weight ?? 0) !== (right.weight ?? 0)) {
      return (left.weight ?? 0) - (right.weight ?? 0);
    }

    const leftKey = makeUndirectedEdgeId(left.from, left.to);
    const rightKey = makeUndirectedEdgeId(right.from, right.to);
    return leftKey.localeCompare(rightKey, undefined, { numeric: true });
  });
}

function buildAdjacency(edges) {
  /** @type {Record<string, Array<{to: string, weight: number, edge: object}>>} */
  const adjacency = {};

  edges.forEach(edge => {
    if (!adjacency[edge.from]) adjacency[edge.from] = [];
    if (!adjacency[edge.to]) adjacency[edge.to] = [];

    adjacency[edge.from].push({
      to: edge.to,
      weight: edge.weight ?? 0,
      edge,
    });
    adjacency[edge.to].push({
      to: edge.from,
      weight: edge.weight ?? 0,
      edge,
    });
  });

  Object.values(adjacency).forEach(neighbors => {
    neighbors.sort((left, right) => {
      if (left.weight !== right.weight) return left.weight - right.weight;
      return left.to.localeCompare(right.to, undefined, { numeric: true });
    });
  });

  return adjacency;
}

function formatEdgeLabel(edge, labels) {
  return `${labels[edge.from] ?? edge.from}-${labels[edge.to] ?? edge.to}(${edge.weight})`;
}

function getBestLiveEdge(pq, visited) {
  return pq.values.find(item => !visited.has(item.val.to))?.val.edge ?? null;
}

function buildGraphArtifacts(labels, bestEdge, totalWeight) {
  return {
    badges: [
      {
        id: 'frontier',
        text: i18n.t('visualization.frontierEdgeBadge', {
          edge: bestEdge ? formatEdgeLabel(bestEdge, labels) : '∅',
          defaultValue: bestEdge
            ? formatEdgeLabel(bestEdge, labels)
            : 'Next frontier edge: ∅',
        }),
      },
      {
        id: 'weight',
        text: i18n.t('visualization.totalWeightBadge', {
          weight: totalWeight,
          defaultValue: `Total weight: ${totalWeight}`,
        }),
      },
    ],
  };
}

function paintNodeStates(nodes, visited, currentEdge = null) {
  /** @type {Record<string, string>} */
  const states = {};

  for (const node of nodes) {
    if (
      currentEdge &&
      (node.id === currentEdge.from || node.id === currentEdge.to)
    ) {
      states[node.id] = GRAPH_NODE_STATES.CURRENT;
    } else if (visited.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.PATH;
    } else {
      states[node.id] = GRAPH_NODE_STATES.DEFAULT;
    }
  }

  return states;
}

function seedFrontier(pq, adjacency, from, edgeOrder, visited) {
  for (const candidate of adjacency[from] ?? []) {
    if (visited.has(candidate.to)) continue;
    pq.enqueue(candidate, [
      candidate.weight,
      edgeOrder.get(
        candidate.edge.id ??
          makeUndirectedEdgeId(candidate.edge.from, candidate.edge.to)
      ) ?? 0,
    ]);
  }
}

/**
 * @param {{ nodes?: Array<{id: string}>, edges?: Array<{id?: string, from: string, to: string, weight?: number}> }} input
 * @returns {{ mstEdges: Array, totalWeight: number, startNode: string | null }}
 */
export function primAlgorithmPure({ nodes = [], edges = [] }) {
  const ids = collectNodeIds(nodes, edges);
  if (ids.length === 0) {
    return { mstEdges: [], totalWeight: 0, startNode: null };
  }

  const sortedEdges = sortEdgesByWeight(edges);
  const edgeOrder = new Map(
    sortedEdges.map((edge, index) => [
      edge.id ?? makeUndirectedEdgeId(edge.from, edge.to),
      index,
    ])
  );
  const adjacency = buildAdjacency(sortedEdges);
  const pq = new PriorityQueue();
  const visited = new Set([ids[0]]);
  const mstEdges = [];
  let totalWeight = 0;

  seedFrontier(pq, adjacency, ids[0], edgeOrder, visited);

  while (!pq.isEmpty() && visited.size < ids.length) {
    const { val } = pq.dequeue();
    if (visited.has(val.to)) continue;

    visited.add(val.to);
    mstEdges.push({ ...val.edge });
    totalWeight += val.weight;
    seedFrontier(pq, adjacency, val.to, edgeOrder, visited);
  }

  return {
    mstEdges,
    totalWeight,
    startNode: ids[0],
  };
}

/**
 * @param {Object} input
 * @param {Array<{ id: string, x: number, y: number, label?: string }>} input.nodes
 * @param {Array<{ id?: string, from: string, to: string, weight?: number }>} input.edges
 * @returns {Array}
 */
export function primAlgorithm({ nodes = [], edges = [] }) {
  const visibleNodes = ensureVisibleNodes(nodes, {});
  const labels = labelById(visibleNodes);
  const ids = collectNodeIds(visibleNodes, edges);
  if (ids.length === 0) return [];

  const sortedEdges = sortEdgesByWeight(edges);
  const edgeOrder = new Map(
    sortedEdges.map((edge, index) => [
      edge.id ?? makeUndirectedEdgeId(edge.from, edge.to),
      index,
    ])
  );
  const adjacency = buildAdjacency(sortedEdges);
  const edgeIdByEndpoints = buildEdgeIdByEndpoints(edges, false);
  const pq = new PriorityQueue();
  const visited = new Set([ids[0]]);
  const selectedEdges = [];
  const edgeStates = {};
  const steps = [];
  let totalWeight = 0;

  const push = (description, currentEdge = null) => {
    steps.push(
      makeNodeLinkStep({
        nodes: visibleNodes,
        edges,
        nodeStates: paintNodeStates(visibleNodes, visited, currentEdge),
        edgeStates,
        stackOrder: [],
        outputOrder: [],
        description,
        graphArtifacts: buildGraphArtifacts(
          labels,
          getBestLiveEdge(pq, visited),
          totalWeight
        ),
        directed: false,
        weighted: true,
      })
    );
  };

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.PRIM_START, {
      node: labels[ids[0]] ?? ids[0],
    })
  );

  seedFrontier(pq, adjacency, ids[0], edgeOrder, visited);
  const initialBestEdge = getBestLiveEdge(pq, visited);
  if (initialBestEdge) {
    push(
      getAlgorithmDescription(ALGORITHM_STEPS.PRIM_FRONTIER, {
        edge: formatEdgeLabel(initialBestEdge, labels),
      })
    );
  }

  while (!pq.isEmpty() && visited.size < ids.length) {
    const { val } = pq.dequeue();
    if (visited.has(val.to)) continue;

    const edgeId =
      val.edge.id ??
      edgeIdByEndpoints.get(makeUndirectedEdgeId(val.edge.from, val.edge.to)) ??
      makeUndirectedEdgeId(val.edge.from, val.edge.to);

    visited.add(val.to);
    selectedEdges.push(val.edge);
    totalWeight += val.weight;
    edgeStates[edgeId] = GRAPH_EDGE_STATES.SELECTED;

    push(
      getAlgorithmDescription(ALGORITHM_STEPS.PRIM_SELECT_EDGE, {
        from: labels[val.edge.from] ?? val.edge.from,
        to: labels[val.edge.to] ?? val.edge.to,
        weight: val.weight,
        totalWeight,
      }),
      val.edge
    );

    seedFrontier(pq, adjacency, val.to, edgeOrder, visited);
    const bestEdge = getBestLiveEdge(pq, visited);
    if (bestEdge && visited.size < ids.length) {
      push(
        getAlgorithmDescription(ALGORITHM_STEPS.PRIM_FRONTIER, {
          edge: formatEdgeLabel(bestEdge, labels),
        })
      );
    }
  }

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.PRIM_FINISH, {
      totalWeight,
      count: selectedEdges.length,
    })
  );

  return steps;
}
