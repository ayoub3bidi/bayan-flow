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

function createUnionFind(ids) {
  const parent = Object.fromEntries(ids.map(id => [id, id]));
  const rank = Object.fromEntries(ids.map(id => [id, 0]));

  function find(id) {
    if (parent[id] !== id) {
      parent[id] = find(parent[id]);
    }
    return parent[id];
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return false;

    if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;
    } else {
      parent[rootB] = rootA;
      rank[rootA] += 1;
    }

    return true;
  }

  function countComponents() {
    return new Set(ids.map(find)).size;
  }

  return { find, union, countComponents };
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

function formatEdgeLabel(edge, labels) {
  return `${labels[edge.from] ?? edge.from}-${labels[edge.to] ?? edge.to}(${edge.weight})`;
}

function buildGraphArtifacts(sortedEdges, labels, edgeIndex, totalWeight) {
  const remaining = sortedEdges
    .slice(edgeIndex)
    .map(edge => formatEdgeLabel(edge, labels));
  const queuePreview = remaining.slice(0, 4);
  const queueText =
    remaining.length > 4
      ? [...queuePreview, '…'].join(' → ')
      : queuePreview.join(' → ') || '∅';

  return {
    badges: [
      {
        id: 'remaining',
        text: i18n.t('visualization.edgeQueueBadge', {
          order: queueText,
          defaultValue: `Remaining edges: ${queueText}`,
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

function paintNodeStates(nodes, selectedEdges, currentEdge = null) {
  const selectedNodes = new Set(
    selectedEdges.flatMap(edge => [edge.from, edge.to])
  );
  /** @type {Record<string, string>} */
  const states = {};

  for (const node of nodes) {
    if (
      currentEdge &&
      (node.id === currentEdge.from || node.id === currentEdge.to)
    ) {
      states[node.id] = GRAPH_NODE_STATES.CURRENT;
    } else if (selectedNodes.has(node.id)) {
      states[node.id] = GRAPH_NODE_STATES.PATH;
    } else {
      states[node.id] = GRAPH_NODE_STATES.DEFAULT;
    }
  }

  return states;
}

/**
 * @param {{ nodes?: Array<{id: string}>, edges?: Array<{from: string, to: string, weight: number}> }} input
 * @returns {{ mstEdges: Array, totalWeight: number, componentCount: number }}
 */
export function kruskalAlgorithmPure({ nodes = [], edges = [] }) {
  const ids = collectNodeIds(nodes, edges);
  const unionFind = createUnionFind(ids);
  const mstEdges = [];
  let totalWeight = 0;

  for (const edge of sortEdgesByWeight(edges)) {
    if (unionFind.union(edge.from, edge.to)) {
      mstEdges.push({ ...edge });
      totalWeight += edge.weight ?? 0;
    }
  }

  return {
    mstEdges,
    totalWeight,
    componentCount: unionFind.countComponents(),
  };
}

/**
 * @param {Object} input
 * @param {Array<{ id: string, x: number, y: number, label?: string }>} input.nodes
 * @param {Array<{ id?: string, from: string, to: string, weight?: number }>} input.edges
 * @returns {Array}
 */
export function kruskalAlgorithm({ nodes = [], edges = [] }) {
  const visibleNodes = ensureVisibleNodes(nodes, {});
  const labels = labelById(visibleNodes);
  const sortedEdges = sortEdgesByWeight(edges);
  const ids = collectNodeIds(visibleNodes, sortedEdges);
  const unionFind = createUnionFind(ids);
  const edgeIdByEndpoints = buildEdgeIdByEndpoints(edges, false);
  const selectedEdges = [];
  const edgeStates = {};
  const steps = [];
  let totalWeight = 0;

  const push = (description, edgeIndex, currentEdge = null) => {
    steps.push(
      makeNodeLinkStep({
        nodes: visibleNodes,
        edges,
        nodeStates: paintNodeStates(visibleNodes, selectedEdges, currentEdge),
        edgeStates,
        stackOrder: [],
        outputOrder: [],
        description,
        graphArtifacts: buildGraphArtifacts(
          sortedEdges,
          labels,
          edgeIndex,
          totalWeight
        ),
        directed: false,
        weighted: true,
      })
    );
  };

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.KRUSKAL_START, {
      count: sortedEdges.length,
    }),
    0
  );

  sortedEdges.forEach((edge, index) => {
    const edgeId =
      edge.id ??
      edgeIdByEndpoints.get(makeUndirectedEdgeId(edge.from, edge.to)) ??
      makeUndirectedEdgeId(edge.from, edge.to);
    edgeStates[edgeId] = GRAPH_EDGE_STATES.ACTIVE;

    if (unionFind.union(edge.from, edge.to)) {
      selectedEdges.push(edge);
      totalWeight += edge.weight ?? 0;
      push(
        getAlgorithmDescription(ALGORITHM_STEPS.KRUSKAL_SELECT_EDGE, {
          from: labels[edge.from] ?? edge.from,
          to: labels[edge.to] ?? edge.to,
          weight: edge.weight ?? 0,
          totalWeight,
        }),
        index + 1,
        edge
      );
      edgeStates[edgeId] = GRAPH_EDGE_STATES.SELECTED;
    } else {
      push(
        getAlgorithmDescription(ALGORITHM_STEPS.KRUSKAL_REJECT_EDGE, {
          from: labels[edge.from] ?? edge.from,
          to: labels[edge.to] ?? edge.to,
          weight: edge.weight ?? 0,
        }),
        index + 1,
        edge
      );
      edgeStates[edgeId] = GRAPH_EDGE_STATES.CYCLE;
    }
  });

  push(
    getAlgorithmDescription(ALGORITHM_STEPS.KRUSKAL_FINISH, {
      totalWeight,
      components: unionFind.countComponents(),
    }),
    sortedEdges.length
  );

  return steps;
}
